import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

function renderChips(
  props: Partial<React.ComponentProps<typeof ToggleGroup>> = {},
): void {
  render(
    <ToggleGroup
      type="single"
      variant="filter"
      aria-label="Where to search"
      {...(props as object)}
    >
      <ToggleGroupItem value="orders">Orders</ToggleGroupItem>
      <ToggleGroupItem value="products">Products</ToggleGroupItem>
      <ToggleGroupItem value="customers">Customers</ToggleGroupItem>
    </ToggleGroup>,
  );
}

describe("ToggleGroup variant=filter", () => {
  it("is the filter chip's ink inversion on a button-sized chip", () => {
    renderChips({ defaultValue: "orders" });
    const [pressed, resting] = screen.getAllByRole("radio");
    expect(pressed?.getAttribute("data-state")).toBe("on");
    expect(resting?.getAttribute("data-state")).toBe("off");

    const classes = (pressed?.className ?? "").split(" ");
    for (const ink of [
      "data-[state=on]:border-foreground",
      "data-[state=on]:bg-foreground",
      "data-[state=on]:text-background",
      "data-[state=on]:hover:bg-gray-alpha-800",
      "data-[state=on]:active:bg-gray-alpha-700",
    ]) {
      expect(classes).toContain(ink);
    }

    expect(classes).not.toContain(
      "data-[state=on]:bg-btn-ghost-surface-active",
    );
  });

  it("is 32px with a touch target and no plus glyph", () => {
    renderChips();
    for (const chip of screen.getAllByRole("radio")) {
      expect(chip.className).toContain("h-control");
      expect(chip.className).not.toContain("h-control-xs");
      expect(chip.className).toContain("touch-target");
      expect(chip.className).toContain("duration-200");
      expect(chip.querySelector("svg")).toBeNull();
    }
  });

  it("lets the pressed chip be pressed off, which clears the pick", () => {
    const onValueChange = vi.fn();
    renderChips({ defaultValue: "orders", onValueChange });
    fireEvent.click(screen.getByRole("radio", { name: "Orders" }));
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(
      screen.getByRole("radio", { name: "Orders" }).getAttribute("data-state"),
    ).toBe("off");
  });

  it("leaves the other variants alone", () => {
    render(
      <ToggleGroup type="single" variant="chip" defaultValue="a">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const chip = screen.getByRole("radio", { name: "A" });
    expect(chip.className).toContain(
      "data-[state=on]:bg-btn-ghost-surface-active",
    );
    expect(chip.className).not.toContain("data-[state=on]:bg-foreground");
  });
});
