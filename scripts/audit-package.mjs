import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import postcss from "postcss";

export async function readTree(directory, selectContent = () => true) {
  const files = new Map();
  for (const entry of await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    const absolute = join(entry.parentPath, entry.name);
    const relative = absolute.slice(directory.length + 1).replaceAll("\\", "/");
    files.set(
      relative,
      selectContent(relative) ? await readFile(absolute, "utf8") : "",
    );
  }
  return files;
}

function matchingFiles(files, target) {
  const [prefix, suffix] = target.split("*");
  return target.includes("*")
    ? [...files.keys()].filter(
        (name) => name.startsWith(prefix) && name.endsWith(suffix),
      )
    : files.has(target)
      ? [target]
      : [];
}

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function targets(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(targets);
  if (record(value)) return Object.values(value).flatMap(targets);
  return [];
}

function isClient(code) {
  const source = ts.createSourceFile(
    "module.js",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  for (const statement of source.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    )
      break;
    if (statement.expression.text === "use client") return true;
  }
  return false;
}

function imports(code) {
  const result = [];
  const source = ts.createSourceFile(
    "module.js",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      result.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteral(argument)) result.push(argument.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

function auditDeclarations(files, entries) {
  const root = "/artifact/";

  const host = {
    fileExists: (name) =>
      name.startsWith(root) && files.has(name.slice(root.length)),
    readFile: (name) =>
      name.startsWith(root) ? files.get(name.slice(root.length)) : undefined,
  };

  const options = {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  };
  const cache = ts.createModuleResolutionCache(root, (name) => name, options);
  const pending = entries.filter((name) => /\.d\.(?:ts|mts|cts)$/.test(name));
  const visited = new Set();
  for (const name of pending) {
    if (visited.has(name)) continue;
    visited.add(name);
    const source = ts.preProcessFile(files.get(name) ?? "", true, true);
    for (const { fileName: specifier } of source.importedFiles) {
      assert(
        !/^(?:next(?:\/|$)|@(?:sirdab\/(?:ui|foundation)|uqail\/)|@\/)/.test(
          specifier,
        ),
        `Declaration workspace/Next leak in ${name}: ${specifier}`,
      );

      if (!/^(?:\.|\/|#|@sirdab\/one(?:\/|$))/.test(specifier)) continue;
      const resolved = ts.resolveModuleName(
        specifier,
        root + name,
        options,
        host,
        cache,
      ).resolvedModule;
      assert(
        resolved &&
          resolved.resolvedFileName.startsWith(root) &&
          /\.d\.(?:ts|mts|cts)$/.test(resolved.resolvedFileName),
        `Unresolvable declaration import in ${name}: ${specifier}`,
      );
      pending.push(resolved.resolvedFileName.slice(root.length));
    }
    for (const { fileName: reference } of source.referencedFiles) {
      const target = posix.resolve(root, posix.dirname(name), reference);
      assert(
        host.fileExists(target) && /\.d\.(?:ts|mts|cts)$/.test(target),
        `Unresolvable declaration reference in ${name}: ${reference}`,
      );
      pending.push(target.slice(root.length));
    }
  }
}

export function auditFiles(files, sourceFiles = new Map()) {
  const manifest = JSON.parse(files.get("package.json") ?? "null");
  assert(record(manifest), "Tarball must contain package.json");
  assert.equal(manifest.name, "@sirdab/one");
  assert.equal(manifest.license, "MIT");
  assert.match(
    files.get("LICENSE") ?? "",
    /MIT License|Permission is hereby granted/,
  );
  assert(record(manifest.exports), "Missing package exports");
  const required = [
    ".",
    "./provider",
    "./theme-provider",
    "./foundation",
    "./components/*",
    "./icons/*",
    "./hooks/*",
    "./lib/*",
    "./styles.css",
    "./fonts.css",
  ];
  for (const key of required) {
    assert(key in manifest.exports, `Missing public export: ${key}`);
    if (key.endsWith(".css")) continue;
    const entry = manifest.exports[key];
    assert(
      record(entry) &&
        typeof entry.types === "string" &&
        typeof entry.import === "string",
      `Missing ESM/types export pair: ${key}`,
    );
    const runtime = entry.import.slice(2);
    const declarations = entry.types.slice(2);
    const [prefix, suffix] = runtime.split("*");
    const matches = matchingFiles(files, runtime);
    for (const name of matches) {
      const wildcard = runtime.includes("*")
        ? name.slice(prefix.length, name.length - suffix.length)
        : "";
      assert(
        files.has(declarations.replace("*", wildcard)),
        `Missing declaration for ${key}: ${name}`,
      );
    }
  }
  const checked = [];
  const precompiledCss = new Set(
    [manifest.exports["./styles.css"], manifest.exports["./fonts.css"]]
      .flatMap(targets)
      .map((target) => target.slice(2)),
  );
  for (const [key, value] of Object.entries(manifest.exports)) {
    const leaves = targets(value);
    assert(leaves.length, `Export has no usable target: ${key}`);
    for (const target of leaves) {
      assert(
        target.startsWith("./") && !target.includes("..", 2),
        `Invalid export target: ${target}`,
      );
      const local = target.slice(2);
      assert(
        !/\.(?:tsx?|mts|cts)$/.test(local) ||
          /\.d\.(?:ts|mts|cts)$/.test(local),
        `Raw TypeScript export: ${key}`,
      );
      const matches = matchingFiles(files, local);
      assert(
        matches.length,
        `Export points to missing files: ${key} -> ${target}`,
      );
      checked.push(...matches);
    }
  }
  for (const group of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    const dependencies = manifest[group];
    if (!record(dependencies)) continue;
    assert(!("next" in dependencies), `Next must not be a ${group} entry`);
    for (const [name, version] of Object.entries(dependencies)) {
      assert(
        typeof version === "string" &&
          !/^(?:workspace:|file:|link:|npm:)/.test(version),
        `Non-portable dependency: ${name}`,
      );
    }
  }
  assert(
    !manifest.overrides && !manifest.resolutions && !manifest.pnpm,
    "Published consumers must not need dependency overrides",
  );
  auditDeclarations(files, checked);
  for (const [name, content] of files) {
    assert(
      !/\.(?:tsx?|mts|cts)$/.test(name) || /\.d\.(?:ts|mts|cts)$/.test(name),
      `Raw TypeScript in tarball: ${name}`,
    );
    if (/\.(?:m?js|cjs)$/.test(name)) {
      for (const specifier of imports(content)) {
        assert(
          !/^(?:next(?:\/|$)|@(?:sirdab\/(?:ui|foundation)|uqail\/)|@\/)/.test(
            specifier,
          ),
          `Runtime workspace/Next leak in ${name}: ${specifier}`,
        );
        assert(
          !/\.(?:tsx?|mts|cts)$/.test(specifier),
          `Runtime TypeScript import in ${name}`,
        );
        if (specifier.startsWith(".")) {
          const target = posix.normalize(
            posix.join(posix.dirname(name), specifier),
          );
          assert(
            files.has(target),
            `Unresolvable ESM import in ${name}: ${specifier}`,
          );
        }
      }
    }
    if (name.endsWith(".css")) {
      const parsed = postcss.parse(content);
      parsed.walkComments((comment) => comment.remove());
      const stylesheet = parsed.toString();
      if (precompiledCss.has(name))
        assert(
          !/@(?:tailwind|source|theme|utility)\b/.test(stylesheet),
          `Uncompiled CSS: ${name}`,
        );
      assert(
        !/@import\s+["'](?:tailwindcss|tw-animate-css|@sirdab|@uqail)/.test(
          stylesheet,
        ),
        `Unbundled CSS dependency: ${name}`,
      );
      for (const match of stylesheet.matchAll(
        /url\(\s*["']?([^\s)"']+)["']?\s*\)/g,
      )) {
        const url = match[1];
        if (url.startsWith("data:")) continue;
        assert(
          !/^(?:\/|https?:)/.test(url),
          `Host-dependent CSS asset in ${name}: ${url}`,
        );
        assert(
          files.has(
            posix.normalize(
              posix.join(posix.dirname(name), url.split(/[?#]/)[0]),
            ),
          ),
          `Missing CSS asset in ${name}: ${url}`,
        );
      }
    }
  }
  for (const [name, content] of sourceFiles) {
    if (
      !/\.(?:tsx?|jsx?)$/.test(name) ||
      name.includes("/tests/") ||
      !isClient(content)
    )
      continue;
    const compiled = `dist/${name.replace(/\.(?:tsx?|jsx?)$/, ".js")}`;
    assert(
      files.has(compiled),
      `Client module missing from artifact: ${compiled}`,
    );
    assert(
      isClient(files.get(compiled) ?? ""),
      `Lost use client directive: ${compiled}`,
    );
  }
  const notices = [...files]
    .filter(([name]) => /license|notice/i.test(name))
    .map(([, content]) => content)
    .join("\n");
  for (const attribution of [
    "Panayiotis Lipiridis",
    "Emran Alhaddad",
    "Inter Project Authors",
    "IBM",
  ]) {
    assert(
      notices.includes(attribution),
      `Missing redistributed asset notice: ${attribution}`,
    );
  }
  if ([...files.keys()].some((name) => /vendor.*vaul/i.test(name))) {
    assert(
      /Emil Kowalski/i.test(notices),
      "Vendored Vaul must retain its MIT attribution",
    );
  }
  return {
    name: manifest.name,
    version: manifest.version,
    files: files.size,
    exportTargets: checked.length,
    sourceClientDirectivesChecked: sourceFiles.size > 0,
  };
}

export async function auditPackage(directory, sourceDirectory) {
  return auditFiles(
    await readTree(
      resolve(directory),
      (name) =>
        name === "package.json" ||
        name.endsWith("/package.json") ||
        /\.(?:m?js|cjs|css)$/.test(name) ||
        /\.d\.(?:ts|mts|cts)$/.test(name) ||
        /license|notice/i.test(name),
    ),
    sourceDirectory
      ? await readTree(resolve(sourceDirectory), (name) =>
          /\.(?:tsx?|jsx?)$/.test(name),
        )
      : undefined,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assert(
    process.argv[2],
    "Usage: node scripts/audit-package.mjs <unpacked-package-directory>",
  );
  const source = resolve(import.meta.dirname, "../packages/one/src");
  console.log(
    JSON.stringify(await auditPackage(process.argv[2], source), null, 2),
  );
}
