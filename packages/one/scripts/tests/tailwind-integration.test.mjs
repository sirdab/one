import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const root = resolve(import.meta.dirname, "../..");
test("host Tailwind retains responsive package rules when it also emits their base utilities", async () => {
  const result = await postcss([tailwindcss({ base: root })]).process(
    '@import "tailwindcss" source(none);\n@import "./dist/tailwind.css";\n@source inline("hidden");',
    { from: resolve(root, "host-integration.css") },
  );
  const rules = [];
  result.root.walkRules((rule) => rules.push(rule.selector));
  assert(rules.includes(".hidden"));
  assert(
    rules.includes(".md\\:flex"),
    "Host CSS omitted Sidebar's responsive display rule",
  );
  assert(rules.indexOf(".md\\:flex") > rules.indexOf(".hidden"));
  const optional = await readFile(resolve(root, "dist/tailwind.css"), "utf8");
  const optionalCss = postcss.parse(optional);
  optionalCss.walkComments((comment) => comment.remove());
  assert.doesNotMatch(
    optionalCss.toString(),
    /@import\s+["']tailwindcss["']|box-sizing:\s*border-box/,
  );
});
