import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* THE ASSISTANT'S MARK, TOKEN HALF (AURORA in foundation.css). The mark paints
   from role tokens that each theme scope resolves, so the gold-and-pink light
   reads on white and on night alike. This file reads only foundation.css.
   The half that depends on which role sits on which stop of the icon (the
   painted hues and the 3:1) is packages/ui/src/components/icons/tests/
   aurora-paint.test.tsx: nx selects tests by project, so a change to
   shell.tsx runs ui's tests and never this package's.

   Two things can quietly break the tokens:

   - a hue drifts toward a status. The aurora's founding rule is hues the
     product palette does not use, so the mark can never be taken for a
     warning or an error. The gold is the nearest, so the distance is held;
   - a scope loses a role, or one stops flipping, and the sparks go back to
     ink-strength indigo on a dark ground (1.76:1 on night, the bug this
     guards).

   Only the warning and destructive ramps are tested against. A pale status
   wash (a draft or attention yellow) may sit on the gold's hue: it is a wash
   behind text, never a saturated mark. */

const css: string = readFileSync(
  join(__dirname, "..", "foundation.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

type Oklch = { l: number; c: number; h: number };
type Scope = "light" | "dark";

const parseOklch = (value: string): Oklch | null => {
  const m = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/.exec(value);
  if (!m) return null;
  return { l: Number(m[1]) / 100, c: Number(m[2]), h: Number(m[3]) };
};

const hueGap = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

/* Every aurora colour token (violet, blue, gold, pink ...) by name. */
const tokens = new Map<string, Oklch>();
for (const m of css.matchAll(/(--aurora-[\w-]+)\s*:\s*(oklch\([^)]*\))\s*;/g)) {
  const color = parseOklch(m[2] ?? "");
  if (color) tokens.set(m[1] ?? "", color);
}

/* The warning and destructive ramps, read the way the cascade declares
   them, so a retune of either moves this test with it. One entry per ramp
   and hue (destructive has an off-curve step), not one per step. */
const statusHues: { name: string; h: number }[] = [];
for (const m of css.matchAll(
  /--((?:warning|destructive))-\d+\s*:\s*(oklch\([^)]*\))\s*;/g,
)) {
  const color = parseOklch(m[2] ?? "");
  const name = m[1] ?? "";
  if (color && !statusHues.some((s) => s.name === name && s.h === color.h)) {
    statusHues.push({ name, h: color.h });
  }
}

/* The mark's roles per theme scope: `:root, .light` is the light scope and a
   bare `.dark` block the dark one, as theme-scopes.test.ts reads them. */
const roles = (scope: Scope): Map<string, string> => {
  const out = new Map<string, string>();
  for (const block of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    const selectors = (block[1] ?? "").split(",").map((s) => s.trim());
    const wanted =
      scope === "dark"
        ? selectors.length === 1 && selectors[0] === ".dark"
        : selectors.includes(".light");
    if (!wanted) continue;
    for (const decl of (block[2] ?? "").matchAll(
      /(--aurora-mark-[\w-]+)\s*:\s*var\(\s*(--[\w-]+)\s*\)/g,
    )) {
      out.set(decl[1] ?? "", decl[2] ?? "");
    }
  }
  return out;
};

const roleColor = (scope: Scope, role: string): Oklch => {
  const token = roles(scope).get(role);
  const color = token ? tokens.get(token) : undefined;
  if (!color) {
    throw new Error(`${role} does not resolve to an aurora color in ${scope}`);
  }
  return color;
};

const SCOPES: Scope[] = ["light", "dark"];

describe("the aurora tokens are found", () => {
  it("reads the tokens, the status ramps and the mark's roles", () => {
    // A parser that silently matched nothing would pass every test below.
    expect(tokens.size).toBeGreaterThanOrEqual(8);
    expect(statusHues.map((s) => s.name)).toContain("warning");
    expect(statusHues.map((s) => s.name)).toContain("destructive");
    expect(roles("light").size).toBeGreaterThanOrEqual(5);
  });
});

describe("the mark's roles", () => {
  it("are declared in both theme scopes", () => {
    const light = [...roles("light").keys()].sort();
    const dark = [...roles("dark").keys()].sort();
    expect(dark).toEqual(light);
  });

  it("resolve to an aurora color in each scope", () => {
    for (const scope of SCOPES) {
      for (const role of roles(scope).keys()) {
        expect(() => roleColor(scope, role)).not.toThrow();
      }
    }
  });

  it("keep their hue 20 degrees clear of warning and destructive", () => {
    const tooClose: string[] = [];
    for (const scope of SCOPES) {
      for (const role of roles(scope).keys()) {
        const { h } = roleColor(scope, role);
        for (const status of statusHues) {
          if (hueGap(h, status.h) < 20) {
            tooClose.push(
              `${role} (${scope}, hue ${h}) vs ${status.name} (${status.h})`,
            );
          }
        }
      }
    }
    expect(tooClose).toEqual([]);
  });

  it("are never darker in the dark scope, and the ramp is lighter there", () => {
    /* A dark ground needs lighter stops than a light one. The gold pair is
           the same in both (it already clears night), so equal is allowed;
           the big spark's ramp is what a frozen alias would leave at its
           light value, so it has to step up. */
    const ramp = [
      "--aurora-mark-warm",
      "--aurora-mark-cool",
      "--aurora-mark-fold",
    ];
    const darker: string[] = [];
    const frozen: string[] = [];
    for (const role of roles("light").keys()) {
      const light = roleColor("light", role).l;
      const dark = roleColor("dark", role).l;
      if (dark < light) darker.push(role);
      if (ramp.includes(role) && dark <= light) frozen.push(role);
    }
    expect(darker).toEqual([]);
    expect(frozen).toEqual([]);
  });
});
