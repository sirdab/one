import { describe, expect, it } from "vitest";

import {
  overlayDialogMotion,
  overlayPanelMotion,
  overlayScrimMotion,
} from "../overlay";

describe("overlay motion recipes", () => {
  it("panels fade and scale from 0.95 at 150ms both ways, no slide", () => {
    expect(overlayPanelMotion).toContain("duration-150");
    expect(overlayPanelMotion).toContain("ease-overlay");
    expect(overlayPanelMotion).not.toMatch(/data-\[state=\w+\]:duration-/);
    expect(overlayPanelMotion).toContain("zoom-in-95");
    expect(overlayPanelMotion).toContain("zoom-out-95");
    expect(overlayPanelMotion).not.toContain("slide-in");
  });

  it("scrim and dialog land and leave together", () => {
    for (const recipe of [overlayScrimMotion, overlayDialogMotion]) {
      expect(recipe).toContain("duration-200");
      expect(recipe).not.toMatch(/data-\[state=\w+\]:duration-/);
    }
    expect(overlayScrimMotion).toContain("ease-standard");
    expect(overlayDialogMotion).toContain("ease-overlay");
  });

  it("the scrim is a pure fade while the dialog scales without a slide", () => {
    expect(overlayScrimMotion).not.toContain("zoom");
    expect(overlayDialogMotion).toContain("zoom-in-95");
    expect(overlayDialogMotion).toContain("zoom-out-95");
    expect(overlayDialogMotion).not.toContain("slide-in");
  });
});
