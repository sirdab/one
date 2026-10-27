import assert from "node:assert/strict";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

function declarationTargets(value) {
  if (typeof value === "string")
    return /\.d\.(?:ts|mts|cts)$/.test(value) ? [value] : [];
  if (value && typeof value === "object")
    return Object.values(value).flatMap(declarationTargets);
  return [];
}

assert(
  process.argv[2],
  "Usage: node scripts/check-public-types.mjs <isolated-consumer-directory>",
);
const directory = await realpath(resolve(process.argv[2]));
const workspace = await realpath(resolve(import.meta.dirname, ".."));
assert(
  directory !== workspace && !directory.startsWith(`${workspace}/`),
  "Type proof must run against an isolated consumer outside the workspace",
);
const installed = join(directory, "node_modules/@sirdab/one");
assert(
  !(await lstat(installed)).isSymbolicLink() &&
    (await realpath(installed)).startsWith(`${directory}/`),
  "Type proof requires an unpacked package inside the isolated consumer",
);

const require = createRequire(join(directory, "package.json"));

const ts = require("typescript");
const manifest = JSON.parse(
  await readFile(join(installed, "package.json"), "utf8"),
);
assert.equal(manifest.name, "@sirdab/one");
assert(manifest.exports && typeof manifest.exports === "object");
const files = await readdir(installed, { recursive: true });

const entries = new Set();
for (const [key, entry] of Object.entries(manifest.exports)) {
  for (const target of declarationTargets(entry)) {
    const local = target.replace(/^\.\//, "");
    const [prefix, suffix] = local.split("*");
    const matches = local.includes("*")
      ? files.filter((name) => name.startsWith(prefix) && name.endsWith(suffix))
      : files.filter((name) => name === local);
    assert(matches.length, `Missing public declaration: ${key} -> ${target}`);
    for (const name of matches) {
      const wildcard = local.includes("*")
        ? name.slice(prefix.length, name.length - suffix.length)
        : "";
      entries.add(
        key === "."
          ? manifest.name
          : manifest.name + key.slice(1).replace("*", wildcard),
      );
    }
  }
}
assert(entries.size > 0, "No public type entries found");
const virtualFile = join(directory, "public-entrypoints.ts");
const source = [...entries]
  .sort()
  .map(
    (entry, index) =>
      `export type * as Entry${index} from ${JSON.stringify(entry)};`,
  )
  .join("\n");
const contract = join(directory, "shared/foundation-contract.ts");
await readFile(contract, "utf8");

const options = {
  target: ts.ScriptTarget.ES2022,
  lib: ["lib.esnext.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noEmit: true,
  skipLibCheck: false,
  esModuleInterop: true,
  types: [],
};
const host = ts.createCompilerHost(options);
const readSource = host.getSourceFile.bind(host);
host.getSourceFile = (
  name,
  languageVersion,
  onError,
  shouldCreateNewSourceFile,
) =>
  name === virtualFile
    ? ts.createSourceFile(name, source, languageVersion, true)
    : readSource(name, languageVersion, onError, shouldCreateNewSourceFile);
const program = ts.createProgram([virtualFile, contract], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => directory,
      getCanonicalFileName: (name) => name,
      getNewLine: () => "\n",
    }),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${entries.size} public type entries with skipLibCheck=false.`,
  );
}
