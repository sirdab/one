import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Shimmer } from "../shimmer";

/* Every "working on it" in the product is this one shimmer: the band of
   light, and every third sweep the words fade out and back, inside the same
   cycle so it never drifts from the band. A caller can turn the fade off. */
describe("Shimmer", () => {
  /* The sweep and the breath are foundation CSS (the shimmer utility), so
       the component only names the utility and hands it the timing. */
  it("wears the shimmer utility with its timing as custom properties", () => {
    render(<Shimmer duration={3}>Working</Shimmer>);
    const el = screen.getByText("Working");
    expect(el.dataset.slot).toBe("shimmer");
    expect(el.classList.contains("shimmer")).toBe(true);
    expect(el.style.getPropertyValue("--shimmer-duration")).toBe("3s");
    expect(el.style.getPropertyValue("--shimmer-cycle")).toBe("9s");
    expect(el.style.getPropertyValue("--shimmer-spread")).toBe("14px");
    expect(el.style.backgroundImage).toBe("");
  });

  it("keeps a caller's class beside the utility", () => {
    render(<Shimmer className="text-body">Working</Shimmer>);
    const el = screen.getByText("Working");
    expect(el.classList.contains("shimmer")).toBe(true);
    expect(el.classList.contains("text-body")).toBe(true);
  });

  it("pulses every third sweep by default, and not at all when told", () => {
    const { rerender } = render(<Shimmer>Working</Shimmer>);
    expect(screen.getByText("Working").dataset.pulse).toBe("3");
    rerender(<Shimmer pulseEvery={0}>Working</Shimmer>);
    expect(screen.getByText("Working").dataset.pulse).toBeUndefined();
  });
});
