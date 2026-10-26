import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogCloseLabelProvider,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog";

/* The local lift ladder (foundation.css --z-*): the dialog panel is its own
   stacking context (fixed, z-modal), so these only race each other. */
const LOCAL_Z: Record<string, number> = {
  "z-behind": -1,
  "z-raised": 1,
  "z-raised-more": 2,
};

function zOf(element: Element | null | undefined): number {
  const found = (element?.className ?? "")
    .split(/\s+/)
    .find((cls) => cls in LOCAL_Z);
  return found === undefined ? 0 : (LOCAL_Z[found] ?? 0);
}

function renderDialog(title = "تعديل الاسم"): void {
  render(
    <DialogCloseLabelProvider label="إغلاق">
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>يظهر على المتجر.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DialogCloseLabelProvider>,
  );
}

/* The close X and the sticky header share a corner. The header comes later in
   the DOM with an opaque fill, so an X on the same layer is painted over:
   invisible and untappable (a hit test at its centre lands on the title) while
   still in the accessibility tree and reachable by Tab. jsdom has no paint, so
   this pins the layer order that decides it. */
describe("Dialog close X", () => {
  it("is painted above the sticky header that spans its corner", () => {
    renderDialog();
    const strip = document
      .querySelector('[data-slot="dialog-close"]')
      ?.closest("div");
    const header = document.querySelector('[data-slot="dialog-header"]');
    expect(strip).not.toBeNull();
    expect(header).not.toBeNull();
    expect(zOf(strip)).toBeGreaterThan(zOf(header));
  });

  it("is still the named control a screen reader and Tab reach", () => {
    renderDialog();
    const close = screen.getByRole("button", { name: "إغلاق" });
    expect(close.getAttribute("data-slot")).toBe("dialog-close");
  });

  /* Once it can be seen, a long title must not run under it: the title keeps
       clear of the corner, symmetrically on a phone where it is centred. */
  it("keeps the title clear of the X", () => {
    renderDialog("حذف متجر بإسم طويل جدًا يملأ السطر كله");
    const title = screen.getByRole("heading").className;
    expect(title).toContain("group-data-[has-close]/dialog:max-sm:px-9");
    expect(title).toContain("group-data-[has-close]/dialog:sm:pe-9");
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.className).toContain("group/dialog");
    expect(content?.hasAttribute("data-has-close")).toBe(true);
  });

  it("leaves the title its full width when the dialog has no X", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>بحث</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.hasAttribute("data-has-close")).toBe(false);
    expect(document.querySelector('[data-slot="dialog-close"]')).toBeNull();
  });
});
