import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { execFileSync } from "node:child_process";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import {
  adaptVaulDialog,
  packageRoot,
  portableImports,
  vaulRoot,
  vaulRuntime,
} from "./portable-modules.mjs";

const require = createRequire(import.meta.url);
const dist = path.join(packageRoot, "dist");
await rm(dist, { recursive: true, force: true });

// TypeScript preserves module boundaries and client directives without bundling React.
execFileSync(
  process.execPath,
  [
    require.resolve("typescript/bin/tsc"),
    "-p",
    path.join(packageRoot, "tsconfig.build.json"),
  ],
  { stdio: "inherit", cwd: packageRoot },
);
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
  await writeFile(
    filename,
    portableImports(await readFile(filename, "utf8"), filename),
  );
}

await mkdir(path.join(dist, "vendor"), { recursive: true });
await writeFile(path.join(dist, "vendor/vaul.js"), await vaulRuntime());
await writeFile(
  path.join(dist, "vendor/vaul.d.ts"),
  adaptVaulDialog(
    await readFile(path.join(vaulRoot, "dist/index.d.mts"), "utf8"),
  ),
);
await mkdir(path.join(dist, "licenses"), { recursive: true });
await cp(
  path.join(packageRoot, "LICENSE"),
  path.join(dist, "licenses/Sirdab-One-MIT.txt"),
);
await cp(
  path.join(vaulRoot, "LICENSE.md"),
  path.join(dist, "licenses/vaul-MIT.md"),
);
await cp(path.join(packageRoot, "src/assets"), path.join(dist, "assets"), {
  recursive: true,
});

const cssInput = path.join(packageRoot, "src/styles.css");
const css = await postcss([
  tailwindcss({ base: packageRoot, optimize: { minify: true } }),
]).process(await readFile(cssInput, "utf8"), {
  from: cssInput,
  to: path.join(dist, "styles.css"),
});
await writeFile(path.join(dist, "styles.css"), css.css);

// The optional host integration needs only the token utilities, never another reset.
const glue = await readFile(
  path.join(packageRoot, "src/foundation/tailwind.css"),
  "utf8",
);
const animationRoot = path.join(packageRoot, "node_modules/tw-animate-css");
const animationCss = await readFile(
  path.join(animationRoot, "dist/tw-animate.css"),
  "utf8",
);
await writeFile(
  path.join(dist, "tailwind.css"),
  glue.replace('@import "tw-animate-css";', animationCss),
);
await cp(
  path.join(animationRoot, "LICENSE"),
  path.join(dist, "licenses/tw-animate-css-MIT.txt"),
);

/** @type {string[]} */
const fonts = [];
for (const family of ["inter", "ibm-plex-sans-arabic"]) {
  const root = path.dirname(
    require.resolve(`@fontsource/${family}/package.json`),
  );
  const weights =
    family === "inter" ? [300, 400, 500, 600, 700] : [400, 500, 600, 700];
  for (const weight of weights) {
    const source = await readFile(path.join(root, `${weight}.css`), "utf8");
    for (const match of source.matchAll(/url\(\.\/files\/([^)]+)\)/g)) {
      await cp(
        path.join(root, "files", match[1]),
        path.join(dist, "assets/fonts", match[1]),
      );
    }
    fonts.push(source.replaceAll("./files/", "./assets/fonts/"));
  }
  await cp(
    path.join(root, "LICENSE"),
    path.join(dist, "licenses", `${family}-OFL.txt`),
  );
}
await writeFile(path.join(dist, "fonts.css"), fonts.join("\n"));
