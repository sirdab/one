import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SirdabLogo, SirdabMark } from "../sirdab-logo";

/* The logo paints through a class-scoped token so it survives bundles that
   never scan this package; these pin that contract and the script switch. */
describe("SirdabMark", () => {
  it("paints through --logo-fill under the .sirdab-mark class, teal by default", () => {
    const { container } = render(<SirdabMark />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("sirdab-mark");
    expect(svg?.getAttribute("fill")).toBe("var(--logo-fill)");
    expect(svg?.getAttribute("data-tone")).toBe("brand");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("carries the requested tone for the stylesheet to resolve", () => {
    const { container } = render(<SirdabMark tone="paper" />);
    expect(container.querySelector("svg")?.getAttribute("data-tone")).toBe(
      "paper",
    );
  });
});

describe("SirdabLogo", () => {
  const glyphCount = (el: HTMLElement): number =>
    el.querySelectorAll("path").length;

  it("renders the bilingual lockup by default: mark plus both logotypes", () => {
    const { container } = render(<SirdabLogo />);
    expect(glyphCount(container)).toBe(1 + 6 + 5);
  });

  it("drops to one logotype per script", () => {
    const latin = render(<SirdabLogo script="latin" />);
    expect(glyphCount(latin.container)).toBe(1 + 6);
    const arabic = render(<SirdabLogo script="arabic" />);
    expect(glyphCount(arabic.container)).toBe(1 + 5);
  });

  it("is an image only when it has a name", () => {
    const named = render(<SirdabLogo title="Sirdab" />);
    const svg = named.container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("img");
    expect(svg?.querySelector("title")?.textContent).toBe("Sirdab");

    const anonymous = render(<SirdabLogo />);
    expect(
      anonymous.container.querySelector("svg")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });
});
