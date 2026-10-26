import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* The primitive positions the visible rail with `fixed inset-y-0 h-svh`
   (sidebar.tsx, the sidebar-container slot). A demo card that only clips
   (`overflow-hidden`) does nothing to a fixed child: its containing block is
   the viewport, so the rail paints at the page's edge, over the lookbook's
   own nav. `transform-gpu` makes the card the containing block (the studio
   shell does the same on its workspace card). Every card that mounts a
   SidebarProvider needs it, not only the ones somebody noticed. */
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
