import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilterChip, FilterChipSelect } from "../filter-chip";

describe("FilterChip", () => {
  /* One real toggle button: nesting a button inside a role=button
       div is the trap; ours must never. */
  it("is a single real button with pressed semantics", () => {
    render(<FilterChip>Video</FilterChip>);
    const chip = screen.getByRole("button", { name: "Video" });
    expect(chip.tagName).toBe("BUTTON");
    expect(chip.getAttribute("aria-pressed")).toBe("false");
    expect(chip.querySelector("button")).toBeNull();
    fireEvent.click(chip);
    expect(chip.getAttribute("aria-pressed")).toBe("true");
  });

  it("inverts to ink when pressed and rotates the plus into an X", () => {
    render(<FilterChip defaultPressed>Video</FilterChip>);
    const chip = screen.getByRole("button", { name: "Video" });
    expect(chip.className).toContain("data-[state=on]:bg-foreground");
    expect(chip.className).toContain("data-[state=on]:text-background");
    expect(chip.className).toContain("h-control-xs");
    const icon = chip.querySelector("svg");
    expect(icon?.getAttribute("class") ?? "").toContain(
      "group-data-[state=on]:rotate-45",
    );
    expect(icon?.getAttribute("class") ?? "").toContain("duration-200");
  });
});

describe("FilterChipSelect", () => {
  const items = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];

  it("inverts with value + X when selected; X stays out of the a11y tree", () => {
    render(
      <FilterChipSelect
        label="Category"
        items={items}
        empty="none"
        defaultValue="a"
      />,
    );
    const chip = document.querySelector(
      '[data-slot="filter-chip-select"]',
    ) as HTMLElement;
    expect(chip.getAttribute("role")).toBe("button");
    expect(chip.className).toContain("bg-foreground");
    expect(chip.textContent).toContain("Alpha");
    const clear = chip.querySelector('[data-slot="filter-chip-clear"]');
    expect(clear).not.toBeNull();
    // The X is a pointer-only affordance: no nested role inside the
    // button (invalid nesting would flatten it out of the tree anyway).
    expect(clear?.getAttribute("role")).toBeNull();
    expect(clear?.getAttribute("aria-hidden")).toBe("true");
    // one glyph only: the X (no chevron anywhere on this family)
    expect(chip.querySelectorAll("svg").length).toBe(1);
  });

  it("opens the applied-value reveal on select and closes it on clear, keeping the label for the exit", () => {
    const { container, rerender } = render(
      <FilterChipSelect
        label="Category"
        items={items}
        empty="none"
        value="a"
      />,
    );
    const reveal = container.querySelector(".reveal-inline");
    expect(reveal).not.toBeNull();
    expect(reveal?.hasAttribute("data-open")).toBe(true);

    rerender(
      <FilterChipSelect
        label="Category"
        items={items}
        empty="none"
        value={null}
      />,
    );
    expect(reveal?.hasAttribute("data-open")).toBe(false);
    expect(reveal?.getAttribute("aria-hidden")).toBe("true");
    expect(reveal?.textContent).toContain("Alpha");
  });

  /* The keyboard clear path: Delete/Backspace on the focused chip. */
  it("clears from the keyboard with Delete", async () => {
    render(
      <FilterChipSelect
        label="Category"
        items={items}
        empty="none"
        defaultValue="a"
      />,
    );
    const chip = document.querySelector(
      '[data-slot="filter-chip-select"]',
    ) as HTMLElement;
    fireEvent.keyDown(chip, { key: "Delete" });
    expect(chip.className).not.toContain("bg-foreground");
    expect(chip.getAttribute("data-state")).toBe("closed");
    // The value leaves the accessible name; its text rides the collapse out.
    const reveal = chip.querySelector(".reveal-inline");
    expect(reveal?.hasAttribute("data-open")).toBe(false);
    expect(reveal?.getAttribute("aria-hidden")).toBe("true");
  });

  /* Pressing the X clears without opening the menu. */
  it("clears from the X and stays closed", async () => {
    render(
      <FilterChipSelect
        label="Category"
        items={items}
        empty="none"
        defaultValue="a"
      />,
    );
    const clear = document.querySelector(
      '[data-slot="filter-chip-clear"]',
    ) as HTMLElement;
    fireEvent.pointerDown(clear);
    fireEvent.click(clear);
    const chip = document.querySelector(
      '[data-slot="filter-chip-select"]',
    ) as HTMLElement;
    expect(chip.className).not.toContain("bg-foreground");
    expect(chip.getAttribute("data-state")).toBe("closed");
    // The value leaves the accessible name; its text rides the collapse out.
    const reveal = chip.querySelector(".reveal-inline");
    expect(reveal?.hasAttribute("data-open")).toBe(false);
    expect(reveal?.getAttribute("aria-hidden")).toBe("true");
    // still exactly one glyph: the plus (no chevron [decision])
    expect(chip.querySelectorAll("svg").length).toBe(1);
  });

  /* Same trap as Segmented: a hint must not cost the toggle its
       data-state, which is what drives the inversion to ink. */
  it("keeps the toggle's data-state when it carries a hint", () => {
    render(
      <FilterChip defaultPressed hint="المعروض في متجرك فقط">
        معروض
      </FilterChip>,
    );
    const chip = document.querySelector('[data-slot="filter-chip"]');
    expect(chip?.getAttribute("data-state")).toBe("on");
    expect(chip?.className).toContain("data-[state=on]:bg-foreground");
  });

  /* The opening chip has a THIRD data-state owner: the popover marks
       the trigger open/closed. A hint must not take that either. */
  it("keeps the popover's data-state on a hinted FilterChipSelect", () => {
    render(
      <FilterChipSelect
        label="التصنيف"
        empty="ما فيه نتائج."
        hint="يعرض تصنيف واحد بس"
        items={[{ value: "apparel", label: "ملابس" }]}
      />,
    );
    const trigger = document.querySelector('[data-slot="filter-chip-select"]');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute("data-state")).toBe("closed");
  });
});
