import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SEGMENTED_ITEM, SEGMENTED_THUMB, SEGMENTED_TRACK } from "../segmented";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

/** Every panel is mounted now, so "the panel" means the active one. */
function activePanel(): Element | null {
  return document.querySelector(
    '[data-slot="tabs-content"][data-state="active"]',
  );
}

/* jsdom lays nothing out: give each trigger a 100px column, 4px apart. */
function stubTriggerRects(): void {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement): DOMRect {
      const triggers = [
        ...document.querySelectorAll('[data-slot="tabs-trigger"]'),
      ];
      const index = triggers.indexOf(this);
      return new DOMRect(
        index === -1 ? 0 : index * 104,
        0,
        index === -1 ? 0 : 100,
        40,
      );
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

function renderTabs(variant?: "underline" | "segmented") {
  render(
    <Tabs variant={variant} defaultValue="a">
      <TabsList aria-label="عرض">
        <TabsTrigger value="a">أ</TabsTrigger>
        <TabsTrigger value="b">ب</TabsTrigger>
      </TabsList>
      <TabsContent value="a">المحتوى أ</TabsContent>
      <TabsContent value="b">المحتوى ب</TabsContent>
    </Tabs>,
  );
}

describe("Tabs underline", () => {
  /* The responsive page-tabs recipe: quiet rows rising to ink, the
       bordered pill from lg, and ONE animated piece, the sliding ink
       underline mounted only on the active trigger. */
  it("carries the responsive page-tabs recipe", () => {
    renderTabs();
    const frame = document.querySelector('[data-slot="tabs-list-frame"]');
    expect(frame?.className).toContain("border-b");
    const list = document.querySelector('[data-slot="tabs-list"]');
    const listCls = list?.className ?? "";
    // -mb-px seats the indicator ON the frame's hairline
    expect(listCls).toContain("-mb-px");
    expect(listCls).toContain("justify-around");
    expect(listCls).toContain("lg:justify-start");
    expect(listCls).toContain("no-scrollbar");
    const trigger = document.querySelector('[data-slot="tabs-trigger"]');
    const cls = trigger?.className ?? "";
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("data-[state=active]:text-foreground");
    // trigger colours snap: the slide lives on the indicator
    expect(cls).not.toContain("transition");
    // the lg pill on the inner span
    const pill = trigger?.querySelector('[data-slot="tabs-trigger-pill"]');
    expect(pill?.className).toContain(
      "lg:group-data-[state=active]/tabs-trigger:border-gray-alpha-200",
    );
    expect(pill?.className).toContain("rounded-lg");
  });

  /* The underline: the minted 2px ink bar (wider + darker than the
       1.5px gray-alpha-800 alternative [Sirdab 2026-07-28]), only ever
       on the ACTIVE trigger.
       It slides there via shared layout, never duplicates. */
  it("mounts the ink indicator on the active trigger only", () => {
    renderTabs();
    const indicators = document.querySelectorAll(
      '[data-slot="tabs-trigger-indicator"]',
    );
    expect(indicators.length).toBe(1);
    const cls = indicators[0].className;
    expect(cls).toContain("h-tab-indicator");
    expect(cls).toContain("bg-foreground");
    expect(indicators[0].closest('[data-state="active"]')).not.toBeNull();
  });

  /* The bar slides by a FLIP inside the trigger that is now active: born
       at the previous tab's edges, eased home at 200ms, and quiet on load. */
  it("slides the underline from the previous tab and says so while it runs", () => {
    stubTriggerRects();
    renderTabs();
    const triggers = screen.getAllByRole("tab");
    const first = document.querySelector(
      '[data-slot="tabs-trigger-indicator"]',
    );
    expect(first?.hasAttribute("data-sliding")).toBe(false);
    expect(first?.getAttribute("style")).toBeNull();

    const observer = new MutationObserver(() => undefined);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
      attributeOldValue: true,
    });
    fireEvent.mouseDown(triggers[1], { button: 0 });
    const history = observer
      .takeRecords()
      .map((record) => record.oldValue ?? "")
      .join("|");
    observer.disconnect();
    expect(history).toContain("transition: none");
    expect(history).toContain("left: -104px");

    const bar = triggers[1].querySelector(
      '[data-slot="tabs-trigger-indicator"]',
    );
    expect(bar?.hasAttribute("data-sliding")).toBe(true);
    expect(bar?.className).toContain("transition-all");
    expect(bar?.className).toContain("duration-200");
    fireEvent.transitionEnd(bar as Element);
    expect(bar?.hasAttribute("data-sliding")).toBe(false);
  });

  it("is real tabs semantics with an active panel", () => {
    renderTabs();
    const selected = document.querySelector('[aria-selected="true"]');
    expect(selected?.textContent).toBe("أ");
    expect(activePanel()?.textContent).toBe("المحتوى أ");
  });

  /* Pointer clicks select through the controlled mirror with
       preventDefault. Radix's programmatic focus-on-mousedown tripped
       Chrome's :focus-visible and painted the global ring on every
       click. The trigger must switch WITHOUT taking focus. */
  it("selects on pointer without stealing focus", () => {
    renderTabs();
    const second = screen.getAllByRole("tab")[1];
    fireEvent.mouseDown(second, { button: 0 });
    expect(second.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).not.toBe(second);
    expect(activePanel()?.textContent).toBe("المحتوى ب");
  });
});

/* The no-shift contract: every panel stays in the layout, stacked in
   ONE grid cell, so the container is the tallest panel's height and a
   switch can never resize it. */
describe("Tabs panel area", () => {
  it("stacks every panel in the same grid cell", () => {
    renderTabs();
    const root = document.querySelector('[data-slot="tabs"]');
    expect(root?.className).toContain("grid");
    const panels = document.querySelectorAll('[data-slot="tabs-content"]');
    // both mounted: the short panel reserves the tall one's space
    expect(panels.length).toBe(2);
    for (const panel of panels) {
      expect(panel.className).toContain("col-start-1");
      expect(panel.className).toContain("row-start-2");
      expect(panel.hasAttribute("hidden")).toBe(false);
    }
    // …and the list takes the row above them
    const frame = document.querySelector('[data-slot="tabs-list-frame"]');
    expect(frame?.className).toContain("row-start-1");
  });

  /* Mounted but not present: several visible tabpanels would be
       announced and focusable, so the inactive ones go inert and let
       clicks through to the live panel underneath. */
  it("keeps inactive panels out of the a11y tree and pointer path", () => {
    renderTabs();
    const inactive = document.querySelector(
      '[data-slot="tabs-content"][data-state="inactive"]',
    );
    expect(inactive?.hasAttribute("inert")).toBe(true);
    expect(inactive?.className).toContain("pointer-events-none");
    const active = activePanel();
    expect(active?.hasAttribute("inert")).toBe(false);
    expect(active?.className).not.toContain("pointer-events-none");
  });

  /* The slide is a transform on an INNER element: the panel's own box
       never moves, which is what keeps the grid height still. */
  it("slides on an inner element, not the panel box", () => {
    renderTabs();
    expect(
      activePanel()?.querySelector('[data-slot="tabs-content-inner"]'),
    ).not.toBeNull();
  });

  /* The outgoing panel rests on the side its tab sits on and fades; the
       incoming one arrives from there. CSS does the motion at 200ms, and a
       first paint is already in place (no transition runs on load). */
  it("rests the inactive panel off-centre and faded, and eases both", () => {
    renderTabs();
    const inner = (state: string) =>
      document.querySelector(
        `[data-slot="tabs-content"][data-state="${state}"] [data-slot="tabs-content-inner"]`,
      ) as HTMLElement;
    expect(inner("active").style.transform).toBe("translateX(0px)");
    expect(inner("active").style.opacity).toBe("1");
    expect(inner("inactive").style.transform).toBe("translateX(16px)");
    expect(inner("inactive").style.opacity).toBe("0");
    expect(inner("active").className).toContain("transition");
    expect(inner("active").className).toContain("duration-200");
    fireEvent.mouseDown(screen.getAllByRole("tab")[1], { button: 0 });
    expect(inner("active").style.transform).toBe("translateX(0px)");
    expect(inner("inactive").style.transform).toBe("translateX(-16px)");
  });
});

describe("Tabs segmented", () => {
  /* ONE recipe with Segmented, read from segmented.tsx: the same 4% wash
       track (40 high, 44 on touch, 12px), 8px items, and a white thumb with
       the soft contact shadow. It used to be a solid #EDEDED track with a
       bordered active tab, a second finish for the same shape. */
  it("reads the shared segmented track, item and thumb", () => {
    renderTabs("segmented");
    const list = document.querySelector('[data-slot="tabs-list"]');
    for (const token of SEGMENTED_TRACK.split(" ")) {
      expect(list?.classList.contains(token)).toBe(true);
    }
    expect(list?.className).toContain("bg-muted");
    expect(list?.className).toContain("h-control-xl");
    expect(list?.className).toContain("pointer-coarse:h-control-touch");
    expect(list?.className).toContain("rounded-xl");
    // A track is a wash, never a solid gray step.
    expect(list?.className).not.toMatch(/\bbg-gray-\d+\b/);
    expect(list?.className).not.toContain("h-control-lg");
    const trigger = document.querySelector('[data-slot="tabs-trigger"]');
    for (const token of SEGMENTED_ITEM.split(" ")) {
      expect(trigger?.classList.contains(token)).toBe(true);
    }
    expect(trigger?.className).toContain("rounded-md");
    expect(trigger?.className).not.toContain("border-border");
    expect(trigger?.className).not.toContain("transition");
    const thumb = trigger?.querySelector('[data-slot="tabs-trigger-thumb"]');
    for (const token of SEGMENTED_THUMB.split(" ")) {
      expect(thumb?.classList.contains(token)).toBe(true);
    }
  });

  /* The thumb is placed, not slid: only the active tab carries it. */
  it("places the thumb on the active tab only", () => {
    renderTabs("segmented");
    const triggers = screen.getAllByRole("tab");
    expect(
      triggers[0].querySelector('[data-slot="tabs-trigger-thumb"]'),
    ).not.toBeNull();
    expect(
      triggers[1].querySelector('[data-slot="tabs-trigger-thumb"]'),
    ).toBeNull();
    fireEvent.mouseDown(triggers[1], { button: 0 });
    expect(
      triggers[1].querySelector('[data-slot="tabs-trigger-thumb"]'),
    ).not.toBeNull();
    expect(
      triggers[0].querySelector('[data-slot="tabs-trigger-thumb"]'),
    ).toBeNull();
  });

  /* Quiet text that goes to ink on hover and when chosen, so a tab
       answers the pointer before it is picked. */
  it("rests quiet and rises to ink on hover and when active", () => {
    renderTabs("segmented");
    const cls =
      document.querySelector('[data-slot="tabs-trigger"]')?.className ?? "";
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("hover:text-foreground");
    expect(cls).toContain("data-[state=active]:text-foreground");
  });
});
