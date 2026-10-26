import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* THE THEME-SCOPE CONTRACT (foundation.css, section 4, "THEME SCOPES").
   `.dark` and `.light` must work on any element, not only the root: the
   shell frame is a .dark scope and the page card a .light island inside it.
   Nothing in CSS enforces that. A single alias left on a bare :root freezes
   at its light resolution inside every dark scope, and it fails silently, on
   whichever screen first paints with it. These tests read the stylesheets
   the way the cascade does and fail on each way the contract can break. */

const read = (name: string): string =>
  readFileSync(join(__dirname, "..", name), "utf8");

type Declaration = {
  name: string;
  refs: string[];
  selectors: string[];
  /* Source position, so "the dark block comes after" is checkable. */
  at: number;
};

const stripComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

/* The sRGB fallback lives in an @supports block with its own pair; it is
   checked on its own below, so the top-level read leaves it out. */
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

/* The bridge cascades BEFORE the foundation in every host (the import order
   is load-bearing, see packages/ui/AGENTS.md), so its offset is negative. */
const all: Declaration[] = [
  ...declarations(
    withoutSupports(stripComments(read("shadcn-bridge.css"))),
    -1e7,
  ),
  ...declarations(withoutSupports(stripComments(read("foundation.css")))),
];

const darkOnly = all.filter(isDark);
const darkNames = new Set(darkOnly.map((d) => d.name));

/* Everything whose value can differ between a light and a dark scope: the
   tokens a .dark block re-declares, and every alias that reads one of them,
   transitively. */
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
    // A parser that silently matched nothing would pass every test below.
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
    /* Same specificity (:root, .light, .dark all weigh 0-1-0), so source
           order is the only thing deciding which one a .dark element takes. */
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
    /* The frozen-alias bug: declared on :root (or :root + .light) only,
           an alias that reads a flipping token is resolved once, light, and
           every .dark scope inherits that light value. */
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
    /* The chip reads a wash, a text step and a glyph step. In the shell
           frame (a .dark scope) the wash goes to 950 and the text and glyph to
           400; the page card's .light island must get 100, 700 and 500 back. */
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
    /* gray-500 is the fixed point of the mirrored ramp, but the alias
           reads a flipping token, so a bare :root declaration would freeze. */
    const glyph = all.filter((d) => d.name === "--neutral-glyph");
    expect(glyph.length).toBeGreaterThan(0);
    for (const d of glyph) {
      expect(d.selectors).toEqual(
        expect.arrayContaining([":root", ".light", ".dark"]),
      );
    }
  });

  it("gives the sRGB fallback's dark literals a light value on .light", () => {
    /* The fallback's .dark swaps a few oklch values for hex. A .light
           island must get the light value back, from the fallback's own
           light block or from the scoped alias blocks above it. */
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
  /* Tailwind's default dark: is the OS preference, which would paint a
       light app dark before its theme provider selects dark; and a variant
       that ignored .light would leak the shell frame's dark: rules into the
       page card. */
  it("starts a fresh dark scope after every light boundary", () => {
    const glue: string = stripComments(read("tailwind.css"));
    expect(glue).toMatch(
      /@custom-variant\s+dark\s*\{\s*@scope\s*\(\.dark\)\s*to\s*\(\.light\)\s*\{\s*@slot;/,
    );
    expect(glue).not.toMatch(/prefers-color-scheme/);
  });
});
