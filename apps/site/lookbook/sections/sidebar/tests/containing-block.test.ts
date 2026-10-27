import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("sidebar demo cards", () => {
  it("are each the containing block for the rail they mount", () => {
    const source = readFileSync(join(__dirname, "..", "page.tsx"), "utf8");
    const cards = source
      .split("\n")
      .filter((line) =>
        ["overflow-hidden", "rounded-xl", "border", "border-border"].every(
          (token: string) => line.includes(token),
        ),
      );
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card, card.trim()).toContain("transform-gpu");
    }
  });
});
