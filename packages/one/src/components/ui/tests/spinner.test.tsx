import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "../spinner";

describe("Spinner", () => {
  it("spins in ink and stills under reduced motion", () => {
    const { container } = render(<Spinner />);
    const cls = container.querySelector("svg")?.getAttribute("class") ?? "";
    expect(cls).toContain("animate-spin");
    expect(cls).toContain("text-foreground");
    expect(cls).toContain("motion-reduce:animate-none");
    expect(cls).toContain("size-4");
  });

  it("drops to the inline size with size=sm", () => {
    const { container } = render(<Spinner size="sm" />);
    const cls = container.querySelector("svg")?.getAttribute("class") ?? "";
    expect(cls).toContain("size-3");
  });
});
