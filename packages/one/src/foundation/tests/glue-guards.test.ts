import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assert, describe, expect, it } from "vitest";

const read = (name: string): string =>
  readFileSync(join(__dirname, "..", name), "utf8");

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
  it("never reassigns --secondary or --secondary-foreground", () => {
    const bridge = read("shadcn-bridge.css");
    expect(bridge).not.toMatch(/^\s*--secondary(-foreground)?\s*:/m);
  });

  it("never styles the trued panels", () => {
    const bridge = read("shadcn-bridge.css");
    expect(bridge).not.toMatch(/\[data-slot="select-content"\]/);

    expect(bridge).not.toMatch(/\[data-slot="popover-content"\]/);

    const withoutMenuExit = bridge.replace(
      /body:has\(\[data-slot="dialog-content"\]\[data-state="open"\]\)\s*\[data-slot="dropdown-menu-content"\]\[data-state="closed"\]\s*\{\s*animation:\s*none\s*!important;\s*\}/,
      "",
    );
    expect(withoutMenuExit).not.toMatch(/\[data-slot="dropdown-menu-/);
    expect(withoutMenuExit).not.toMatch(/\[data-slot="dialog-content"\]/);
    expect(bridge).not.toMatch(/\[data-slot="select-item"\]/);
    expect(bridge).not.toMatch(/\[data-slot="command-item"\]/);

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

  it("declares custom breakpoints in rem", () => {
    expect(glue).not.toMatch(/--breakpoint-[\w-]+:\s*\d+px/);
  });

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

describe("script weight knobs", () => {
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

describe("the neutral ramp's mirror", () => {
  const css = read("foundation.css");

  const rampSteps = (): number[] => [
    ...new Set([...css.matchAll(/--ramp-(\d+):/g)].map((m) => Number(m[1]))),
  ];

  const mappingFor = (theme: "light" | "dark"): Set<number> => {
    const marker =
      theme === "light"
        ? "--gray-50: var(--ramp-50);"
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
          ? "--gray-50: var(--ramp-50);"
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
