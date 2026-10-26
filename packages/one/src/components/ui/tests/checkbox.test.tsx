import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox, CheckboxMark } from "../checkbox";

function box(): HTMLElement {
  const el = screen.getByRole("checkbox");
  if (!(el instanceof HTMLElement)) throw new Error("no checkbox");
  return el;
}

describe("Checkbox states", () => {
  it("checked fills with primary ink and inverts the glyph", () => {
    render(<Checkbox aria-label="vat" defaultChecked />);
    const el = box();
    expect(el.getAttribute("data-state")).toBe("checked");
    expect(el.className).toContain("data-[state=checked]:border-primary");
    expect(el.className).toContain("data-[state=checked]:bg-primary");
    expect(el.className).toContain(
      "data-[state=checked]:text-primary-foreground",
    );
  });

  it("indeterminate takes the same ink fill but with a minus, never the check", () => {
    // The one signal a tri-state must never send: a check for a
    // partial selection.
    render(<Checkbox aria-label="all" checked="indeterminate" />);
    const el = box();
    expect(el.getAttribute("data-state")).toBe("indeterminate");
    expect(el.className).toContain("data-[state=indeterminate]:border-primary");
    expect(el.className).toContain("data-[state=indeterminate]:bg-primary");
    const [check, minus] = [...el.querySelectorAll("svg")];
    expect(minus.getAttribute("class")).toContain(
      "in-data-[state=indeterminate]:opacity-100",
    );
    expect(check.getAttribute("class")).toContain(
      "in-data-[state=checked]:opacity-100",
    );
  });

  it("both glyphs land by easing in, never by springing, and snap under reduced motion", () => {
    render(<Checkbox aria-label="pop" />);
    for (const svg of box().querySelectorAll("svg")) {
      const cls = svg.getAttribute("class") ?? "";
      expect(cls.split(" ")).toContain("transition");
      expect(cls).toContain("scale-75");
      expect(cls).toContain("opacity-0");
      expect(cls).toContain("ease-out");
      expect(cls).toContain("motion-reduce:transition-none");
      // Rule 8: no overshoot, so no spring and no half-size start.
      expect(cls).not.toContain("ease-spring");
      expect(cls).not.toContain("scale-50");
    }
  });
});

describe("Checkbox geometry", () => {
  /* 16px with a 4px corner on a mouse; on a touch screen the box is 20px
       with a 6px corner (the nearest on-scale corner to the same
       proportion) and a 44px tap box around it. */
  it("is 16px on a mouse and 20px on touch, with the corner to match", () => {
    render(<Checkbox aria-label="size" />);
    const cls = box().className;
    expect(cls).toContain("size-4");
    expect(cls).toContain("pointer-coarse:size-5");
    expect(cls).toContain("rounded-xs");
    expect(cls).toContain("pointer-coarse:rounded-sm");
  });

  it("takes the 44px touch box", () => {
    render(<Checkbox aria-label="touch" />);
    expect(box().classList.contains("relative")).toBe(true);
    expect(box().classList.contains("touch-target")).toBe(true);
  });

  /* The tick is drawn at 14px (18 on touch) at stroke 3, so it renders at
       1.75px (2.25) instead of the 1px hairline it was at 12px, which read
       grey at 2x. */
  it("draws the glyphs in a 14px box (18 on touch) at stroke 3", () => {
    render(<Checkbox aria-label="glyph" />);
    const glyphBox = box().querySelector("svg")?.parentElement;
    expect(glyphBox?.className).toContain("size-3.5");
    expect(glyphBox?.className).toContain("pointer-coarse:size-4.5");
    for (const svg of box().querySelectorAll("svg")) {
      const strokes = [...svg.querySelectorAll("[stroke-width]")];
      expect(strokes.length).toBeGreaterThan(0);
      for (const stroke of strokes) {
        expect(stroke.getAttribute("stroke-width")).toBe("3");
      }
    }
  });

  /* Only the one box recipe exists: CheckboxMark, the same box inside a
       menu row, can never drift from the control. */
  it("shares the box recipe with CheckboxMark", () => {
    render(
      <>
        <Checkbox aria-label="control" />
        <CheckboxMark checked={false} />
      </>,
    );
    const mark = document.querySelector('[data-slot="checkbox-mark"]');
    for (const part of [
      "size-4",
      "pointer-coarse:size-5",
      "rounded-xs",
      "pointer-coarse:rounded-sm",
      "border-border-interactive",
      "data-[state=checked]:bg-primary",
    ]) {
      expect(box().className).toContain(part);
      expect(mark?.className).toContain(part);
    }
  });
});

describe("CheckboxMark", () => {
  it("shows the tick when checked and the minus when indeterminate, never both", () => {
    render(
      <>
        <CheckboxMark checked />
        <CheckboxMark checked="indeterminate" />
        <CheckboxMark checked={false} />
      </>,
    );
    const [on, partial, off] = [
      ...document.querySelectorAll('[data-slot="checkbox-mark"]'),
    ];
    expect(on.getAttribute("data-state")).toBe("checked");
    expect(partial.getAttribute("data-state")).toBe("indeterminate");
    expect(off.getAttribute("data-state")).toBe("unchecked");
    const glyph = (mark: Element, name: string): string =>
      mark.querySelector(`[data-icon="${name}"]`)?.getAttribute("class") ?? "";
    expect(glyph(on, "CheckIcon")).toContain(
      "in-data-[state=checked]:opacity-100",
    );
    expect(glyph(partial, "CheckIcon")).not.toContain(
      "in-data-[state=indeterminate]:opacity-100",
    );
    expect(glyph(partial, "MinusIcon")).toContain(
      "in-data-[state=indeterminate]:opacity-100",
    );
    expect(glyph(partial, "CheckIcon")).not.toContain("ease-spring");
  });
});

describe("Checkbox interaction", () => {
  it("hover deepens the border one rung, gated to unchecked", () => {
    // The checked ink must never get a hover border repaint.
    render(<Checkbox aria-label="hover" />);
    expect(box().className).toContain(
      "hover:data-[state=unchecked]:border-input-border-hover-form",
    );
  });

  it("toggles checked on click", () => {
    render(<Checkbox aria-label="toggle" />);
    const el = box();
    expect(el.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(el);
    expect(el.getAttribute("data-state")).toBe("checked");
  });

  it("dims to 50% with the not-allowed cursor when disabled", () => {
    render(<Checkbox aria-label="off" disabled />);
    expect(box().className).toContain("disabled:opacity-50");
    expect(box().className).toContain("disabled:cursor-not-allowed");
  });
});
