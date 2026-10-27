import type { Metadata } from "next";
import { CATALOG } from "./lookbook/catalog";
import { lookbookHref, type LookbookLocale } from "./lookbook/routing";

export const siteName: string = "Sirdab One";
export const siteDescription: string =
  "Open-source React components built on shadcn/ui with Sirdab’s design tokens, Arabic and RTL support, and light and dark themes.";

export function resolveSiteUrl(
  value: string | undefined,
  basePath: string = "",
): URL | undefined {
  if (!value) return undefined;
  const url: URL = new URL(value);
  const expectedPath: string = `${basePath.replace(/\/$/, "")}/`;
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    `${url.pathname.replace(/\/$/, "")}/` !== expectedPath
  ) {
    throw new Error(
      "SITE_URL must be an HTTPS URL whose path matches SITE_BASE_PATH, without credentials, query, or fragment.",
    );
  }
  url.pathname = expectedPath;
  return url;
}

export const basePath: string = process.env.SITE_BASE_PATH ?? "";
export const siteUrl: URL | undefined = resolveSiteUrl(
  process.env.SITE_URL,
  basePath,
);

export function publicUrl(path: string): string | undefined {
  return siteUrl ? new URL(path.replace(/^\//, ""), siteUrl).href : undefined;
}

export function languageAlternates(section: string): Record<string, string> {
  if (!siteUrl) return {};
  return Object.fromEntries(
    (["ar", "en", "x-default"] as const).map(
      (language: "ar" | "en" | "x-default"): [string, string] => [
        language,
        new URL(
          `${lookbookHref(section, language === "en" ? "en" : "ar").slice(1)}/`,
          siteUrl,
        ).href,
      ],
    ),
  );
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url: string | undefined = publicUrl(path);
  const image: string =
    publicUrl("/social-preview.png") ?? `${basePath}/social-preview.png`;
  const socialTitle: string = `${title} | ${siteName}`;
  return {
    title: { absolute: socialTitle },
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: "website",
      siteName,
      title: socialTitle,
      description,
      url,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "Sirdab One. Every part working as one. React components with Arabic and RTL support.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: image, alt: "Sirdab One. Every part working as one." }],
    },
  };
}

export function lookbookMetadata(
  section: string,
  locale: LookbookLocale,
): Metadata {
  const label: string =
    CATALOG.flatMap((group: (typeof CATALOG)[number]) => group.items).find(
      (item: { href: string; label: string }): boolean =>
        item.href === `/lookbook/${section}`,
    )?.label ?? "Lookbook";
  const title: string = `${label}${locale === "ar" ? " with Arabic examples" : " with English examples"}`;
  const description: string = `Explore ${label.toLowerCase()} in Sirdab One with live ${locale === "ar" ? "Arabic and RTL" : "English and LTR"} examples, shared design tokens, and light and dark themes.`;
  const metadata: Metadata = pageMetadata(
    title,
    description,
    `${lookbookHref(section, locale)}/`,
  );
  if (siteUrl)
    metadata.alternates = {
      ...metadata.alternates,
      languages: languageAlternates(section),
    };
  return metadata;
}
