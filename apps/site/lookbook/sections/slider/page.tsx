import { Slider } from "@sirdab/one/components/slider";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: the rules live in ./notes.md. */
export default async function SliderPage(): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Slider"
        tagline="One value on a line, for a continuous amount."
      />
      <Section title="At rest" caption="the minimum">
        <div className="max-w-sm">
          <Slider
            aria-label="Zoom at rest"
            min={1}
            max={3}
            step={0.01}
            defaultValue={[1]}
          />
        </div>
      </Section>
      <Section title="Mid-range" caption="arrow keys step it">
        <div className="max-w-sm">
          <Slider
            aria-label="Zoom mid-range"
            min={1}
            max={3}
            step={0.01}
            defaultValue={[2]}
          />
        </div>
      </Section>
      <Section title="Disabled" caption="dimmed, not draggable">
        <div className="max-w-sm">
          <Slider
            aria-label="Zoom disabled"
            min={1}
            max={3}
            step={0.01}
            defaultValue={[2]}
            disabled
          />
        </div>
      </Section>
    </>
  );
}
