import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "../skeleton";

/* The one house deviation from stock: --muted, our quiet fill, not shadcn's
   --accent (which is the interaction rung; a loading bar is not something you
   are touching). The next `shadcn add skeleton` would silently revert it. */
describe("Skeleton", () => {
  it("paints the quiet fill, never the interaction rung", () => {
    const { container } = render(<Skeleton className="h-6 w-24" />);
    const cls = container.firstElementChild?.className ?? "";
    expect(cls).toContain("bg-muted");
    expect(cls).not.toContain("bg-accent");
  });
});
