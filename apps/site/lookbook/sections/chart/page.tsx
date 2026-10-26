import {
  ChartAreaDemo,
  ChartBarDemo,
} from "../../../lookbook/components/chart-demo";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default function ChartPage({
  lang = "en",
}: {
  lang?: string;
}): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Chart"
        tagline="Recharts, wearing the foundation tokens."
      />

      <Section title="Area" caption="one series, hover for the readout">
        <ChartAreaDemo locale={lang} />
      </Section>

      <Section title="Bar" caption="two series, dashed indicator">
        <ChartBarDemo locale={lang} />
      </Section>
    </>
  );
}
