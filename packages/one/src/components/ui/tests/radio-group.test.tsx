import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RadioGroup, RadioGroupItem } from "../radio-group";

describe("RadioGroupItem chrome", () => {
  it("checked draws the primary ring and the dot fades in at 100ms", () => {
    render(
      <RadioGroup defaultValue="a" aria-label="ship">
        <RadioGroupItem value="a" aria-label="a" />
        <RadioGroupItem value="b" aria-label="b" />
      </RadioGroup>,
    );
    const checked = screen.getByRole("radio", { checked: true });
    expect(checked.className).toContain("data-[state=checked]:border-primary");
    const dot = checked.querySelector("span span");
    expect(dot?.className).toContain("bg-primary");
    expect(dot?.className).toContain("transition-opacity");
    expect(dot?.className).toContain("duration-100");
    expect(dot?.className).toContain("in-data-[state=checked]:opacity-100");
  });

  it("hover deepens the border one rung, gated to unchecked", () => {
    render(
      <RadioGroup defaultValue="a" aria-label="ship">
        <RadioGroupItem value="a" aria-label="a" />
        <RadioGroupItem value="b" aria-label="b" />
      </RadioGroup>,
    );
    const unchecked = screen.getByRole("radio", { checked: false });
    expect(unchecked.className).toContain(
      "hover:data-[state=unchecked]:border-input-border-hover-form",
    );
  });

  it("a disabled item dims to 50% with the not-allowed cursor", () => {
    render(
      <RadioGroup aria-label="ship">
        <RadioGroupItem value="a" aria-label="a" disabled />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio").className).toContain(
      "disabled:opacity-50",
    );
    expect(screen.getByRole("radio").className).toContain(
      "disabled:cursor-not-allowed",
    );
  });
});

describe("RadioGroup selection", () => {
  it("one choice at a time: clicking moves the checked state", () => {
    render(
      <RadioGroup defaultValue="a" aria-label="ship">
        <RadioGroupItem value="a" aria-label="standard" />
        <RadioGroupItem value="b" aria-label="express" />
      </RadioGroup>,
    );
    const [standard, express] = screen.getAllByRole("radio");
    expect(standard.getAttribute("data-state")).toBe("checked");
    expect(express.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(express);
    expect(standard.getAttribute("data-state")).toBe("unchecked");
    expect(express.getAttribute("data-state")).toBe("checked");
  });
});
