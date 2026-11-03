import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { build } from "esbuild";

import { packageRoot } from "../portable-modules.mjs";

const dist = path.join(packageRoot, "dist");

async function inputs(source) {
  const result = await build({
    stdin: { contents: source, resolveDir: dist, loader: "js" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    external: ["react", "react/jsx-runtime", "react-dom", "radix-ui"],
    logLevel: "error",
    metafile: true,
  });
  return Object.keys(result.metafile.inputs);
}

test("DirectionProvider pulls in neither the theme nor the tooltip provider", async () => {
  const files = await inputs(
    'export { DirectionProvider } from "./direction-provider.js";',
  );
  assert.deepEqual(
    files.filter((file) => /next-themes|theme-provider|tooltip/.test(file)),
    [],
  );
});

test("ButtonBase and InputBase carry no tooltip", async () => {
  const files = await inputs(
    'export { ButtonBase } from "./components/ui/button-base.js"; export { InputBase } from "./components/ui/input-base.js";',
  );
  assert.deepEqual(
    files.filter((file) => /tooltip|disabled-reason/.test(file)),
    [],
  );
});
