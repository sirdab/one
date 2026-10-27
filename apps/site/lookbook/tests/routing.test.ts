import { describe, expect, it } from "vitest";
import { CATALOG } from "../catalog";
import { filterCatalog, lookbookHref, parseLookbookRoute } from "../routing";

describe("static lookbook routes", () => {
  it("resolves both indexes and both section directions", () => {
    expect(parseLookbookRoute()).toEqual({
      locale: "ar",
      section: undefined,
      valid: true,
    });
    expect(parseLookbookRoute(["en", "buttons"])).toEqual({
      locale: "en",
      section: "buttons",
      valid: true,
    });
    expect(parseLookbookRoute(["en"])).toEqual({
      locale: "en",
      section: undefined,
      valid: true,
    });
    expect(parseLookbookRoute(["ar"])).toEqual({
      locale: "ar",
      section: undefined,
      valid: true,
    });
    expect(parseLookbookRoute(["buttons"])).toEqual({
      locale: "ar",
      section: "buttons",
      valid: true,
    });
    expect(parseLookbookRoute(["ar", "buttons"])).toEqual({
      locale: "ar",
      section: "buttons",
      valid: true,
    });
  });
  it("does not silently accept extra path segments", () => {
    expect(parseLookbookRoute(["ar", "buttons", "unknown"]).valid).toBe(false);
  });
  it("keeps the selected direction in index and section links", () => {
    expect(lookbookHref()).toBe("/lookbook");
    expect(lookbookHref("", "ar")).toBe("/lookbook");
    expect(lookbookHref("buttons", "ar")).toBe("/lookbook/buttons");
    expect(lookbookHref("buttons", "en")).toBe("/lookbook/en/buttons");
  });
});

describe("catalog search", () => {
  it("matches a trimmed label or category and does not mutate the catalog", () => {
    const before: string = JSON.stringify(CATALOG);
    expect(
      filterCatalog(CATALOG, "  BUTTONS  ")
        .flatMap((group) => group.items)
        .map((item) => item.label),
    ).toEqual(["Buttons"]);
    expect(
      filterCatalog(CATALOG, "foundations").map((group) => group.title),
    ).toEqual(["Foundations"]);
    expect(JSON.stringify(CATALOG)).toBe(before);
  });
  it("returns the whole catalog for a blank query and no groups for no match", () => {
    expect(filterCatalog(CATALOG, " ")).toEqual(CATALOG);
    expect(filterCatalog(CATALOG, "not-a-component")).toEqual([]);
  });
});
