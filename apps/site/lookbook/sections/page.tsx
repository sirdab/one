import Link from "next/link";
import { Button } from "@sirdab/one/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@sirdab/one/components/card";
import { PageHeader } from "../components/section";
import { lookbookHref } from "../routing";
import type { LookbookLocale } from "../routing";

const startingPoints: readonly {
  section: string;
  title: string;
  description: string;
}[] = [
  {
    section: "colors",
    title: "Colors",
    description: "Surfaces, ramps, and semantic tones.",
  },
  {
    section: "typography",
    title: "Typography",
    description: "Arabic and Latin on a shared scale.",
  },
  {
    section: "buttons",
    title: "Buttons",
    description: "Actions, sizes, and interaction states.",
  },
  {
    section: "forms",
    title: "Forms",
    description: "Inputs and controls working together.",
  },
  {
    section: "sidebar",
    title: "Sidebar",
    description: "Navigation, drawers, and collapse behavior.",
  },
  {
    section: "icons",
    title: "Icons",
    description: "The shared set of interface glyphs.",
  },
];

export default function LookbookIndexPage({
  lang = "ar",
}: {
  lang?: LookbookLocale;
}): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="The One lookbook"
        tagline="Explore a component or start with the foundations."
      />
      <div className="catalog-start-grid" lang="en" dir="ltr">
        {startingPoints.map(
          ({ section, title, description }): React.JSX.Element => (
            <Link
              key={section}
              href={lookbookHref(section, lang)}
              className="catalog-start-link"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ),
        )}
      </div>
      <div className="catalog-setup" lang="en" dir="ltr">
        <Button asChild variant="secondary">
          <Link href="/docs">Setup guide</Link>
        </Button>
      </div>
    </>
  );
}
