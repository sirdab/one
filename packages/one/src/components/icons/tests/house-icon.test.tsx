import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AllStatusesIcon, CheckIcon } from "../catalogue";

describe("house icons", () => {
  it("draw at a caller's stroke weight, and leave filled shapes alone", () => {
    const { container } = render(
      <>
        <CheckIcon strokeWidth={3} />
        <AllStatusesIcon strokeWidth={3} />
      </>,
    );
    const [tick, layers] = container.querySelectorAll("svg");
    expect(tick?.querySelector("path")?.getAttribute("stroke-width")).toBe("3");
    expect(
      layers?.querySelector("path")?.getAttribute("stroke-width"),
    ).toBeNull();
  });

  it("name themselves, so a test can ask for the glyph", () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector("svg")?.getAttribute("data-icon")).toBe(
      "CheckIcon",
    );
  });
});
