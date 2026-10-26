import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrastRatio } from "../index";

/* THE STATUS TONE SCALE (foundation.css, sections 3 and 4). Five tones,
   neutral, attention, warning, critical, success, each with a wash, a text
   step and a glyph step. The numbers the app's chips rely on are pinned
   here from the oklch declarations themselves, the way a browser resolves
   them, so retuning a ramp step shows up as a failing ratio and not as a
   chip somebody squints at on a phone in sunlight.

   The rule behind every pair: a WORD on its wash needs 4.5:1, an ICON on a
   card needs 3:1. The 700 text step at icon size reads as a dull brown, so
   icons take the brighter -glyph step. */

const css = readFileSync(join(__dirname, "..", "foundation.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@supports[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");

type Scope = "light" | "dark";
type Decl = { name: string; value: string; selectors: string[]; at: number };

const decls: Decl[] = [];
for (const block of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
  const selectors = (block[1] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const body = block[2] ?? "";
  const start = (block.index ?? 0) + (block[1] ?? "").length + 1;
  for (const d of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    decls.push({
      name: d[1] ?? "",
      value: (d[2] ?? "").trim().replace(/\s+/g, " "),
      selectors,
      at: start + (d.index ?? 0),
    });
  }
}

/* A .dark element takes its own block's declaration, or inherits the page's
   when it has none; a light element only ever sees the page's. */
const raw = (name: string, scope: Scope): string => {
  const named = decls.filter((d) => d.name === name);
  const page = named.filter(
    (d) => d.selectors.includes(":root") || d.selectors.includes(".light"),
  );
  const dark = named.filter((d) => d.selectors.includes(".dark"));
  const pool = scope === "dark" && dark.length > 0 ? dark : page;
  const last = pool.sort((a, b) => a.at - b.at).at(-1);
  if (!last) throw new Error(`${name} is not declared for ${scope}`);
  /* Prettier wraps a long var() across lines; the cascade does not care. */
  return last.value.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
};

type Rgb = [number, number, number];

const linearOklch = (L: number, C: number, hue: number): Rgb => {
  const h = (hue * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};

const parseOklch = (value: string): Rgb | null => {
  const m = value.match(/^oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)$/);
  if (!m) return null;
  return linearOklch(Number(m[1]) / 100, Number(m[2]), Number(m[3]));
};

const encode = (c: number): number => {
  const v = Math.min(1, Math.max(0, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
};

const hex = (lin: Rgb): string =>
  "#" +
  lin
    .map((c) =>
      Math.round(encode(c) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/* Follows var() aliases to the oklch literal and returns it as the 8-bit
   hex a browser paints. */
const colour = (name: string, scope: Scope): string => {
  let value = raw(name, scope);
  for (let hops = 0; hops < 8; hops++) {
    const alias = value.match(/^var\((--[\w-]+)\)$/);
    if (!alias) break;
    value = raw(alias[1] ?? "", scope);
  }
  const lin = parseOklch(value);
  if (!lin) throw new Error(`${name} does not resolve to an oklch (${value})`);
  return hex(lin);
};

const alias = (name: string, scope: Scope): string => raw(name, scope);

const literal = (name: string, scope: Scope): string => {
  let value = raw(name, scope);
  for (let hops = 0; hops < 8; hops++) {
    const next = value.match(/^var\((--[\w-]+)\)$/);
    if (!next) break;
    value = raw(next[1] ?? "", scope);
  }
  return value;
};

/* An #rrggbbaa wash composited over an opaque page, the way the browser
   paints --muted over the card. */
const composite = (wash: string, page: string): string => {
  const m = wash.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/i);
  if (!m) throw new Error(`${wash} is not an 8-digit hex`);
  const alpha = parseInt(m[2] ?? "ff", 16) / 255;
  const channel = (hexValue: string, at: number): number =>
    parseInt(hexValue.slice(at, at + 2), 16);
  const out = [1, 3, 5].map((at) =>
    Math.round(
      channel(m[1] ?? "", at - 1) * alpha + channel(page, at) * (1 - alpha),
    )
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${out.join("")}`;
};

const PAGE: Record<Scope, string> = {
  light: "--background",
  dark: "--background",
};
const TONES = ["attention", "warning", "destructive", "success"] as const;

describe("the attention ramp", () => {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  it("is a full ramp at hue 100", () => {
    for (const step of steps) {
      expect(raw(`--attention-${step}`, "light")).toMatch(
        /^oklch\([\d.]+% [\d.]+ 100\)$/,
      );
    }
  });

  it("stays inside sRGB at every step", () => {
    /* 700, 800 and 900 were first drawn at chroma 0.106, 0.093 and 0.083,
           where the blue channel goes negative and the browser clips it to a
           different, duller colour than the declaration says. */
    for (const step of steps) {
      const lin = parseOklch(raw(`--attention-${step}`, "light"));
      expect(lin, `--attention-${step}`).not.toBeNull();
      for (const channel of lin ?? []) {
        expect(channel, `--attention-${step}`).toBeGreaterThan(-0.0005);
      }
    }
  });

  it("is the lemon the draft chip is drawn in", () => {
    expect(colour("--attention-100", "light")).toBe("#feef97");
    expect(colour("--attention-700", "light")).toBe("#736503");
  });

  it("shares the warning wash's lightness and differs by hue", () => {
    /* The two 100 steps sit at the same 94.5% lightness (1.01:1 apart);
           what tells a draft from a warning is the hue, 100 against 58. */
    expect(raw("--attention-100", "light")).toMatch(/^oklch\(94\.5% /);
    expect(raw("--warning-100", "light")).toMatch(/^oklch\(94\.5% /);
    expect(raw("--attention-100", "light")).toMatch(/ 100\)$/);
    expect(raw("--warning-100", "light")).toMatch(/ 58\.3\)$/);
  });
});

describe("the tone washes", () => {
  it("read neutral's word on its wash, in light and inside a .dark scope", () => {
    /* Neutral has no ramp: its wash is --muted, a gray alpha over the
           page, and its word is --foreground. Composite the wash over the
           page the way the browser does and pin the pair like the others. */
    for (const scope of ["light", "dark"] as const) {
      const page = colour("--background", scope);
      const ink = colour("--foreground", scope);
      const wash = composite(literal("--muted", scope), page);
      expect(
        contrastRatio(ink, wash),
        `neutral word on wash, ${scope}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("put every wash on step 100", () => {
    for (const tone of TONES) {
      expect(alias(`--${tone}-subtle`, "light")).toBe(`var(--${tone}-100)`);
    }
  });

  it("tint the error fill: destructive-subtle moved off step 50", () => {
    expect(colour("--destructive-subtle", "light")).toBe("#ffe6e3");
  });

  it("read at least 4.5:1 as text on their own wash, in light", () => {
    for (const tone of TONES) {
      const ratio = contrastRatio(
        colour(`--${tone}`, "light"),
        colour(`--${tone}-subtle`, "light"),
      );
      expect(ratio, `${tone} text on wash`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("read at least 4.5:1 as text on their own wash, inside a .dark scope", () => {
    for (const tone of TONES) {
      const ratio = contrastRatio(
        colour(`--${tone}`, "dark"),
        colour(`--${tone}-subtle`, "dark"),
      );
      expect(ratio, `${tone} text on dark wash`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("resolve to the 950 wash and the 400 text in a .dark scope", () => {
    for (const tone of TONES) {
      expect(alias(`--${tone}-subtle`, "dark")).toBe(`var(--${tone}-950)`);
      expect(alias(`--${tone}`, "dark")).toBe(`var(--${tone}-400)`);
    }
  });
});

describe("the glyph steps", () => {
  it("clear 3:1 as an icon on the white card", () => {
    const white = colour(PAGE.light, "light");
    for (const tone of [...TONES, "neutral"] as const) {
      const ratio = contrastRatio(colour(`--${tone}-glyph`, "light"), white);
      expect(ratio, `${tone} glyph on white`).toBeGreaterThanOrEqual(3);
    }
  });

  it("clear 3:1 on the ink ground inside a .dark scope", () => {
    const ink = colour(PAGE.dark, "dark");
    for (const tone of [...TONES, "neutral"] as const) {
      const ratio = contrastRatio(colour(`--${tone}-glyph`, "dark"), ink);
      expect(ratio, `${tone} glyph on ink`).toBeGreaterThanOrEqual(3);
    }
  });

  it("sit on step 500 in light and step 400 in a .dark scope", () => {
    for (const tone of TONES) {
      expect(alias(`--${tone}-glyph`, "light")).toBe(`var(--${tone}-500)`);
      expect(alias(`--${tone}-glyph`, "dark")).toBe(`var(--${tone}-400)`);
    }
  });

  it("give neutral the gray that holds 3:1, not the quiet-icon opacity", () => {
    /* icon-quiet composites to 2.96:1 on the rail grey; gray-500 is the
           ramp's fixed point, the same in both themes. */
    expect(alias("--neutral-glyph", "light")).toBe("var(--gray-500)");
    expect(alias("--neutral-glyph", "dark")).toBe("var(--gray-500)");
  });
});

describe("the sRGB fallback", () => {
  const fallback =
    readFileSync(join(__dirname, "..", "foundation.css"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("@supports not (color: oklch(0% 0 0))")[1] ?? "";

  it("carries every attention step as the hex its oklch paints", () => {
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      const found = fallback.match(
        new RegExp(`--attention-${step}:\\s*(#[0-9a-f]{6});`, "i"),
      );
      expect(found?.[1]?.toLowerCase(), `--attention-${step}`).toBe(
        colour(`--attention-${step}`, "light"),
      );
    }
  });

  it("carries the attention foreground the other tones already have", () => {
    expect(fallback).toMatch(/--attention-foreground:\s*#ffffff;/);
    expect(fallback).toMatch(/--warning-foreground:\s*#ffffff;/);
  });
});
