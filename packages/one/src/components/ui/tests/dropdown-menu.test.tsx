import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { overlayItemChrome } from "../overlay";

function renderMenu() {
  render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>خيارات</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
        <DropdownMenuItem>تعديل</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">أ</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">ب</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe("DropdownMenu", () => {
  /* The panel is the frosted popover chrome at the MENU radius (12px,
       one step softer than the picker's 10) entering at the 200ms menu
       tier. */
  it("wears the frosted panel at the menu radius and tier", () => {
    renderMenu();
    const panel = document.querySelector('[data-slot="dropdown-menu-content"]');
    const cls = panel?.className ?? "";
    expect(cls).toContain("bg-popover-surface");
    expect(cls).toContain("backdrop-blur-popover");
    expect(cls).toContain("shadow-popover-sm");
    expect(cls).toContain("rounded-xl");
    expect(cls).toContain("before:rounded-xl");
    expect(cls).not.toContain("rounded-lg");
    // The shared panel motion, scaled about its own centre: no Radix
    // origin pulling it toward the trigger.
    expect(cls).toContain("duration-150");
    expect(cls).toContain("zoom-in-95");
    expect((panel as HTMLElement).style.transformOrigin).toBe("");
    // z-popover (500): floating panels must layer ABOVE a modal (400).
    // A select inside a dialog once opened BEHIND it on z-dropdown.
    expect(cls).toContain("z-popover");
  });

  /* The row recipe is shared by every floating list (Select, Command,
       this menu), so the 44px touch floor lives in overlayItemChrome and
       reaches all of them. The STU-06 critic measured a 36px row on a
       phone. */
  it("takes the 44px touch floor on every row", () => {
    renderMenu();
    const rows = document.querySelectorAll(
      '[data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-radio-item"]',
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.className).toContain("pointer-coarse:min-h-11");
    }
    expect(overlayItemChrome).toContain("pointer-coarse:min-h-11");
  });

  /* An opened menu is the focus of the screen: its rows rest in ink
       (never secondary grey), the highlight adds the ghost fill, and
       colours SNAP (no transition class; the instant tier). */
  it("rests in ink, highlights with the ghost fill, and snaps", () => {
    renderMenu();
    const item = screen.getByRole("menuitem", { name: "تعديل" });
    expect(item.className).toContain("text-foreground");
    expect(item.className).not.toContain("text-muted-foreground");
    expect(item.className).toContain(
      "data-highlighted:bg-btn-ghost-surface-hover",
    );
    expect(item.className).not.toContain("transition");
  });

  /* The current choice holds a STATIC alpha-100 fill and ink text:
       no check glyph; the fill is the mark. */
  it("marks the current radio choice with a static fill, no check", () => {
    renderMenu();
    const checked = screen.getByRole("menuitemradio", { name: "أ" });
    expect(checked.getAttribute("data-state")).toBe("checked");
    expect(checked.className).toContain(
      "data-[state=checked]:bg-gray-alpha-100",
    );
    expect(checked.querySelector("svg")).toBeNull();
  });

  it("renders the role=menu semantics with label and separator", () => {
    renderMenu();
    expect(screen.getByRole("menu")).not.toBeNull();
    const label = document.querySelector('[data-slot="dropdown-menu-label"]');
    expect(label?.className).toContain("text-label");
    expect(label?.className).toContain("text-muted-foreground");
    expect(
      document.querySelector('[data-slot="dropdown-menu-separator"]'),
    ).not.toBeNull();
  });
});

/* Submenus go ONE level deep [Sirdab 2026-07-30, reversing the earlier
   "deliberately absent" call]. The chevron is a direction-of-reading glyph,
   so it has to mirror in RTL or it points out of the menu in Arabic. */
describe("DropdownMenu submenu", () => {
  function renderSub() {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>خيارات</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub defaultOpen>
            <DropdownMenuSubTrigger>المظهر</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>فاتح</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
  }

  it("mirrors the trigger chevron in RTL", () => {
    renderSub();
    const trigger = screen.getByText("المظهر");
    expect(trigger.querySelector("svg")?.getAttribute("class")).toContain(
      "rtl:-scale-x-100",
    );
  });

  it("gives the sub panel the same frosted chrome as the root menu", () => {
    renderSub();
    fireEvent.click(screen.getByText("المظهر"));
    fireEvent.keyDown(screen.getByText("المظهر"), { key: "Enter" });
    const sub = document.querySelector(
      '[data-slot="dropdown-menu-sub-content"]',
    );
    expect(sub?.className).toContain("rounded-xl");
    expect(sub?.className).toContain("z-popover");
  });
});

/* SAI-1123. A menu is a list, and a list of every section a store owns
   outgrows the screen. Radix publishes the room it has; the menu never read
   it, so the overflow simply ran off the bottom edge with nothing to scroll. */
describe("DropdownMenu overflow", () => {
  function renderLongMenu(): void {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>خيارات</DropdownMenuTrigger>
        <DropdownMenuContent>
          {Array.from({ length: 40 }, (_, i) => (
            <DropdownMenuItem key={i}>قسم {i}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>,
    );
  }

  it("caps itself against the room Radix says it has", () => {
    renderLongMenu();
    const menu = document.querySelector<HTMLElement>(
      '[data-slot="dropdown-menu-content"]',
    );
    expect(menu?.style.maxHeight).toBe(
      "var(--radix-dropdown-menu-content-available-height)",
    );
  });

  it("scrolls the overflow inside the panel, so the frosted background stays behind every row", () => {
    renderLongMenu();
    const panel = document.querySelector('[data-slot="dropdown-menu-content"]');
    const viewport = panel?.querySelector(
      '[data-slot="dropdown-menu-viewport"]',
    );
    // The panel carries the frost and never scrolls: a ::before over a
    // scrolling box scrolls away with the rows.
    expect(panel?.className).toContain("overflow-hidden");
    expect(panel?.className).not.toContain("overflow-y-auto");
    expect(viewport?.className).toContain("overflow-y-auto");
    expect(viewport?.className).toContain("p-1");
    // The phone half: without these iOS hands the drag to the body vaul
    // pinned, and the menu under the finger never moves.
    expect(viewport?.className).toContain("touch-pan-y");
    expect(viewport?.className).toContain("overscroll-contain");
  });
});
