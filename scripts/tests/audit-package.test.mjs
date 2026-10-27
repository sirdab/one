import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { auditFiles, auditPackage, readTree } from "../audit-package.mjs";

function specimen() {
  const exports = Object.fromEntries(
    [".", "./provider", "./theme-provider", "./foundation"].map((key) => [
      key,
      { types: "./dist/index.d.ts", import: "./dist/index.js" },
    ]),
  );
  for (const group of ["components", "icons", "hooks", "lib"])
    exports[`./${group}/*`] = {
      types: `./dist/${group}/*.d.ts`,
      import: `./dist/${group}/*.js`,
    };
  exports["./styles.css"] = "./dist/styles.css";
  exports["./fonts.css"] = "./dist/fonts.css";
  const files = new Map([
    [
      "package.json",
      JSON.stringify({
        name: "@sirdab/one",
        version: "0.1.0-alpha.0",
        license: "MIT",
        exports,
      }),
    ],
    ["LICENSE", "MIT License"],
    [
      "licenses/assets.txt",
      "Panayiotis Lipiridis; Emran Alhaddad; Inter Project Authors; IBM",
    ],
    ["dist/index.js", "export const value = 1;"],
    ["dist/index.d.ts", "export declare const value: number;"],
    ["dist/styles.css", "button { display: inline-flex; }"],
    ["dist/fonts.css", '@font-face { src: url("./font.woff2"); }'],
    ["dist/font.woff2", "fixture"],
  ]);
  for (const group of ["components", "icons", "hooks", "lib"]) {
    files.set(`dist/${group}/example.js`, "export {};");
    files.set(`dist/${group}/example.d.ts`, "export {};");
  }
  return files;
}

test("accepts a portable artifact, including a next-themes import", () => {
  const files = specimen();
  files.set(
    "dist/index.js",
    'import { useTheme } from "next-themes"; export { useTheme };',
  );
  assert.equal(auditFiles(files).version, "0.1.0-alpha.0");
});

test("rejects missing declarations for a wildcard export", () => {
  const files = specimen();
  files.delete("dist/icons/example.d.ts");
  assert.throws(() => auditFiles(files), /Missing declaration/);
});

test("rejects an omitted transitive foundation declaration with runtime intact", () => {
  const files = specimen();
  const manifest = JSON.parse(files.get("package.json"));
  manifest.exports["./foundation"] = {
    types: "./dist/foundation/index.d.ts",
    import: "./dist/foundation/index.js",
  };
  files.set("package.json", JSON.stringify(manifest));
  files.set("dist/foundation/index.js", 'export * from "./numerals.js";');
  files.set(
    "dist/foundation/index.d.ts",
    'export type { FieldName } from "./numerals.js";',
  );
  files.set("dist/foundation/numerals.js", "export const FIELD_KIND = {};");
  files.set(
    "dist/foundation/numerals.d.ts",
    'export type FieldName = "quantity" | "price";',
  );
  assert.equal(auditFiles(files).files, files.size);
  files.delete("dist/foundation/numerals.d.ts");
  assert.throws(
    () => auditFiles(files),
    /Unresolvable declaration import in dist\/foundation\/index.d.ts: .\/numerals.js/,
  );
});

test("checks import-type expressions reached through wildcard declarations", () => {
  const files = specimen();
  files.set(
    "dist/hooks/example.d.ts",
    'export type Options = import("../internal/options.js").Options;',
  );
  files.set("dist/internal/options.js", "export {};");
  files.set(
    "dist/internal/options.d.ts",
    'export type Options = import("./nested.js").Nested;',
  );
  files.set("dist/internal/nested.js", "export {};");
  files.set(
    "dist/internal/nested.d.ts",
    "export type Nested = { value: string };",
  );
  assert.equal(auditFiles(files).files, files.size);
  files.delete("dist/internal/nested.d.ts");
  assert.throws(
    () => auditFiles(files),
    /Unresolvable declaration import in dist\/internal\/options.d.ts: .\/nested.js/,
  );
});

test("uses TypeScript extension substitution and terminates declaration cycles", () => {
  const files = specimen();
  files.set(
    "dist/index.d.ts",
    'export type { Value } from "./internal/value.mjs";',
  );
  files.set(
    "dist/internal/value.d.mts",
    'import type {} from "../index.js"; export type Value = number;',
  );
  assert.equal(auditFiles(files).files, files.size);
  files.delete("dist/internal/value.d.mts");
  files.set("dist/internal/value.mjs", "export {};");
  assert.throws(() => auditFiles(files), /Unresolvable declaration import/);
});

test("follows package self references and triple-slash declaration references", () => {
  const files = specimen();
  files.set(
    "dist/index.d.ts",
    'export type * from "@sirdab/one/hooks/example";',
  );
  files.set(
    "dist/hooks/example.d.ts",
    '/// <reference path="../internal/globals.d.ts" />\nexport {};',
  );
  files.set(
    "dist/internal/globals.d.ts",
    "declare interface Example { value: string }",
  );
  assert.equal(auditFiles(files).files, files.size);
  files.delete("dist/internal/globals.d.ts");
  assert.throws(() => auditFiles(files), /Unresolvable declaration reference/);
});

test("reads declaration contents from disk while retaining skipped binary filenames", async () => {
  const directory = await mkdtemp(join(tmpdir(), "one-audit-"));
  try {
    const files = specimen();
    files.set(
      "dist/index.d.ts",
      'export type Value = import("./value.js").Value;',
    );
    files.set("dist/value.js", "export {};");
    files.set("dist/value.d.ts", "export type Value = string;");
    for (const [name, content] of files) {
      await mkdir(dirname(join(directory, name)), { recursive: true });
      await writeFile(join(directory, name), content);
    }
    await writeFile(
      join(directory, "dist/font.woff2"),
      Buffer.from([0xff, 0xfe]),
    );
    const selected = await readTree(
      directory,
      (name) => !name.endsWith(".woff2"),
    );
    assert.equal(selected.get("dist/font.woff2"), "");
    assert.equal((await auditPackage(directory)).files, files.size);
    await rm(join(directory, "dist/value.d.ts"));
    await assert.rejects(
      () => auditPackage(directory),
      /Unresolvable declaration import/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("isolated public type proof checks wildcard entries and dependency diagnostics", async () => {
  const directory = await mkdtemp(join(tmpdir(), "one-type-proof-"));
  try {
    const installed = join(directory, "node_modules/@sirdab/one");
    const files = specimen();
    files.set(
      "dist/index.d.ts",
      'export type FieldName = "quantity" | "price"; export type Locale = "ar-SA"; export interface PriceOptions { locale?: Locale; }',
    );
    for (const [name, content] of files) {
      await mkdir(dirname(join(installed, name)), { recursive: true });
      await writeFile(join(installed, name), content);
    }

    const compiler = dirname(
      dirname(createRequire(import.meta.url).resolve("typescript")),
    );
    await cp(compiler, join(directory, "node_modules/typescript"), {
      recursive: true,
    });
    await mkdir(join(directory, "shared"));
    await cp(
      new URL("../../fixtures/shared/foundation-contract.ts", import.meta.url),
      join(directory, "shared/foundation-contract.ts"),
    );
    await writeFile(join(directory, "package.json"), '{"type":"module"}');
    const script = new URL("../check-public-types.mjs", import.meta.url);
    const run = () =>
      spawnSync(process.execPath, [script.pathname, directory], {
        encoding: "utf8",
        timeout: 30_000,
      });
    const valid = run();
    assert.equal(valid.status, 0, valid.stderr);
    assert.match(
      valid.stdout,
      /Checked 8 public type entries with skipLibCheck=false/,
    );

    await writeFile(
      join(installed, "dist/icons/example.d.ts"),
      'export type Missing = import("../internal/missing.js").Missing;',
    );
    const missing = run();
    assert.equal(missing.status, 1, missing.stderr);
    assert.match(missing.stderr, /Cannot find module.*internal\/missing/);

    await writeFile(
      join(installed, "dist/icons/example.d.ts"),
      'export type { Broken } from "broken-dependency";',
    );
    const dependency = join(directory, "node_modules/broken-dependency");
    await mkdir(dependency);
    await writeFile(join(dependency, "package.json"), '{"types":"index.d.ts"}');
    await writeFile(
      join(dependency, "index.d.ts"),
      "export type Broken = MissingUpstreamType;",
    );
    const upstream = run();
    assert.equal(upstream.status, 1, upstream.stderr);
    assert.match(upstream.stderr, /Cannot find name.*MissingUpstreamType/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects broken public exports and omitted asset notices", () => {
  const files = specimen();
  files.delete("dist/components/example.js");
  assert.throws(() => auditFiles(files), /missing files/);
  files.set("dist/components/example.js", "export {};");
  files.delete("licenses/assets.txt");
  assert.throws(() => auditFiles(files), /Missing redistributed asset notice/);
});

test("rejects Next leaks, raw runtime TypeScript and root-relative asset URLs", () => {
  for (const [path, content, message] of [
    ["dist/index.js", 'export { default } from "next/image";', /Next leak/],
    ["dist/index.js", 'const x = import("next/navigation");', /Next leak/],
    ["dist/secret.ts", "export const x: string = 'x';", /Raw TypeScript/],
    [
      "dist/fonts.css",
      '@font-face { src: url("/fonts/a.woff2"); }',
      /Host-dependent/,
    ],
    [
      "dist/fonts.css",
      '@font-face { src: url("./missing.woff2"); }',
      /Missing CSS asset/,
    ],
  ]) {
    const files = specimen();
    files.set(path, content);
    assert.throws(() => auditFiles(files), message);
  }
});

test("detects a stripped directive without treating comments as directives", () => {
  const files = specimen();
  const source = new Map([["index.tsx", '"use client"; export const x = 1;']]);
  files.set("dist/index.js", '/* "use client" */ export const x = 1;');
  assert.throws(() => auditFiles(files, source), /Lost use client/);
  files.set("dist/index.js", '/* bundled */ "use client"; export const x = 1;');
  assert.equal(auditFiles(files, source).sourceClientDirectivesChecked, true);
});

test("CSS documentation comments do not count as runtime dependencies", () => {
  const files = specimen();
  files.set(
    "dist/styles.css",
    '/* Host example: @import "tailwindcss"; @theme {} url("/fonts/example.woff2") */ button { display: inline-flex; }',
  );
  assert.equal(auditFiles(files).version, "0.1.0-alpha.0");
});
