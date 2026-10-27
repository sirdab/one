import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { DICTS } from "../samples";

const COMPONENTS = join(__dirname, "..");

describe("lookbook sample dicts", () => {
  it("cover the same keys in every locale", () => {
    const reference = Object.keys(DICTS.ar).sort();
    for (const locale of ["fr", "tr"] as const) {
      expect(Object.keys(DICTS[locale]).sort()).toEqual(reference);
    }
  });

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
    const pattern = /\bs\(\s*"((?:[^"\\]|\\.)*)"\s*[,)]/g;
    for (const file of files) {
      for (const match of readFileSync(file, "utf8").matchAll(pattern)) {
        used.add(match[1].replace(/\\"/g, '"'));
      }
    }
    const missing = [...used].filter((key) => !(key in DICTS.ar)).sort();
    expect(missing).toEqual([]);
  });
});
