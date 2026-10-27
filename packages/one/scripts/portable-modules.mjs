import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(new URL("../package.json", import.meta.url));
export const vaulRoot = path.dirname(path.dirname(require.resolve("vaul")));

export function adaptVaulDialog(source) {
  return source.replace(
    "import * as DialogPrimitive from '@radix-ui/react-dialog';",
    "import { Dialog as DialogPrimitive } from 'radix-ui';",
  );
}

export async function vaulRuntime() {
  return adaptVaulDialog(
    await readFile(path.join(vaulRoot, "dist/index.mjs"), "utf8"),
  );
}

export function portableImports(source, filename) {
  const file = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
  );

  const edits = [];

  function relativeImport(target) {
    const relative = path
      .relative(path.dirname(filename), target)
      .split(path.sep)
      .join("/");
    return relative.startsWith(".") ? relative : `./${relative}`;
  }

  function visit(node) {
    if (ts.isStringLiteral(node)) {
      const parent = node.parent;
      const isModule =
        ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) &&
          parent.moduleSpecifier === node) ||
        (ts.isLiteralTypeNode(parent) && ts.isImportTypeNode(parent.parent)) ||
        (ts.isCallExpression(parent) &&
          parent.expression.kind === ts.SyntaxKind.ImportKeyword);
      if (isModule) {
        let value = node.text;
        if (value === "vaul")
          value = relativeImport(path.join(packageRoot, "dist/vendor/vaul.js"));
        if (value === "@sirdab/one/foundation")
          value = relativeImport(
            path.join(packageRoot, "dist/foundation/index.js"),
          );
        if (value.startsWith(".") && !path.extname(value)) value += ".js";
        if (value !== node.text)
          edits.push({
            start: node.getStart(file),
            end: node.end,
            value: JSON.stringify(value),
          });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  for (const edit of edits.reverse())
    source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  return source;
}

export function vaulTestPlugin() {
  return {
    name: "one-vaul-dialog",
    enforce: "pre",

    resolveId(id) {
      return id === "vaul" ? "\0one-vaul" : undefined;
    },

    async load(id) {
      return id === "\0one-vaul" ? vaulRuntime() : undefined;
    },
  };
}
