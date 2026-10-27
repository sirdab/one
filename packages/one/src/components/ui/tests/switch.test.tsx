import { Direction } from "radix-ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Switch } from "../switch";

function track(): HTMLElement {
  const el = screen.getByRole("switch");
  if (!(el instanceof HTMLElement)) throw new Error("no switch");
  return el;
}

function thumb(): HTMLElement {
  const el = document.querySelector('[data-slot="switch-thumb"]');
  if (!(el instanceof HTMLElement)) throw new Error("no thumb");
  return el;
}

describe("Switch geometry", () => {
  it("is one size: 20x36, with the checked ink and no size knob", () => {
    render(<Switch aria-label="a" />);
    const el = track();
    expect(el.className).toContain("h-5");
    expect(el.className).toContain("w-9");
    expect(el.className).toContain("data-[state=checked]:bg-primary");
    expect(el.className).not.toContain("data-[size=");
    expect(el.hasAttribute("data-size")).toBe(false);
    expect(thumb().hasAttribute("data-size")).toBe(false);
    expect(thumb().className).not.toContain("data-[size=");
  });

  it("travels 16px, mirrored in RTL", () => {
    render(<Switch aria-label="a" defaultChecked />);
    expect(thumb().className).toContain("size-4");
    expect(thumb().className).toContain("data-[state=checked]:translate-x-4");
    expect(thumb().className).toContain(
      "rtl:data-[state=checked]:-translate-x-4",
    );
  });

  it("stretches the thumb while held, with the checked pullback", () => {
    render(<Switch aria-label="a" defaultChecked />);
    expect(thumb().className).toContain("group-active/switch:w-5");
    expect(thumb().className).toContain(
      "group-active/switch:data-[state=checked]:translate-x-3",
    );
    expect(thumb().className).toContain(
      "rtl:group-active/switch:data-[state=checked]:-translate-x-3",
    );
  });

  it("runs everything at the 150ms state-change tier, never the 100ms control tier", () => {
    render(<Switch aria-label="timing" />);
    expect(track().className).toContain("duration-150");
    expect(track().className).toContain("ease-in-out");
    expect(track().className).not.toContain("duration-100");
    expect(thumb().className).toContain("duration-150");
  });

  it("takes the 44px touch box", () => {
    render(<Switch aria-label="touch" />);
    expect(track().classList.contains("relative")).toBe(true);
    expect(track().classList.contains("touch-target")).toBe(true);
  });
});

describe("Switch states", () => {
  it("draws off at alpha-300, deepening to alpha-350 on a mouse", () => {
    render(<Switch aria-label="off" />);
    const cls = track().className;
    expect(cls).toContain("data-[state=unchecked]:bg-gray-alpha-300");
    expect(cls).toContain("hover:data-[state=unchecked]:bg-gray-alpha-350");
    expect(cls).not.toContain("bg-input");
    expect(cls).not.toContain("hover:data-[state=checked]");
  });

  it("toggles checked on click with the aria to match", () => {
    render(<Switch aria-label="live" />);
    const el = track();
    expect(el.getAttribute("data-state")).toBe("unchecked");
    expect(el.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(el);
    expect(el.getAttribute("data-state")).toBe("checked");
    expect(el.getAttribute("aria-checked")).toBe("true");
  });

  it("dims to 50% with the not-allowed cursor when disabled", () => {
    render(<Switch aria-label="off" disabled />);
    expect(track().className).toContain("disabled:opacity-50");
    expect(track().className).toContain("disabled:cursor-not-allowed");
  });
});

describe("Switch direction changes", () => {
  it("reanchors its thumb without replaying a state transition or replacing the focused control", () => {
    const { rerender } = render(
      <Direction.Provider dir="rtl">
        <Switch aria-label="direction" defaultChecked />
      </Direction.Provider>,
    );
    const control = track();
    const previousThumb = thumb();
    control.focus();
    rerender(
      <Direction.Provider dir="ltr">
        <Switch aria-label="direction" defaultChecked />
      </Direction.Provider>,
    );
    expect(track()).toBe(control);
    expect(document.activeElement).toBe(control);
    expect(control.getAttribute("data-state")).toBe("checked");
    expect(thumb()).not.toBe(previousThumb);
  });
});
