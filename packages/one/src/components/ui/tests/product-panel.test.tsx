import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  isSketchShape,
  PANEL_FALLBACK_COLOR,
  ProductPanel,
  SKETCH_SHAPES,
} from "../product-panel";

describe("SKETCH_SHAPES", () => {
  it("names the ten silhouettes the scaffold draws, once each", () => {
    expect(SKETCH_SHAPES).toEqual([
      "bottle",
      "bag",
      "box",
      "jar",
      "tin",
      "tray",
      "cup",
      "kettle",
      "tool",
      "mark",
    ]);
    expect(new Set(SKETCH_SHAPES).size).toBe(10);
  });

  it("isSketchShape admits a name and refuses anything else", () => {
    expect(isSketchShape("bottle")).toBe(true);
    expect(isSketchShape("mark")).toBe(true);
    expect(isSketchShape("sofa")).toBe(false);
    expect(isSketchShape(3)).toBe(false);
    expect(isSketchShape(null)).toBe(false);
    expect(isSketchShape(undefined)).toBe(false);
  });
});

describe("ProductPanel", () => {
  it("draws the silhouette in the mono that wins on the panel colour", () => {
    const { container } = render(
      <ProductPanel
        shape="bottle"
        color="#101010"
        imageUrl={null}
        label="Oud"
      />,
    );
    const panel = container.firstElementChild as HTMLElement;
    expect(panel.getAttribute("data-slot")).toBe("product-panel");
    expect(panel.getAttribute("role")).toBe("img");
    expect(panel.getAttribute("aria-label")).toBe("Oud");
    expect(panel.className).toContain("aspect-square");
    // jsdom may hand a hex back as rgb(); either spelling is the colour.
    expect(panel.style.backgroundColor).toMatch(
      /^(#101010|rgb\(16, 16, 16\))$/,
    );

    const svg = panel.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 100 120");
    expect(svg?.getAttribute("data-shape")).toBe("bottle");
    /* Decorative: the panel carries the accessible name. jsdom SVG
           className is an SVGAnimatedString, so attributes are read. */
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
    expect(svg?.style.color).toMatch(/^(#ffffff|rgb\(255, 255, 255\))$/);
    const body = svg?.querySelector("g");
    expect(body?.getAttribute("fill")).toBe("currentColor");
    expect(body?.getAttribute("opacity")).toBe("0.82");
    expect(panel.querySelector("img")).toBeNull();
  });

  it("draws black ink on a light panel", () => {
    const { container } = render(
      <ProductPanel
        shape="jar"
        color="#f6efe4"
        imageUrl={null}
        label="Honey"
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.style.color).toMatch(/^(#000000|rgb\(0, 0, 0\))$/);
  });

  it("paints the paper gray and the mark when the model gave neither colour nor shape", () => {
    const { container } = render(
      <ProductPanel
        shape={null}
        color={null}
        imageUrl={null}
        label="Something"
      />,
    );
    const panel = container.firstElementChild as HTMLElement;
    expect(PANEL_FALLBACK_COLOR).toBe("#e9e6e0");
    expect(panel.style.backgroundColor).toMatch(
      /^(#e9e6e0|rgb\(233, 230, 224\))$/,
    );
    expect(panel.querySelector("svg")?.getAttribute("data-shape")).toBe("mark");
  });

  it("shows the real image over the colour and draws no silhouette", () => {
    const { container } = render(
      <ProductPanel
        shape="cup"
        color="#3a2a22"
        imageUrl="https://cdn.example/cup.jpg"
        label="Cup"
      />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("https://cdn.example/cup.jpg");
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.getAttribute("loading")).toBe("lazy");
    expect(img?.getAttribute("decoding")).toBe("async");
    expect(img?.getAttribute("class")).toContain("object-cover");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("merges a layout class and nothing else from the caller", () => {
    const { container } = render(
      <ProductPanel
        shape="box"
        color="#c9862b"
        imageUrl={null}
        label="Box"
        className="w-24"
      />,
    );
    const panel = container.firstElementChild as HTMLElement;
    expect(panel.className).toContain("w-24");
    expect(panel.className).toContain("rounded-lg");
  });
});
