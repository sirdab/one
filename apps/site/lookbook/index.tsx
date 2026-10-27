import { LookbookShell } from "./components/shell";
import { SECTIONS } from "./registry";
import LookbookIndexPage from "./sections/page";
import { UsageExample } from "./usage-examples";
import type { LookbookLocale } from "./routing";

export function LookbookPage({
  slug,
  lang = "ar",
}: {
  slug?: string[];
  lang?: LookbookLocale;
}): React.JSX.Element {
  const key: string | undefined = slug?.length === 1 ? slug[0] : undefined;
  const Section:
    | ((props: { lang: string }) => React.ReactNode | Promise<React.ReactNode>)
    | undefined =
    key && Object.hasOwn(SECTIONS, key) ? SECTIONS[key] : undefined;
  return (
    <LookbookShell locale={lang} section={key}>
      {Section ? <Section lang={lang} /> : <LookbookIndexPage lang={lang} />}
      {Section && key ? <UsageExample section={key} /> : null}
    </LookbookShell>
  );
}
