import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SEGMENTED_ITEM, SEGMENTED_THUMB, SEGMENTED_TRACK } from "../segmented";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

function activePanel(): Element | null {
  return document.querySelector(
    '[data-slot="tabs-content"][data-state="active"]',
  );
}

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
  it("carries the responsive page-tabs recipe", () => {
    renderTabs();
    const frame = document.querySelector('[data-slot="tabs-list-frame"]');
    expect(frame?.className).toContain("border-b");
    const list = document.querySelector('[data-slot="tabs-list"]');
    const listCls = list?.className ?? "";

    expect(listCls).toContain("-mb-px");
    expect(listCls).toContain("justify-around");
    expect(listCls).toContain("lg:justify-start");
    expect(listCls).toContain("no-scrollbar");
    const trigger = document.querySelector('[data-slot="tabs-trigger"]');
    const cls = trigger?.className ?? "";
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("data-[state=active]:text-foreground");

    expect(cls).not.toContain("transition");

    const pill = trigger?.querySelector('[data-slot="tabs-trigger-pill"]');
    expect(pill?.className).toContain(
      "lg:group-data-[state=active]/tabs-trigger:border-gray-alpha-200",
    );
    expect(pill?.className).toContain("rounded-lg");
  });

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

  it("selects on pointer without stealing focus", () => {
    renderTabs();
    const second = screen.getAllByRole("tab")[1];
    fireEvent.mouseDown(second, { button: 0 });
    expect(second.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).not.toBe(second);
    expect(activePanel()?.textContent).toBe("المحتوى ب");
  });
});

describe("Tabs panel area", () => {
  it("stacks every panel in the same grid cell", () => {
    renderTabs();
    const root = document.querySelector('[data-slot="tabs"]');
    expect(root?.className).toContain("grid");
    const panels = document.querySelectorAll('[data-slot="tabs-content"]');

    expect(panels.length).toBe(2);
    for (const panel of panels) {
      expect(panel.className).toContain("col-start-1");
      expect(panel.className).toContain("row-start-2");
      expect(panel.hasAttribute("hidden")).toBe(false);
    }

    const frame = document.querySelector('[data-slot="tabs-list-frame"]');
    expect(frame?.className).toContain("row-start-1");
  });

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

  it("slides on an inner element, not the panel box", () => {
    renderTabs();
    expect(
      activePanel()?.querySelector('[data-slot="tabs-content-inner"]'),
    ).not.toBeNull();
  });

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

  it("rests quiet and rises to ink on hover and when active", () => {
    renderTabs("segmented");
    const cls =
      document.querySelector('[data-slot="tabs-trigger"]')?.className ?? "";
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("hover:text-foreground");
    expect(cls).toContain("data-[state=active]:text-foreground");
  });
});
