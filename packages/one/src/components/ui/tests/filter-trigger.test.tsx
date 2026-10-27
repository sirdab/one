import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterTrigger } from "../filter-trigger";

const items = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

function trigger(): HTMLElement {
  return document.querySelector('[data-slot="filter-trigger"]') as HTMLElement;
}

describe("FilterTrigger", () => {
  it("wears the 40px chip chrome with a static border and ghost fills", () => {
    render(<FilterTrigger label="Category" items={items} empty="none" />);
    const chip = trigger();
    expect(chip.className).toContain("border-btn-border");
    expect(chip.className).toContain("bg-transparent");
    expect(chip.className).toContain("h-control-xl");
    expect(chip.className).toContain("rounded-xl");
    expect(chip.className).toContain("text-body");

    expect(chip.className).not.toContain("hover:border");
    expect(chip.className).not.toContain("border-btn-border-hover");

    expect(chip.className).toContain("hover:bg-btn-ghost-surface-hover");
    expect(chip.className).toContain(
      "data-[state=open]:bg-btn-ghost-surface-active",
    );

    expect(chip.className).toContain("duration-200");
  });

  it("announces aria-haspopup=dialog and rotates the chevron while open", () => {
    render(<FilterTrigger label="Category" items={items} empty="none" />);
    const chip = trigger();
    expect(chip.getAttribute("aria-haspopup")).toBe("dialog");
    const chevron = chip.querySelector('[data-slot="filter-trigger-chevron"]');
    expect(chevron?.className).toContain("ms-1");
    expect(chevron?.className).toContain("opacity-50");
    expect(chevron?.className).toContain(
      "group-data-[state=open]/filter-trigger:rotate-180",
    );
  });

  it("shows the first pick and +N behind the hairline divider", () => {
    render(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        defaultValues={["a", "b", "c"]}
      />,
    );
    const chip = trigger();
    expect(chip.textContent).toContain("Alpha");
    expect(chip.textContent).toContain("+2");
    expect(chip.className).not.toContain("bg-foreground");
    const values = chip.querySelector('[data-slot="filter-trigger-values"]');
    expect(values?.className).toContain("border-s");
    expect(values?.className).toContain("border-border");
    expect(values?.className).not.toContain("border-gray-700");
    const count = values?.querySelector('[dir="ltr"]');
    expect(count?.className).toContain("tabular");

    const clear = chip.querySelector('[data-slot="filter-trigger-clear"]');
    expect(clear).not.toBeNull();
    expect(clear?.getAttribute("role")).toBeNull();
    expect(clear?.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens the applied-value reveal on select and keeps the old value for the exit", () => {
    const { rerender } = render(
      <FilterTrigger label="Category" items={items} empty="none" values={[]} />,
    );
    const reveal = trigger().querySelector(".reveal-inline");
    expect(reveal).not.toBeNull();
    expect(reveal?.hasAttribute("data-open")).toBe(false);
    expect(reveal?.className).toContain("duration-200");
    rerender(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        values={["a", "b"]}
      />,
    );
    expect(reveal?.hasAttribute("data-open")).toBe(true);
    expect(reveal?.getAttribute("aria-hidden")).toBeNull();
    rerender(
      <FilterTrigger label="Category" items={items} empty="none" values={[]} />,
    );
    expect(reveal?.hasAttribute("data-open")).toBe(false);
    expect(reveal?.textContent).toContain("Alpha");
    expect(reveal?.textContent).toContain("+1");
  });

  it("eases the trigger's width when the applied value changes", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement): DOMRect {
        const width = this.classList.contains("reveal-inline")
          ? (this.textContent?.length ?? 0) * 10
          : 0;
        return new DOMRect(0, 0, width, 40);
      },
    );
    const { rerender } = render(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        values={["a"]}
      />,
    );
    const reveal = trigger().querySelector(".reveal-inline") as HTMLElement;
    expect(reveal.hasAttribute("data-resizing")).toBe(false);
    expect(reveal.getAttribute("style")).toBeNull();

    const observer = new MutationObserver(() => undefined);
    observer.observe(reveal, {
      attributes: true,
      attributeFilter: ["style"],
      attributeOldValue: true,
    });
    rerender(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        values={["a", "b"]}
      />,
    );
    const history = observer
      .takeRecords()
      .map((record) => record.oldValue ?? "")
      .join("|");
    observer.disconnect();

    expect(history).toContain("width: 100px");
    expect(history).toContain("transition: none");
    expect(reveal.style.width).toBe("120px");
    expect(reveal.hasAttribute("data-resizing")).toBe(true);
    fireEvent.transitionEnd(reveal, { propertyName: "width" });
    expect(reveal.hasAttribute("data-resizing")).toBe(false);
    expect(reveal.style.width).toBe("");
    vi.restoreAllMocks();
  });

  it("does not size-animate when the reveal opens or closes", () => {
    const { rerender } = render(
      <FilterTrigger label="Category" items={items} empty="none" values={[]} />,
    );
    const reveal = trigger().querySelector(".reveal-inline") as HTMLElement;
    rerender(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        values={["a"]}
      />,
    );
    expect(reveal.hasAttribute("data-resizing")).toBe(false);
  });

  it("clears everything from the keyboard with Delete", async () => {
    const onValuesChange = vi.fn();
    render(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        defaultValues={["a", "b"]}
        onValuesChange={onValuesChange}
      />,
    );
    const chip = trigger();
    fireEvent.keyDown(chip, { key: "Delete" });
    expect(onValuesChange).toHaveBeenCalledWith([]);
    expect(chip.getAttribute("data-state")).toBe("closed");

    const reveal = chip.querySelector(".reveal-inline");
    expect(reveal?.hasAttribute("data-open")).toBe(false);
    expect(reveal?.getAttribute("aria-hidden")).toBe("true");
  });

  it("clears from the X and stays closed", async () => {
    render(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        defaultValues={["a"]}
      />,
    );
    const clear = document.querySelector(
      '[data-slot="filter-trigger-clear"]',
    ) as HTMLElement;
    fireEvent.pointerDown(clear);
    fireEvent.click(clear);
    const chip = trigger();
    expect(chip.getAttribute("data-state")).toBe("closed");

    const reveal = chip.querySelector(".reveal-inline");
    expect(reveal?.hasAttribute("data-open")).toBe(false);
    expect(reveal?.getAttribute("aria-hidden")).toBe("true");
  });

  it("toggles values in place and clears by reselecting", async () => {
    const onValuesChange = vi.fn();
    render(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        defaultValues={["a", "b"]}
        onValuesChange={onValuesChange}
      />,
    );
    fireEvent.click(trigger());
    await waitFor(() =>
      expect(
        document.querySelectorAll('[data-slot="command-item"]').length,
      ).toBe(3),
    );
    const rows = [
      ...document.querySelectorAll('[data-slot="command-item"]'),
    ] as HTMLElement[];
    const alpha = rows.find((row) => row.textContent?.includes("Alpha"));

    const check = alpha?.querySelector('[data-slot="filter-trigger-check"]');
    expect(check).not.toBeNull();
    expect(alpha?.firstElementChild).toBe(check);
    expect(check?.querySelector("svg")?.getAttribute("class")).toContain(
      "opacity-100",
    );
    fireEvent.click(alpha as HTMLElement);
    expect(onValuesChange).toHaveBeenCalledWith(["b"]);

    expect(trigger().getAttribute("data-state")).toBe("open");
    await waitFor(() => expect(trigger().textContent).not.toContain("Alpha"));
    expect(trigger().textContent).toContain("Beta");
  });

  it("keeps the popover's data-state when it carries a hint", () => {
    render(
      <FilterTrigger
        label="Category"
        items={items}
        empty="none"
        hint="Shows one category only"
      />,
    );
    const trigger = document.querySelector('[data-slot="filter-trigger"]');
    expect(trigger?.getAttribute("data-state")).toBe("closed");
    expect(trigger?.className).toContain(
      "data-[state=open]:bg-btn-ghost-surface-active",
    );
  });
});
