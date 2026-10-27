import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LookbookPage } from "../../../lookbook";
import { SECTIONS } from "../../../lookbook/registry";
import { lookbookMetadata } from "../../../seo";
import { parseLookbookRoute } from "../../../lookbook/routing";

type RouteProps = { params: Promise<{ slug?: string[] }> };

export const dynamicParams: boolean = false;

export function generateStaticParams(): { slug: string[] }[] {
  return [
    { slug: [] },
    { slug: ["ar"] },
    { slug: ["en"] },
    ...Object.keys(SECTIONS).flatMap(
      (section: string): { slug: string[] }[] => [
        { slug: [section] },
        { slug: ["ar", section] },
        { slug: ["en", section] },
      ],
    ),
  ];
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { section, locale } = parseLookbookRoute((await params).slug);
  return lookbookMetadata(section ?? "", locale);
}

export default async function LookbookRoute({
  params,
}: RouteProps): Promise<React.JSX.Element> {
  const { locale, section, valid } = parseLookbookRoute((await params).slug);
  if (!valid || (section && !Object.hasOwn(SECTIONS, section))) notFound();
  return <LookbookPage slug={section ? [section] : []} lang={locale} />;
}
