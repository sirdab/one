import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Kbd, KbdGroup } from "../kbd";

describe("Kbd", () => {
  it("is a real kbd element on the keycap tokens", () => {
    const { container } = render(<Kbd>⌘B</Kbd>);
    const chip = container.firstElementChild;
    expect(chip?.tagName).toBe("KBD");
    expect(chip?.getAttribute("data-slot")).toBe("kbd");
    const cls = chip?.className ?? "";
    expect(cls).toContain("border-kbd-border");
    expect(cls).toContain("bg-kbd-surface");
    expect(cls).toContain("text-caption");
    expect(cls).not.toContain("bg-muted");
    expect(cls).not.toContain("text-xs");
  });

  it("inverts inside a tooltip, which is ink", () => {
    const { container } = render(<Kbd>⌘B</Kbd>);
    expect(container.firstElementChild?.className).toContain(
      "in-data-[slot=tooltip-content]:text-primary-foreground",
    );
  });

  it("never takes the click from the control it sits in", () => {
    const { container } = render(<Kbd>⌘B</Kbd>);
    expect(container.firstElementChild?.className).toContain(
      "pointer-events-none",
    );
  });

  it("groups chips as one kbd", () => {
    const { container } = render(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    expect(container.firstElementChild?.getAttribute("data-slot")).toBe(
      "kbd-group",
    );
    expect(container.querySelectorAll('[data-slot="kbd"]')).toHaveLength(2);
  });
});
