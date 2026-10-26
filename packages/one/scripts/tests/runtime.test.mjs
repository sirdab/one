import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { phoneFlagUrl } from "../../src/lib/phone-flags.ts";
import {
  adaptVaulDialog,
  packageRoot,
  portableImports,
  vaulRuntime,
} from "../portable-modules.mjs";

test("portable ESM imports retain client boundaries and rewrite declaration references", () => {
  const source = `"use client";
import { Button } from "./button";
import { formatValue } from "@sirdab/one/foundation";
import { Drawer } from "vaul";
export type DrawerProps = import("vaul").DialogProps;
export { buttonVariants } from "./button-variants";
const label = "vaul";
`;
  const output = portableImports(
    source,
    path.join(packageRoot, "dist/components/ui/example.d.ts"),
  );
  assert.match(output, /^"use client";/);
  assert.match(output, /from "\.\/button\.js"/);
  assert.match(output, /from "\.\.\/\.\.\/foundation\/index\.js"/);
  assert.match(output, /from "\.\.\/\.\.\/vendor\/vaul\.js"/);
  assert.match(output, /import\("\.\.\/\.\.\/vendor\/vaul\.js"\)/);
  assert.match(output, /from "\.\/button-variants\.js"/);
  assert.match(output, /const label = "vaul"/);
});

test("pinned upstream Vaul has one dialog import and the adapter removes it", async () => {
  const runtime = await vaulRuntime();
  assert.match(runtime, /^'use client';/);
  assert.match(
    runtime,
    /import \{ Dialog as DialogPrimitive \} from 'radix-ui'/,
  );
  assert.doesNotMatch(runtime, /@radix-ui\/react-dialog/);
  const declaration = adaptVaulDialog(
    "import * as DialogPrimitive from '@radix-ui/react-dialog';\ntype Props = DialogPrimitive.DialogProps;",
  );
  assert.match(
    declaration,
    /import \{ Dialog as DialogPrimitive \} from 'radix-ui'/,
  );
});

test("every literal flag URL points at an owned SVG and retains a nested asset base", async () => {
  const source = await readFile(
    path.join(packageRoot, "src/lib/phone-flags.ts"),
    "utf8",
  );
  const matches = [
    ...source.matchAll(
      /  ([a-z]{2}): new URL\("([^"]+)", import\.meta\.url\)/g,
    ),
  ];
  assert.equal(matches.length, 221);
  for (const [, country, asset] of matches) {
    assert.match(
      await readFile(new URL(phoneFlagUrl(country)), "utf8"),
      /<svg/,
    );
    assert.equal(
      new URL(asset, "https://example.test/shop/one/lib/phone-flags.js")
        .pathname,
      `/shop/one/assets/flags/${country}.svg`,
    );
  }
  assert.equal(phoneFlagUrl("SA"), phoneFlagUrl("sa"));
  assert.equal(phoneFlagUrl("unknown"), undefined);
});
