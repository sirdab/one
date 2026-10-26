import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { build } from "esbuild";
import ts from "typescript";
import { packageRoot } from "../portable-modules.mjs";

const dist = path.join(packageRoot, "dist");

test("all published entrypoints point to compiled files and every ESM edge resolves", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(packageRoot, "package.json"), "utf8"),
  );
  for (const target of Object.values(manifest.exports).flatMap((value) =>
    typeof value === "string" ? [value] : Object.values(value),
  )) {
    if (target.includes("*")) continue;
    await access(path.join(packageRoot, target));
  }
  for (const entry of await readdir(dist, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (
      !entry.isFile() ||
      (!entry.name.endsWith(".js") && !entry.name.endsWith(".d.ts"))
    )
      continue;
    const filename = path.join(entry.parentPath, entry.name);
    const text = await readFile(filename, "utf8");
    for (const module of ts.preProcessFile(text, true, true).importedFiles) {
      if (!module.fileName.startsWith(".")) continue;
      assert.match(module.fileName, /\.js$/);
      await access(path.resolve(path.dirname(filename), module.fileName));
    }
    assert.doesNotMatch(
      text,
      /(?:from|import\()\s*["'](?:vaul|next\/|@sirdab\/one)/,
    );
  }
  assert.equal(manifest.peerDependencies.react, "^19.2.4");
  assert.equal(manifest.dependencies.vaul, undefined);
  await assert.rejects(
    access(path.join(dist, "components/brand/sirdab-logo.js")),
  );
});

test("client entrypoints retain their directives and server-safe variants execute under react-server", async () => {
  for (const file of [
    "provider.js",
    "theme-provider.js",
    "components/ui/button.js",
    "components/ui/sheet.js",
    "vendor/vaul.js",
  ]) {
    assert.match(
      await readFile(path.join(dist, file), "utf8"),
      /^['"]use client['"];?/,
    );
  }
  assert.doesNotMatch(
    await readFile(path.join(dist, "index.js"), "utf8"),
    /^['"]use client/,
  );
  const entry = pathToFileURL(
    path.join(dist, "components/ui/button-variants.js"),
  ).href;
  const result = execFileSync(
    process.execPath,
    [
      "--conditions=react-server",
      "--input-type=module",
      "-e",
      `import { buttonVariants } from ${JSON.stringify(entry)}; console.log(buttonVariants({variant: "secondary"}));`,
    ],
    { encoding: "utf8" },
  );
  assert.match(result, /border-btn-border bg-background text-foreground/);
});

test("a button subpath does not pull the root, phone assets or heavy component dependencies", async () => {
  const result = await build({
    entryPoints: [path.join(dist, "components/ui/button.js")],
    bundle: true,
    write: false,
    format: "esm",
    packages: "external",
    metafile: true,
    logLevel: "silent",
  });
  assert.doesNotMatch(
    Object.keys(result.metafile.inputs).join("\n"),
    /dist\/index\.js|phone-flags|chart\.js|image-editor|mood-board|vendor\/vaul/,
  );
  assert.doesNotMatch(
    result.outputFiles[0].text,
    /from ["'](?:recharts|streamdown|react-easy-crop|vaul)/,
  );
});

test("the drawer shares the exported Radix dialog context", async () => {
  const { Drawer } = await import(
    pathToFileURL(path.join(dist, "vendor/vaul.js")).href
  );
  const { Dialog } = await import("radix-ui");
  assert.equal(Drawer.Title, Dialog.Title);
  assert.equal(Drawer.Description, Dialog.Description);
  assert.equal(Drawer.Close, Dialog.Close);
  assert.doesNotMatch(
    await readFile(path.join(dist, "vendor/vaul.d.ts"), "utf8"),
    /@radix-ui\/react-dialog/,
  );
});

test("CSS is precompiled, includes real component utilities and resolves every font asset", async () => {
  const styles = await readFile(path.join(dist, "styles.css"), "utf8");
  assert.doesNotMatch(
    styles,
    /@(?:import|source|theme|utility|custom-variant)\b/,
  );
  for (const selector of [
    ".bg-primary",
    ".h-control-xl",
    ".text-body",
    ".dark",
    "SaudiRiyal",
  ])
    assert.ok(styles.includes(selector), selector);
  const fonts = await readFile(path.join(dist, "fonts.css"), "utf8");
  assert.match(fonts, /IBM Plex Sans Arabic/);
  assert.match(fonts, /Inter/);
  for (const css of [styles, fonts]) {
    for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      const asset = match[1];
      if (asset.startsWith("data:")) continue;
      assert.ok(!asset.startsWith("/") && !asset.includes("://"), asset);
      assert.ok(!asset.includes("../"), asset);
      await access(path.resolve(dist, asset));
      assert.ok(
        new URL(
          asset,
          "https://example.test/nested/one/styles.css",
        ).pathname.startsWith("/nested/one/assets/"),
      );
    }
  }
  for (const license of [
    "Sirdab-One-MIT.txt",
    "vaul-MIT.md",
    "inter-OFL.txt",
    "ibm-plex-sans-arabic-OFL.txt",
    "tw-animate-css-MIT.txt",
  ])
    await access(path.join(dist, "licenses", license));
});

test("published flags use static URLs with packaged SVGs at every nested base path", async () => {
  const { phoneFlagUrl } = await import(
    pathToFileURL(path.join(dist, "lib/phone-flags.js")).href
  );
  const { PICKER_PHONE_COUNTRIES } = await import(
    pathToFileURL(path.join(dist, "lib/phone.js")).href
  );
  for (const country of PICKER_PHONE_COUNTRIES)
    assert.match(
      await readFile(new URL(phoneFlagUrl(country.code)), "utf8"),
      /<svg/,
    );
  const code = await readFile(path.join(dist, "lib/phone-flags.js"), "utf8");
  const urls = [...code.matchAll(/new URL\("([^"]+)", import\.meta\.url\)/g)];
  assert.ok(urls.length > 200);
  for (const [, url] of urls) {
    assert.ok(
      new URL(
        url,
        "https://example.test/base/node_modules/one/lib/phone-flags.js",
      ).pathname.startsWith("/base/node_modules/one/assets/flags/"),
    );
  }
});
