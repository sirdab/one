import { Spinner } from "@sirdab/one/components/spinner";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function SpinnerPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Spinner"
        tagline="Activity, not decoration: ink, spinning, still under reduced motion."
      />

      <Section title="Sizes" caption="16px default, 12px inline">
        <div className="flex items-center gap-6">
          <Spinner />
          <Spinner size="sm" />
        </div>
      </Section>

      <Section
        title="Inline with a status line"
        caption="the line names the activity; the spinner stays decorative"
      >
        <div className="bg-surface-whisper text-body-quiet text-muted-foreground flex w-fit items-center gap-2 rounded-md p-3">
          <Spinner size="sm" />
          {s("Searching…")}
        </div>
      </Section>
    </>
  );
}
