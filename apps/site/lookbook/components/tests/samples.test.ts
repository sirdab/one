import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { DICTS } from "../samples";

const COMPONENTS = join(__dirname, "..");

/* A key present in one dict but missing from another silently falls back to
   English for that locale (invisible in code, visible only in a manual
   sweep of the lookbook). Keep the three dicts covering the same keys. */
describe("lookbook sample dicts", () => {
  it("cover the same keys in every locale", () => {
    const reference = Object.keys(DICTS.ar).sort();
    for (const locale of ["fr", "tr"] as const) {
      expect(Object.keys(DICTS[locale]).sort()).toEqual(reference);
    }
  });

  /* Regression (2026-07-28): pages used s("…") literals that no dict
       defined, so Arabic mode rendered a patchwork of translated and
       English content. Every sampler key used anywhere in the lookbook
       must be defined. The English fallback is for emergencies, not a
       workflow. */
  it("define every sampler key the lookbook uses", () => {
    const roots = [join(COMPONENTS, "..", "sections"), COMPONENTS];
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else if (path.endsWith(".tsx")) files.push(path);
      }
    };
    roots.forEach(walk);

    const used = new Set<string>();
    const pattern = /s\(\s*"((?:[^"\\]|\\.)*)"\s*[,)]/g;
    for (const file of files) {
      for (const match of readFileSync(file, "utf8").matchAll(pattern)) {
        used.add(match[1].replace(/\\"/g, '"'));
      }
    }
    const missing = [...used].filter((key) => !(key in DICTS.ar)).sort();
    expect(missing).toEqual([]);
  });
});
