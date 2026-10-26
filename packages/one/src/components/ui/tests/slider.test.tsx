import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "../slider";

/* Radix measures the track with ResizeObserver. */
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  },
);

function Controlled(): React.JSX.Element {
  const [value, setValue] = React.useState(1);
  return (
    <Slider
      aria-label="Zoom"
      min={1}
      max={3}
      step={0.5}
      value={[value]}
      onValueChange={([next]) => setValue(next ?? 1)}
    />
  );
}

describe("Slider", () => {
  it("names its thumb and carries the value", () => {
    render(<Controlled />);
    const thumb = screen.getByRole("slider", { name: "Zoom" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("1");
    expect(thumb.getAttribute("aria-valuemin")).toBe("1");
    expect(thumb.getAttribute("aria-valuemax")).toBe("3");
  });

  it("steps with the arrow keys and jumps with Home and End", () => {
    render(<Controlled />);
    const thumb = screen.getByRole("slider", { name: "Zoom" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("1.5");
    fireEvent.keyDown(thumb, { key: "End" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("3");
    fireEvent.keyDown(thumb, { key: "Home" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("1");
  });

  it("does not move while disabled", () => {
    render(
      <Slider
        aria-label="Zoom"
        min={1}
        max={3}
        step={0.5}
        defaultValue={[2]}
        disabled
      />,
    );
    const thumb = screen.getByRole("slider", { name: "Zoom" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("2");
  });
});
