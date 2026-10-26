import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* The shimmer is a utility, not a motion library: ui's Shimmer only names it.
   What has to hold lives in the CSS and no jsdom render can see it: the
   sweep and the breath are real keyframes, the breath is only for a Shimmer
   that asked for it, and reduced motion leaves plain muted text rather than
   a transparent word with nothing painted behind it. */

const css: string = readFileSync(
  join(__dirname, "..", "tailwind.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

function block(source: string, opener: string): string {
  const start = source.indexOf(opener);
  if (start === -1) return "";
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, i + 1);
  }
  return "";
}

const utility: string = block(css, "@utility shimmer");

describe("the shimmer utility", () => {
  it("sweeps and breathes with keyframes the utility names", () => {
    expect(utility).not.toBe("");
    expect(block(css, "@keyframes shimmer-sweep")).not.toBe("");
    expect(block(css, "@keyframes shimmer-breath")).not.toBe("");
    expect(utility).toContain("shimmer-sweep");
    expect(utility).toContain("var(--shimmer-duration");
  });

  it("breathes only when the element carries data-pulse", () => {
    const plain = utility.slice(0, utility.indexOf("[data-pulse]"));
    expect(utility).toContain("[data-pulse]");
    expect(plain).not.toContain("shimmer-breath");
    expect(block(utility, "&[data-pulse]")).toContain("shimmer-breath");
  });

  it("falls back to plain muted text under reduced motion", () => {
    const reduced = block(utility, "@media (prefers-reduced-motion");
    expect(reduced).toContain("animation: none");
    expect(reduced).toContain("var(--color-muted-foreground)");
    expect(reduced).toContain("background-image: none");
  });
});

describe("the reveal-inline utility", () => {
  /* The label and value reveals travel with the sliding thumb, which runs on
       the house curve; without its own timing function the reveal ran on CSS
       ease and the thumb's trailing edge squashed mid-slide. */
  it("runs on the house ease-out", () => {
    const reveal = block(css, "@utility reveal-inline");
    expect(reveal).toContain("transition-timing-function: var(--ease-out)");
  });
});
