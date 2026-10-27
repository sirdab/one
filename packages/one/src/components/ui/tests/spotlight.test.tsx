import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Spotlight,
  SPOTLIGHT_PADDING,
  SpotlightConnector,
  spotlightHole,
} from "../spotlight";

const rect = { top: 100, left: 200, width: 120, height: 40 } as DOMRect;

function bands(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-slot="spotlight-band"]'),
  );
}

function hole(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(
    '[data-slot="spotlight-hole"]',
  );
  if (el === null) throw new Error("no spotlight hole rendered");
  return el;
}

describe("spotlightHole", () => {
  it("grows the rect by the padding on every side", () => {
    expect(spotlightHole(rect)).toEqual({
      top: 100 - SPOTLIGHT_PADDING,
      left: 200 - SPOTLIGHT_PADDING,
      width: 120 + SPOTLIGHT_PADDING * 2,
      height: 40 + SPOTLIGHT_PADDING * 2,
    });
  });

  it("takes an explicit padding", () => {
    expect(spotlightHole(rect, 0)).toEqual({
      top: 100,
      left: 200,
      width: 120,
      height: 40,
    });
  });
});

describe("Spotlight", () => {
  it("leaves the padded rect clear of the four blur bands", () => {
    const { container } = render(<Spotlight rect={rect} />);
    const [top, bottom, start, end] = bands(container);

    expect(top?.style.height).toBe("92px");
    expect(bottom?.style.top).toBe("148px");
    expect(start?.style.width).toBe("192px");
    expect(end?.style.left).toBe("328px");

    expect(start?.style.top).toBe("92px");
    expect(start?.style.height).toBe("56px");
    expect(end?.style.top).toBe("92px");
    expect(end?.style.height).toBe("56px");
  });

  it("puts the hole at the padded rect, rounded, tinted by the scrim token", () => {
    const { container } = render(<Spotlight rect={rect} />);
    const el = hole(container);

    expect(el.style.top).toBe("92px");
    expect(el.style.left).toBe("192px");
    expect(el.style.width).toBe("136px");
    expect(el.style.height).toBe("56px");
    expect(el.className).toContain("rounded-lg");

    expect(el.style.boxShadow).toContain("var(--scrim-surface)");
  });

  it("honours an explicit padding", () => {
    const { container } = render(<Spotlight rect={rect} padding={0} />);
    const el = hole(container);

    expect(el.style.top).toBe("100px");
    expect(el.style.left).toBe("200px");
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("40px");
  });

  it("never sizes a band negatively for a rect against the viewport edge", () => {
    const corner = { top: 0, left: 0, width: 40, height: 40 } as DOMRect;
    const { container } = render(<Spotlight rect={corner} />);
    const [top, , start] = bands(container);

    expect(top?.style.height).toBe("0px");
    expect(start?.style.width).toBe("0px");
  });

  it("carries the scrim blur on every band", () => {
    const { container } = render(<Spotlight rect={rect} />);
    for (const band of bands(container)) {
      expect(band.className).toContain("backdrop-blur-scrim");
    }
  });
});

describe("SpotlightConnector", () => {
  it("draws an elbow from the spotlight edge to the callout edge", () => {
    const { container } = render(
      <SpotlightConnector from={{ x: 40, y: 300 }} to={{ x: 260, y: 148 }} />,
    );
    const path = container.querySelector("path");
    if (path === null) throw new Error("no connector path rendered");

    expect(path.getAttribute("d")).toBe("M 260 148 V 224 H 40 V 300");
    expect(path.getAttribute("fill")).toBe("none");
  });
});
