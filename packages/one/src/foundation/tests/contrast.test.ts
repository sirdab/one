import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  ensureContrast,
  isDarkColor,
  lightness,
  monoOn,
} from "../index";

/* Direct numerical contracts for the shared legibility helpers. */
describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#ffffff", "#000000")).toBe(21);
    expect(contrastRatio("#6b6b6b", "#6b6b6b")).toBe(1);
  });

  it("reports the maximum for an unparseable colour so nothing touches it", () => {
    expect(contrastRatio("red", "#ffffff")).toBe(21);
    expect(contrastRatio("#ffffff", "linear-gradient(#000, #fff)")).toBe(21);
  });
});

describe("ensureContrast", () => {
  it("moves a mid-gray ink until it clears 4.5 on a mid-gray ground", () => {
    const ink = ensureContrast("#777777", "#808080", 4.5);
    expect(ink).not.toBe("#777777");
    expect(contrastRatio(ink, "#808080")).toBeGreaterThanOrEqual(4.5);
  });

  it("tries the other direction when the preferred one cannot reach", () => {
    // #808080 reads dark to a luminance test, so white is preferred, but
    // white on it tops out below 4:1. The answer has to come from black.
    const ink = ensureContrast("#777777", "#808080", 4.5);
    expect(isDarkColor(ink)).toBe(true);
  });

  it("returns the ink untouched when it already clears the bar", () => {
    expect(ensureContrast("#151515", "#f4f2ee", 4.5)).toBe("#151515");
    expect(ensureContrast("#6b6b6b", "#f4f2ee", 3)).toBe("#6b6b6b");
  });

  it("returns an unparseable foreground as it came", () => {
    expect(ensureContrast("red", "#ffffff", 4.5)).toBe("red");
  });
});

describe("monoOn", () => {
  it("answers white on a dark ground and black on a light one", () => {
    expect(monoOn("#101010")).toBe("#ffffff");
    expect(monoOn("#f4f2ee")).toBe("#000000");
  });

  it("measures both ways instead of trusting lightness on a mid gold", () => {
    // #c8a24b is dark to a luminance test (white wanted) and black on it
    // still wins by more than three to one.
    expect(isDarkColor("#c8a24b")).toBe(true);
    expect(monoOn("#c8a24b")).toBe("#000000");
  });
});

describe("isDarkColor and lightness", () => {
  it("read the ends of the scale", () => {
    expect(isDarkColor("#101010")).toBe(true);
    expect(isDarkColor("#f4f2ee")).toBe(false);
    expect(isDarkColor("not a colour")).toBe(false);
    expect(lightness("#ffffff")).toBe(100);
    expect(lightness("#000000")).toBe(0);
    expect(lightness("#808080")).toBeGreaterThan(50);
    expect(lightness("#808080")).toBeLessThan(55);
  });
});
