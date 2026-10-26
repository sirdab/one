import { render, screen } from "@testing-library/react";
import { Direction } from "radix-ui";
import { describe, expect, it } from "vitest";

import { Progress } from "../progress";

function indicator(): HTMLElement {
  const node = document.querySelector<HTMLElement>(
    '[data-slot="progress-indicator"]',
  );
  if (!node) throw new Error("no indicator");
  return node;
}

describe("Progress", () => {
  it("sizes the indicator by width so it grows from the start edge", () => {
    render(<Progress value={35} aria-label="p" />);
    expect(indicator().style.width).toBe("35%");
    expect(indicator().style.transform).toBe("");
    expect(screen.getByRole("progressbar").getAttribute("data-state")).toBe(
      "loading",
    );
  });

  it("fills from the start edge in RTL: the same width, no translate to flip", () => {
    render(
      <Direction.Provider dir="rtl">
        <div dir="rtl">
          <Progress value={35} aria-label="p" />
        </div>
      </Direction.Provider>,
    );
    expect(indicator().style.width).toBe("35%");
    expect(indicator().style.transform).toBe("");
  });

  it("clamps out-of-range values", () => {
    const { rerender } = render(<Progress value={140} aria-label="p" />);
    expect(indicator().style.width).toBe("100%");
    rerender(<Progress value={-5} aria-label="p" />);
    expect(indicator().style.width).toBe("0%");
  });

  it("is indeterminate with no value: no aria-valuenow, pulsing", () => {
    render(<Progress aria-label="p" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("data-state")).toBe("indeterminate");
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
    expect(indicator().className).toContain("animate-pulse");
  });

  it("stays dimmer than a full bar when the pulse is stilled by reduced motion", () => {
    render(<Progress aria-label="p" />);
    expect(indicator().className).toContain("motion-reduce:opacity-50");
    render(<Progress value={100} aria-label="done" />);
    const done = document.querySelectorAll<HTMLElement>(
      '[data-slot="progress-indicator"]',
    )[1];
    expect(done?.className).not.toContain("motion-reduce:opacity-50");
  });

  it("takes a 0..100 value only: a max is refused by the type", () => {
    // @ts-expect-error the bar ignores max, so a caller may not pass one
    render(<Progress value={5} max={10} aria-label="p" />);
    expect(indicator().style.width).toBe("5%");
  });

  it("rests on the wash track, not a primary tint", () => {
    render(<Progress value={10} aria-label="p" />);
    expect(screen.getByRole("progressbar").className).toContain("bg-muted");
  });
});
