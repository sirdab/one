import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string): string =>
  readFileSync(join(__dirname, "..", name), "utf8");

type Declaration = {
  name: string;
  refs: string[];
  selectors: string[];

  at: number;
};

const stripComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const withoutSupports = (css: string): string =>
  css.replace(/@supports[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, (m) =>
    m.replace(/[^\n]/g, " "),
  );

const declarations = (css: string, offset = 0): Declaration[] => {
  const out: Declaration[] = [];
  for (const block of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    const selectors = (block[1] ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const body = block[2] ?? "";
    const bodyStart = (block.index ?? 0) + (block[1] ?? "").length + 1;
    for (const decl of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      out.push({
        name: decl[1] ?? "",
        refs: [...(decl[2] ?? "").matchAll(/var\(\s*(--[\w-]+)/g)].map(
          (ref) => ref[1] ?? "",
        ),
        selectors,
        at: offset + bodyStart + (decl.index ?? 0),
      });
    }
  }
  return out;
};

const isDark = (d: Declaration): boolean =>
  d.selectors.length === 1 && d.selectors[0] === ".dark";
const inLight = (d: Declaration): boolean => d.selectors.includes(".light");
const inDarkScope = (d: Declaration): boolean => d.selectors.includes(".dark");

const all: Declaration[] = [
  ...declarations(
    withoutSupports(stripComments(read("shadcn-bridge.css"))),
    -1e7,
  ),
  ...declarations(withoutSupports(stripComments(read("foundation.css")))),
];

const darkOnly = all.filter(isDark);
const darkNames = new Set(darkOnly.map((d) => d.name));

const flipping = (() => {
  const set = new Set(darkNames);
  let grew = true;
  while (grew) {
    grew = false;
    for (const d of all) {
      if (!set.has(d.name) && d.refs.some((ref) => set.has(ref))) {
        set.add(d.name);
        grew = true;
      }
    }
  }
  return set;
})();

describe("theme scopes work on any element", () => {
  it("finds the dark overrides it is guarding", () => {
    expect(darkNames.size).toBeGreaterThan(60);
    expect(darkNames).toContain("--gray-50");
    expect(darkNames).toContain("--gray-alpha-150");
    expect(darkNames).toContain("--background");
    expect(darkNames).toContain("--surface-sunken");
  });

  it("gives every dark override a light counterpart a .light island restores", () => {
    const light = new Set(all.filter(inLight).map((d) => d.name));
    expect([...darkNames].filter((name) => !light.has(name))).toEqual([]);
  });

  it("declares each light value BEFORE the dark block that overrides it", () => {
    const late = darkOnly.filter((dark) =>
      all.some(
        (light) =>
          light.name === dark.name &&
          inDarkScope(light) &&
          !isDark(light) &&
          light.at > dark.at,
      ),
    );
    expect(late.map((d) => d.name)).toEqual([]);
  });

  it("never leaves a flipping alias where a .dark scope cannot re-resolve it", () => {
    const frozen = all.filter(
      (d) =>
        !inDarkScope(d) &&
        !(inLight(d) && darkNames.has(d.name)) &&
        d.refs.some((ref) => flipping.has(ref)),
    );
    expect(frozen.map((d) => `${d.name} (${d.selectors.join(", ")})`)).toEqual(
      [],
    );
  });

  it("re-resolves every status tone in both scopes", () => {
    const flippers = ["attention", "warning", "destructive", "success"].flatMap(
      (tone) => [`--${tone}`, `--${tone}-subtle`, `--${tone}-glyph`],
    );
    const light = new Set(all.filter(inLight).map((d) => d.name));
    for (const name of flippers) {
      expect(darkNames, `${name} in .dark`).toContain(name);
      expect(light, `${name} in .light`).toContain(name);
    }
  });

  it("declares the neutral glyph where a .dark scope re-resolves it", () => {
    const glyph = all.filter((d) => d.name === "--neutral-glyph");
    expect(glyph.length).toBeGreaterThan(0);
    for (const d of glyph) {
      expect(d.selectors).toEqual(
        expect.arrayContaining([":root", ".light", ".dark"]),
      );
    }
  });

  it("gives the sRGB fallback's dark literals a light value on .light", () => {
    const css = stripComments(read("foundation.css"));
    const from = css.indexOf("@supports not (color: oklch(0% 0 0))");
    expect(from).toBeGreaterThan(-1);
    const fallback = declarations(css.slice(from));
    const dark = new Set(fallback.filter(isDark).map((d) => d.name));
    const light = new Set(
      [...fallback, ...all].filter(inLight).map((d) => d.name),
    );
    expect(dark.size).toBeGreaterThan(0);
    expect([...dark].filter((name) => !light.has(name))).toEqual([]);
  });
});

describe("the dark: variant follows the scopes", () => {
  it("starts a fresh dark scope after every light boundary", () => {
    const glue: string = stripComments(read("tailwind.css"));
    expect(glue).toMatch(
      /@custom-variant\s+dark\s*\{\s*@scope\s*\(\.dark\)\s*to\s*\(\.light\)\s*\{\s*@slot;/,
    );
    expect(glue).not.toMatch(/prefers-color-scheme/);
  });
});
