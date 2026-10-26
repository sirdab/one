import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assert, describe, expect, it } from "vitest";

const read = (name: string): string =>
  readFileSync(join(__dirname, "..", name), "utf8");

// A capture group is only absent when the pattern itself changed, so fail loud.
const group = (match: RegExpMatchArray, index: number): string => {
  const value = match[index];
  assert(value, `capture ${index} missing in ${match[0]}`);
  return value;
};

const pair = (match: RegExpMatchArray): [string, string] => [
  group(match, 1),
  group(match, 2),
];

describe("shadcn-bridge guards", () => {
  /* Regression (2026-07-26): the bridge reassigning --secondary made
       --muted-foreground resolve to a 4% wash (invisible de-emphasised
       text) whenever the bridge cascaded after foundation. The fill remap
       lives ONLY in the Tailwind utility mapping. */
  it("never reassigns --secondary or --secondary-foreground", () => {
    const bridge = read("shadcn-bridge.css");
    expect(bridge).not.toMatch(/^\s*--secondary(-foreground)?\s*:/m);
  });

  /* Regression: bare element selectors (input:not(…), select, button[class*=…])
       reached past shadcn into composite primitives: the inner bare field got
       the standalone-input padding on top of its wrapper's (23px inset). The
       bridge targets [data-slot] names only. */
  /* Regression: the bridge's overlay density rule padded select-content
       4px UNDER the trued panel's viewport padding, so items sat 8px in
       instead of the intended 4. Trued components own their chrome. */
  it("never styles the trued panels", () => {
    const bridge = read("shadcn-bridge.css");
    expect(bridge).not.toMatch(/\[data-slot="select-content"\]/);
    // its solid background once painted under the frost pseudo and
    // made every popover fully opaque
    expect(bridge).not.toMatch(/\[data-slot="popover-content"\]/);
    // left 2026-07-28 when their components were built/trued. The one
    // sanctioned exception is the menu-to-dialog exit rule (CUS-07): it
    // styles no chrome, it only cancels the closed menu's exit animation.
    const withoutMenuExit = bridge.replace(
      /body:has\(\[data-slot="dialog-content"\]\[data-state="open"\]\)\s*\[data-slot="dropdown-menu-content"\]\[data-state="closed"\]\s*\{\s*animation:\s*none\s*!important;\s*\}/,
      "",
    );
    expect(withoutMenuExit).not.toMatch(/\[data-slot="dropdown-menu-/);
    expect(withoutMenuExit).not.toMatch(/\[data-slot="dialog-content"\]/);
    expect(bridge).not.toMatch(/\[data-slot="select-item"\]/);
    expect(bridge).not.toMatch(/\[data-slot="command-item"\]/);
    // left 2026-07-28 when the Table family was trued; the component
    // owns its row/header chrome now
    expect(bridge).not.toMatch(/\[data-slot="table"\]/);
  });

  it("targets [data-slot] names only, never bare elements", () => {
    const bridge = read("shadcn-bridge.css");
    expect(bridge).not.toMatch(/^\s*(input|select|textarea)\b[^;{]*[,{]/m);
    expect(bridge).not.toMatch(/button\[class/);
  });
});

describe("tailwind glue guards", () => {
  const glue = read("tailwind.css");

  it("maps the modal scrim frost pair", () => {
    expect(glue).toMatch(/--color-scrim-surface: var\(--scrim-surface\)/);
    expect(glue).toMatch(/--blur-scrim: var\(--scrim-blur\)/);
  });

  it("redefines disabled: to cover aria-disabled", () => {
    expect(glue).toMatch(
      /@custom-variant disabled \(&:is\(:disabled, \[aria-disabled="true"\]\)\)/,
    );
  });

  it("gates hover and active off disabled controls", () => {
    expect(glue).toMatch(/@custom-variant active/);
    expect(glue).toMatch(/&:hover:not\(:disabled, \[aria-disabled="true"\]\)/);
  });

  /* Regression: the pointer-cursor rule guarded aria-disabled on the
       [role=button] selector only, so a refused control (a real <button>
       kept out of the disabled attribute on purpose, so it stays
       focusable and hoverable for its reason) advertised a pointer while
       refusing every click. */
  it("keeps the pointer cursor off aria-disabled controls", () => {
    expect(glue).toMatch(
      /button:not\(:disabled\):not\(\[aria-disabled="true"\]\)/,
    );
  });

  it("repaints autofill for every field kind", () => {
    expect(glue).toContain("input:-webkit-autofill");
    expect(glue).toContain("textarea:-webkit-autofill");
    expect(glue).toContain("select:-webkit-autofill");
  });

  /* Regression: px breakpoints among Tailwind's rem defaults break v4's
       breakpoint sorting. */
  it("declares custom breakpoints in rem", () => {
    expect(glue).not.toMatch(/--breakpoint-[\w-]+:\s*\d+px/);
  });

  /* Regression: a --color-icon-quiet theme mapping once generated a
       colour utility that name-matched the sanctioned icon-quiet utility
       but painted alpha ink, reintroducing the double-paint the utility
       exists to prevent. Quiet icons are opacity-token-only. */
  /* Colon-anchored so the live --icon-quiet-opacity* tokens don't match;
       -hover/-disabled included because they SOUND like they should exist. */
  /* The brand ramp is the one non-status hue. The glue exposes it as
       aliases (bg-brand, text-brand-foreground, ...) and as raw steps for
       marketing chrome; both must resolve to foundation tokens or the
       classes compile and paint nothing, which is how the old bg-night
       dangled for months. */
  it("maps the brand aliases and every ramp step onto foundation tokens", () => {
    const foundation = read("foundation.css");
    for (const name of [
      "brand",
      "brand-hover",
      "brand-foreground",
      "brand-subtle",
      "brand-subtle-foreground",
      ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
        (n) => `brand-${n}`,
      ),
    ]) {
      expect(glue).toMatch(
        new RegExp(`--color-${name}:\\s*var\\(--${name}\\)`),
      );
      expect(foundation).toMatch(new RegExp(`--${name}:`));
    }
    expect(glue).not.toMatch(/--color-night/);
  });

  it("never maps a quiet-icon colour utility", () => {
    expect(glue).not.toMatch(/--color-icon-quiet/);
    expect(read("foundation.css")).not.toMatch(
      /--icon-quiet(?:-hover|-disabled)?\s*:/,
    );
  });
});

/* The Arabic weight dial is per role, so every role it sets has to be
   restated in the Latin-island block. Miss one and a .latin span inside
   Arabic (a SKU, an order ID, a brand name) renders Inter at the Arabic
   weight while the rest of the Latin UI sits a rung below. */
describe("script weight knobs", () => {
  /* Line endings normalised because git checks this file out with CRLF on
       Windows, and the selectors below span two lines. A literal \n then matches
       nothing and the whole suite fails on the platform rather than on the
       stylesheet. */
  const css = read("foundation.css").replace(/\r\n/g, "\n");
  const block = (selector: RegExp): string => {
    const start = css.search(selector);
    expect(start).toBeGreaterThan(-1);
    const open = css.indexOf("{", start);
    return css.slice(open, css.indexOf("\n}", open));
  };
  const weights = (source: string): string[] =>
    [...source.matchAll(/--(text-[\w-]+-weight)\s*:/g)]
      .map((m) => group(m, 1))
      .sort();

  const arabic = weights(block(/^\[lang="ar"\],\n\[dir="rtl"\] \{/m));
  const island = weights(
    block(
      /^:is\(\[lang="ar"\], \[dir="rtl"\]\) :is\(\[lang="en"\], \.latin\)/m,
    ),
  );

  it("sets a weight for every role, so the dial is visible in one place", () => {
    const roles = weights(css.slice(0, css.search(/^\[lang="ar"\]/m)));
    expect(arabic).toEqual([...new Set(roles)].sort());
  });

  it("resets in the Latin island every role the Arabic block sets", () => {
    expect(island).toEqual(arabic);
  });

  /* The island restates the LATIN constants: if one drifts to an
       Arabic value, islands stop escaping. */
  it("resets islands to the :root weights, not the Arabic ones", () => {
    const root = Object.fromEntries(
      [...css.matchAll(/--(text-[\w-]+-weight)\s*:\s*(\d+);/g)]
        .slice(0, arabic.length)
        .map(pair),
    );
    for (const [role, value] of [
      ...block(
        /^:is\(\[lang="ar"\], \[dir="rtl"\]\) :is\(\[lang="en"\], \.latin\)/m,
      ).matchAll(/--(text-[\w-]+-weight)\s*:\s*(\d+);/g),
    ].map(pair)) {
      expect(`${role}=${value}`).toBe(`${role}=${root[role]}`);
    }
  });
});

/* The ramp is a MIRROR: light maps step N, dark maps step (1000 - N). That
   invariant is what stops the two themes drifting apart, and it is entirely
   convention: nothing in CSS enforces it, and a missing partner fails
   silently, in one theme only, on whichever screen first uses the new step.

   Adding step 62 for the sunken plane [Sirdab 2026-08-26] is what made this
   worth pinning. The trap is real: a light-only step leaves --gray-62
   resolving to nothing in dark. */
describe("the neutral ramp's mirror", () => {
  const css = read("foundation.css");

  const rampSteps = (): number[] => [
    ...new Set([...css.matchAll(/--ramp-(\d+):/g)].map((m) => Number(m[1]))),
  ];

  /* Both mappings live in the same file, so scope each read to its own
       block rather than to the file: a step declared twice anywhere would
       otherwise look like a step declared in both themes. */
  const mappingFor = (theme: "light" | "dark"): Set<number> => {
    const marker =
      theme === "light"
        ? "/* Light mapping: identity. */"
        : "--gray-50: var(--ramp-950);";
    const from = css.indexOf(marker);
    expect(from).toBeGreaterThan(-1);
    const block = css.slice(from, css.indexOf("}", from));
    return new Set(
      [...block.matchAll(/--gray-(\d+):/g)].map((m) => Number(m[1])),
    );
  };

  it("gives every raw step the partner its mirror needs", () => {
    const steps = rampSteps();
    expect(steps.length).toBeGreaterThan(20);
    const missing = steps.filter((n) => !steps.includes(1000 - n));
    expect(missing).toEqual([]);
  });

  it("defines every gray step in BOTH themes, or it is undefined in one", () => {
    const light = mappingFor("light");
    const dark = mappingFor("dark");
    expect([...light].filter((n) => !dark.has(n))).toEqual([]);
    expect([...dark].filter((n) => !light.has(n))).toEqual([]);
  });

  it("maps light to N and dark to its mirror, never to the same raw step", () => {
    for (const theme of ["light", "dark"] as const) {
      const marker =
        theme === "light"
          ? "/* Light mapping: identity. */"
          : "--gray-50: var(--ramp-950);";
      const from = css.indexOf(marker);
      const block = css.slice(from, css.indexOf("}", from));
      for (const [, gray, ramp] of block.matchAll(
        /--gray-(\d+): var\(--ramp-(\d+)\)/g,
      )) {
        const expected = theme === "light" ? Number(gray) : 1000 - Number(gray);
        expect([theme, gray, Number(ramp)]).toEqual([theme, gray, expected]);
      }
    }
  });

  /* The sRGB fallback re-declares the raw ramp for pre-OKLCH browsers. A
       step added to one list and not the other loses its colour there. */
  it("carries every raw step into the sRGB fallback", () => {
    const from = css.indexOf("@supports not (color: oklch(0% 0 0))");
    expect(from).toBeGreaterThan(-1);
    const fallback = new Set(
      [...css.slice(from).matchAll(/--ramp-(\d+): #/g)].map((m) =>
        Number(m[1]),
      ),
    );
    expect(rampSteps().filter((n) => !fallback.has(n))).toEqual([]);
  });
});
