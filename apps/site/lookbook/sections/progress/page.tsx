import { Progress } from "@sirdab/one/components/progress";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function ProgressPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Progress"
        tagline="How far along, filling from the start edge in either direction."
      />

      <Section
        title="Values"
        caption="0, 35 and 100: the bar fills from the start edge"
      >
        <div className="flex max-w-sm flex-col gap-4">
          {[0, 35, 100].map((value) => (
            <Progress
              key={value}
              value={value}
              aria-label={`${s("Progress")} ${value}`}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Indeterminate"
        caption="the total is not known yet: no value, the bar pulses"
      >
        <div className="max-w-sm">
          <Progress aria-label={s("Progress")} />
        </div>
      </Section>
    </>
  );
}
