import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("paints the quiet fill, never the interaction rung", () => {
    const { container } = render(<Skeleton className="h-6 w-24" />);
    const cls = container.firstElementChild?.className ?? "";
    expect(cls).toContain("bg-muted");
    expect(cls).not.toContain("bg-accent");
  });
});
