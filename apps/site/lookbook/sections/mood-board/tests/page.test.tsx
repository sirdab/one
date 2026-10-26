import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import MoodBoardPage from "../page";

function boards(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll('[data-testid="mood-board"]')].filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}

afterEach(() => {
  cleanup();
});

/* The gallery page for the board: a full concept, the phone strip, a board
   still drawing, and a peek. The concept demo is what the 390px fixture is
   shot from, so its shape is pinned here too. */
describe("MoodBoardPage", () => {
  it("shows a concept, a drawing board and a peek, in Arabic when asked", () => {
    const { container } = render(<MoodBoardPage lang="ar" />);
    const [concept, strip, drawing, peek] = boards(container);
    expect(strip).toBeDefined();

    // Concept: her colours, her two fonts, the radii and the spacing.
    expect(concept?.getAttribute("dir")).toBe("rtl");
    expect(concept?.textContent).toContain("الألوان");
    expect(concept?.textContent).toContain("خط الهوية");
    for (const section of [
      "mood-board-palette",
      "mood-board-type",
      "mood-board-radius",
      "mood-board-spacing",
    ]) {
      expect(
        concept?.querySelector(`[data-slot="${section}"]`),
        section,
      ).not.toBeNull();
    }
    expect(
      concept?.querySelectorAll('[data-slot="mood-board-swatch"]'),
    ).toHaveLength(5);

    // Drawing: her colours and fonts pulsing in their places.
    expect(drawing?.getAttribute("aria-busy")).toBe("true");
    expect(
      drawing?.querySelectorAll('[data-slot^="mood-board-placeholder"]'),
    ).toHaveLength(2);

    // Peek: it knows neither her colours nor her fonts, so only the
    // generic system stands.
    expect(peek?.querySelector('[data-slot="mood-board-type"]')).toBeNull();
    expect(
      peek?.querySelector('[data-slot="mood-board-radius"]'),
    ).not.toBeNull();
  });

  it("falls back to the English keys for the English gallery", () => {
    const { container } = render(<MoodBoardPage lang="en" />);
    const [concept] = boards(container);
    expect(concept?.textContent).toContain("Colors");
    expect(concept?.textContent).toContain("Background");
    expect(concept?.getAttribute("dir")).toBe("ltr");
  });
});
