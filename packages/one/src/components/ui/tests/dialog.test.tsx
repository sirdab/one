import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogCloseLabelProvider,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";

function renderDialog() {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل الاسم</DialogTitle>
          <DialogDescription>يظهر على المتجر.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button>حفظ</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe("Dialog", () => {
  it("paints the frosted scrim, not a black dim", () => {
    renderDialog();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    const cls = overlay?.className ?? "";
    expect(cls).toContain("bg-scrim-surface");
    expect(cls).toContain("backdrop-blur-scrim");
    expect(cls).toContain("duration-200");
    expect(cls).not.toContain("bg-black");
  });

  it("wears the modal panel recipe at every size", () => {
    renderDialog();
    const content = document.querySelector('[data-slot="dialog-content"]');
    const cls = content?.className ?? "";
    expect(cls).toContain("bg-surface-modal");
    expect(cls).toContain("shadow-modal");
    expect(cls).toContain("rounded-modal");
    expect(cls).not.toContain("sm:rounded");
    expect(cls).toContain("p-5");
    expect(cls).toContain("gap-5");
    expect(cls).toContain("max-w-lg");
    expect(cls).toContain("z-modal");
  });

  it("is a named, described dialog with a close control", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog", { name: "تعديل الاسم" });
    expect(dialog.getAttribute("aria-describedby")).not.toBeNull();
    expect(document.querySelector('[data-slot="dialog-close"]')).not.toBeNull();
  });

  it("reverses the footer stack on mobile", () => {
    renderDialog();
    const footer = document.querySelector('[data-slot="dialog-footer"]');
    expect(footer?.className).toContain("flex-col-reverse");
    expect(footer?.className).toContain("sm:flex-row");
    expect(footer?.className).toContain("sm:justify-end");
  });
});

describe("Dialog launcher position", () => {
  function renderLauncher(
    props: Partial<React.ComponentProps<typeof DialogContent>> = {},
  ): void {
    render(
      <Dialog defaultOpen>
        <DialogContent position="launcher" {...props}>
          <DialogTitle>بحث</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
  }

  it("is a fixed box that never resizes with its results, no close X", () => {
    renderLauncher();
    const content = document.querySelector('[data-slot="dialog-content"]');
    const cls = content?.className ?? "";

    expect(cls).toContain("md:top-shell-launcher");
    expect(cls).toContain("md:h-shell-launcher");
    expect(cls).toContain("md:w-shell-palette");
    expect(cls).toContain("border-border");
    expect(cls).not.toContain("top-1/2");
    expect(cls).not.toContain("shadow-modal");

    expect(content?.getAttribute("style") ?? "").not.toContain(
      "calc(100% - 2rem)",
    );
    expect(document.querySelector('[data-slot="dialog-close"]')).toBeNull();
  });

  it("is the whole screen below md, the token only from md", () => {
    renderLauncher();
    const classes = (
      document.querySelector('[data-slot="dialog-content"]')?.className ?? ""
    ).split(" ");
    for (const phone of [
      "max-md:top-0",
      "max-md:inset-x-0",
      "max-md:h-dvh",
      "max-md:w-auto",
      "max-md:rounded-none",
      "max-md:border-0",
    ]) {
      expect(classes).toContain(phone);
    }
    for (const wide of [
      "md:w-shell-palette",
      "md:left-1/2",
      "md:-translate-x-1/2",
    ]) {
      expect(classes).toContain(wide);
    }
    expect(classes).not.toContain("max-md:inset-x-4");
    expect(classes).not.toContain("w-shell-palette");
    expect(classes).not.toContain("left-1/2");
  });

  it("carries no inline height bound of its own", () => {
    renderLauncher();
    const style =
      document
        .querySelector('[data-slot="dialog-content"]')
        ?.getAttribute("style") ?? "";
    expect(style).not.toContain("max-height");
  });

  describe("on a phone with the keyboard up", () => {
    afterEach(() => {
      vi.restoreAllMocks();
      Reflect.deleteProperty(window, "visualViewport");
    });

    function stubPhone(matches: boolean): void {
      vi.spyOn(window, "matchMedia").mockImplementation(
        (query: string) =>
          ({
            matches: matches && query === "(width < 48rem)",
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
          }) as unknown as MediaQueryList,
      );
      Object.defineProperty(window, "visualViewport", {
        value: Object.assign(new EventTarget(), {
          height: 520,
          offsetTop: 30,
        }),
        configurable: true,
      });
    }

    it("is sized to the visible part of the screen", () => {
      stubPhone(true);
      renderLauncher();
      const content = document.querySelector(
        '[data-slot="dialog-content"]',
      ) as HTMLElement;
      expect(content.style.height).toBe("520px");
      expect(content.style.top).toBe("30px");
    });

    it("leaves the desktop panel to size itself", () => {
      stubPhone(false);
      renderLauncher();
      const content = document.querySelector(
        '[data-slot="dialog-content"]',
      ) as HTMLElement;
      expect(content.style.height).toBe("");
      expect(content.style.top).toBe("");
    });
  });

  it("keeps the close X when a caller asks for it", () => {
    renderLauncher({ showCloseButton: true });
    expect(document.querySelector('[data-slot="dialog-close"]')).not.toBeNull();
  });

  it("leaves the ordinary dialog centred with its X", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>عادي</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.className ?? "").toContain("top-1/2");
    expect(document.querySelector('[data-slot="dialog-close"]')).not.toBeNull();
  });

  it.each([
    [undefined, "إغلاق"],
    ["إلغاء", "إلغاء"],
  ])(
    "names its close X in the app's own word unless the call site says (%s)",
    (closeLabel, expected) => {
      render(
        <DialogCloseLabelProvider label="إغلاق">
          <Dialog defaultOpen>
            <DialogContent closeLabel={closeLabel}>
              <DialogTitle>أ</DialogTitle>
            </DialogContent>
          </Dialog>
        </DialogCloseLabelProvider>,
      );
      expect(screen.getByRole("button", { name: expected })).toBeTruthy();
    },
  );
});
