import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { contrastRatio } from "@sirdab/one/foundation";

import { AssistantAuroraIcon } from "../shell";

const css: string = readFileSync(
  resolve(__dirname, "../../../foundation/foundation.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

type Oklch = { l: number; c: number; h: number };

type Rgb = [number, number, number];
type Scope = "light" | "dark";
type Stop = { offset: number; role: string };

const parseOklch = (value: string): Oklch | null => {
  const m = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/.exec(value);
  if (!m) return null;
  return { l: Number(m[1]) / 100, c: Number(m[2]), h: Number(m[3]) };
};

const encode = (x: number): number =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
const decode = (x: number): number =>
  x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

const oklchToRgb = ({ l, c, h }: Oklch): Rgb => {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    encode(clamp01(4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp)),
    encode(clamp01(-1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp)),
    encode(clamp01(-0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp)),
  ];
};

const rgbHue = ([r, g, b]: Rgb): number => {
  const lr = decode(r);
  const lg = decode(g);
  const lb = decode(b);
  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
};

const toHex = (rgb: Rgb): string =>
  `#${rgb
    .map((x) =>
      Math.round(clamp01(x) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

const hueGap = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

const tokens = new Map<string, Oklch>();
for (const m of css.matchAll(/(--aurora-[\w-]+)\s*:\s*(oklch\([^)]*\))\s*;/g)) {
  const color = parseOklch(m[2] ?? "");
  if (color) tokens.set(m[1] ?? "", color);
}

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

const ramp: Stop[] = (() => {
  const { container } = render(<AssistantAuroraIcon />);
  const stops =
    container.querySelector("linearGradient")?.querySelectorAll("stop") ?? [];
  return [...stops].map((stop) => ({
    offset: Number(stop.getAttribute("offset") ?? 0),
    role:
      /var\(\s*(--[\w-]+)\s*\)/.exec(stop.getAttribute("style") ?? "")?.[1] ??
      "",
  }));
})();

const along = (stops: Stop[], scope: Scope, t: number): Rgb => {
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) throw new Error("the ramp has no stops");
  if (t <= first.offset) return oklchToRgb(roleColor(scope, first.role));
  if (t >= last.offset) return oklchToRgb(roleColor(scope, last.role));
  for (let i = 1; i < sorted.length; i += 1) {
    const lo = sorted[i - 1];
    const hi = sorted[i];
    if (!lo || !hi || t > hi.offset) continue;
    const k = (t - lo.offset) / (hi.offset - lo.offset);
    const a = oklchToRgb(roleColor(scope, lo.role));
    const b = oklchToRgb(roleColor(scope, hi.role));
    return [
      a[0] + (b[0] - a[0]) * k,
      a[1] + (b[1] - a[1]) * k,
      a[2] + (b[2] - a[2]) * k,
    ];
  }
  throw new Error(`no stop covers t ${t}`);
};

const range = (from: number, to: number, steps: number): number[] =>
  Array.from({ length: steps + 1 }, (_, i) => from + ((to - from) * i) / steps);

const SHOWN: number[] = range(0, 0.75, 15);

const SCOPES: Scope[] = ["light", "dark"];

const nearStatus = (stops: Stop[], samples: number[]): string[] => {
  const tooClose: string[] = [];
  for (const scope of SCOPES) {
    for (const t of samples) {
      const h = rgbHue(along(stops, scope, t));
      for (const status of statusHues) {
        if (hueGap(h, status.h) < 20) {
          tooClose.push(
            `t ${t.toFixed(2)} (${scope}, hue ${h.toFixed(1)}) vs ${status.name} (${status.h})`,
          );
        }
      }
    }
  }
  return tooClose;
};

describe("the icon's stops are found", () => {
  it("reads the ramp, the tokens and the status ramps", () => {
    expect(ramp.length).toBeGreaterThanOrEqual(3);
    expect(tokens.size).toBeGreaterThanOrEqual(8);
    expect(statusHues.map((s) => s.name)).toContain("warning");
    expect(statusHues.map((s) => s.name)).toContain("destructive");
  });
});

describe("the mark's ramp, as painted", () => {
  it("paints only from roles both theme scopes declare", () => {
    const painted = new Set(ramp.map((s) => s.role));
    for (const scope of SCOPES) {
      const declared = roles(scope);
      expect([...painted].filter((role) => !declared.has(role))).toEqual([]);
    }
  });

  it("keeps its blend 20 degrees clear of warning and destructive", () => {
    expect(nearStatus(ramp, SHOWN)).toEqual([]);
  });

  it("clears 3:1 on the grounds it sits on, in the scope that ground uses", () => {
    const grounds: Record<Scope, string[]> = {
      light: ["#ffffff", "#fafafa"],
      dark: ["#0f0f0f", "#16122a"],
    };
    const low: string[] = [];
    for (const scope of SCOPES) {
      for (const ground of grounds[scope]) {
        for (const t of SHOWN) {
          const ratio = contrastRatio(toHex(along(ramp, scope, t)), ground);
          if (ratio < 3) {
            low.push(
              `t ${t.toFixed(2)} on ${ground} (${scope}): ${ratio.toFixed(2)}`,
            );
          }
        }
      }
    }
    expect(low).toEqual([]);
  });
});
