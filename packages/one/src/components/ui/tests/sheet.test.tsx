import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sheet, SheetContent, SheetTitle } from "../sheet";

function renderSheet(side?: "start" | "end" | "bottom") {
  render(
    <Sheet side={side} defaultOpen>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle className="sr-only">
          \u0627\u0644\u062a\u0646\u0642\u0644
        </SheetTitle>
        \u0645\u062d\u062a\u0648\u0649
      </SheetContent>
    </Sheet>,
  );
}

describe("Sheet", () => {
  /* The one-scrim doctrine: the drawer shares the dialog's frosted
       veil. The stock dark off-canvas dim is the pattern this replaces. */
  it("shares the dialog's frosted scrim", () => {
    renderSheet();
    const overlay = document.querySelector('[data-slot="sheet-overlay"]');
    const cls = overlay?.className ?? "";
    expect(cls).toContain("bg-scrim-surface");
    expect(cls).toContain("backdrop-blur-scrim");
    expect(cls).not.toContain("bg-black");
  });

  /* The drawer pattern [Sirdab 2026-07-28]: a FLOATING inset panel
       (8px off the viewport, rounded on every corner) on bg-background
       with shadow-modal-lg. */
  it("floats inset and rounded on our tokens", () => {
    renderSheet();
    const content = document.querySelector('[data-slot="sheet-content"]');
    const cls = content?.className ?? "";
    expect(cls).toContain("bg-background");
    expect(cls).not.toContain("bg-surface-rail");
    expect(cls).toContain("rounded-2xl");
    expect(cls).toContain("inset-y-2");
    expect(cls).toContain("end-2");
    expect(cls).toContain("w-3/4");
    expect(cls).toContain("sm:max-w-sm");
    expect(cls).toContain("shadow-modal-lg");
    expect(content?.getAttribute("data-side")).toBe("end");
  });

  it("bottom tray floats with the grab handle", () => {
    renderSheet("bottom");
    const content = document.querySelector(
      '[data-slot="sheet-content"]',
    ) as HTMLElement;
    expect(content.className).toContain("inset-x-2");
    expect(content.className).toContain("bottom-2");
    expect(content.className).toContain("rounded-2xl");
    // the vaul grab handle
    expect(content.querySelector(".rounded-full.bg-muted")).not.toBeNull();
    // structural height cap rides in style
    expect(content.style.maxHeight).toBe("80dvh");
  });
});
