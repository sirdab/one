import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveSiteUrl } from "../seo";
import { CATALOG } from "../lookbook/catalog";

afterEach((): void => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("public URLs", (): void => {
  it("supports a custom domain root and a project subpath", (): void => {
    expect(resolveSiteUrl("https://design.example.test")?.href).toBe(
      "https://design.example.test/",
    );
    expect(
      resolveSiteUrl("https://design.example.test/one", "/one")?.href,
    ).toBe("https://design.example.test/one/");
    expect(resolveSiteUrl(undefined)).toBeUndefined();
  });

  it.each([
    ["http://design.example.test", ""],
    ["https://design.example.test/one", ""],
    ["https://design.example.test", "/one"],
    ["https://user:pass@design.example.test", ""],
    ["https://design.example.test?preview=1", ""],
    ["https://design.example.test#preview", ""],
  ])(
    "rejects an unsafe or inconsistent deployment URL %s",
    (value: string, basePath: string): void => {
      expect(() => resolveSiteUrl(value, basePath)).toThrow();
    },
  );
});

it("keeps unconfigured previews out of indexing without inventing a public URL", async (): Promise<void> => {
  vi.stubEnv("SITE_URL", "");
  vi.resetModules();
  const { default: robots } = await import("../app/robots");
  const { default: sitemap } = await import("../app/sitemap");
  const { pageMetadata } = await import("../seo");
  expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  expect(sitemap()).toEqual([]);
  expect(pageMetadata("Home", "Description", "/").alternates).toBeUndefined();
});

it.each(["", "/one"])(
  "generates canonical pages and reciprocal language links under %s",
  async (basePath: string): Promise<void> => {
    const root: string = `https://design.example.test${basePath}/`;
    vi.stubEnv("SITE_URL", root);
    vi.stubEnv("SITE_BASE_PATH", basePath);
    vi.resetModules();
    const { lookbookMetadata } = await import("../seo");
    const { default: sitemap } = await import("../app/sitemap");
    const { default: robots } = await import("../app/robots");
    const entries = sitemap();
    const urls: string[] = entries.map(
      (entry: (typeof entries)[number]): string => entry.url,
    );
    expect(new Set(urls).size).toBe(
      2 +
        2 *
          (1 +
            CATALOG.flatMap((group: (typeof CATALOG)[number]) => group.items)
              .length),
    );
    expect(
      urls.some((url: string): boolean => url.includes("/lookbook/ar/")),
    ).toBe(false);
    expect(
      urls.every(
        (url: string): boolean => url.startsWith(root) && url.endsWith("/"),
      ),
    ).toBe(true);
    expect(robots().sitemap).toBe(`${root}sitemap.xml`);
    const arabic = lookbookMetadata("buttons", "ar");
    const english = lookbookMetadata("buttons", "en");
    expect(arabic.alternates).toEqual({
      canonical: `${root}lookbook/buttons/`,
      languages: {
        ar: `${root}lookbook/buttons/`,
        en: `${root}lookbook/en/buttons/`,
        "x-default": `${root}lookbook/buttons/`,
      },
    });
    expect(english.alternates?.languages).toEqual(arabic.alternates?.languages);
    expect(english.alternates?.canonical).toBe(`${root}lookbook/en/buttons/`);
    expect(english.description).toContain("English and LTR");
    expect(arabic.description).toContain("Arabic and RTL");
    expect(english.openGraph).toMatchObject({
      url: `${root}lookbook/en/buttons/`,
      images: [{ url: `${root}social-preview.png`, width: 1200, height: 630 }],
    });
  },
);
