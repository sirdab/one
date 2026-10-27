import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WaveLoader } from "../wave-loader";

describe("WaveLoader", () => {
  it("draws five ink bars, tallest in the middle, each a beat after the last", () => {
    const { container } = render(<WaveLoader />);
    const box = container.querySelector('[data-slot="wave-loader"]');
    expect(box?.getAttribute("class")).toContain("text-foreground");
    const bars = [...(box?.children ?? [])] as HTMLElement[];
    expect(bars.map((bar) => bar.style.height)).toEqual([
      "50%",
      "75%",
      "100%",
      "75%",
      "50%",
    ]);
    expect(bars.map((bar) => bar.style.animationDelay)).toEqual([
      "0ms",
      "100ms",
      "200ms",
      "300ms",
      "400ms",
    ]);
    for (const bar of bars) {
      expect(bar.getAttribute("class")).toContain("animate-wave-bar");
      expect(bar.getAttribute("class")).toContain("motion-reduce:animate-none");
    }
  });

  it.each([
    ["sm", "h-3 w-6"],
    ["default", "h-4 w-8"],
    ["lg", "h-8 w-16"],
  ] as const)("keeps the 2:1 box at %s", (size, classes) => {
    const { container } = render(<WaveLoader size={size} />);
    const cls =
      container
        .querySelector('[data-slot="wave-loader"]')
        ?.getAttribute("class") ?? "";
    for (const name of classes.split(" ")) expect(cls).toContain(name);
  });

  it("hides itself from a reader, unless it is named and stands alone", () => {
    const quiet = render(<WaveLoader />).container.querySelector(
      '[data-slot="wave-loader"]',
    );
    expect(quiet?.getAttribute("aria-hidden")).toBe("true");
    const named = render(
      <WaveLoader aria-label="Loading" />,
    ).container.querySelector('[data-slot="wave-loader"]');
    expect(named?.getAttribute("role")).toBe("img");
    expect(named?.getAttribute("aria-label")).toBe("Loading");
    expect(named?.hasAttribute("aria-hidden")).toBe(false);
  });
});
