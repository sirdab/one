import type { MetadataRoute } from "next";
import { CATALOG } from "../lookbook/catalog";
import { lookbookHref } from "../lookbook/routing";
import { languageAlternates, siteUrl } from "../seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  const root: URL = siteUrl;
  const sections: string[] = [
    "",
    ...CATALOG.flatMap((group: (typeof CATALOG)[number]) =>
      group.items.map((item: { href: string; label: string }): string =>
        item.href.replace("/lookbook/", ""),
      ),
    ),
  ];
  return [
    { url: root.href },
    { url: new URL("docs/", root).href },
    ...sections.flatMap((section: string): MetadataRoute.Sitemap =>
      (["ar", "en"] as const).map((locale: "ar" | "en") => ({
        url: new URL(`${lookbookHref(section, locale).slice(1)}/`, root).href,
        alternates: { languages: languageAlternates(section) },
      })),
    ),
  ];
}
