import type { CatalogGroup } from "./catalog";

export type LookbookLocale = "en" | "ar";

export function lookbookHref(
  section: string = "",
  locale: LookbookLocale = "ar",
): string {
  return [
    "/lookbook",
    ...(locale === "en" ? ["en"] : []),
    ...(section ? [section] : []),
  ].join("/");
}

export function parseLookbookRoute(slug: readonly string[] = []): {
  locale: LookbookLocale;
  section: string | undefined;
  valid: boolean;
} {
  const locale: LookbookLocale = slug[0] === "en" ? "en" : "ar";
  const parts: readonly string[] =
    slug[0] === "ar" || slug[0] === "en" ? slug.slice(1) : slug;
  return { locale, section: parts[0], valid: parts.length <= 1 };
}

export function filterCatalog(
  catalog: readonly CatalogGroup[],
  query: string,
): CatalogGroup[] {
  const normalized: string = query.trim().toLocaleLowerCase("en");
  return catalog
    .map((group: CatalogGroup): CatalogGroup => ({
      ...group,
      items: group.items.filter(
        (item: { label: string; href: string }): boolean =>
          `${group.title} ${item.label}`
            .toLocaleLowerCase("en")
            .includes(normalized),
      ),
    }))
    .filter((group: CatalogGroup): boolean => group.items.length > 0);
}
