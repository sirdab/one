import { WaveLoader } from "@sirdab/one/components/wave-loader";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function WaveLoaderPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Wave loader"
        tagline="A panel waiting: five ink bars in a wave, still under reduced motion."
      />

      <Section
        title="Sizes"
        caption="24px beside a caption, 32px default, 64px for a page"
      >
        <div className="flex items-center gap-8">
          <WaveLoader size="sm" />
          <WaveLoader />
          <WaveLoader size="lg" />
        </div>
      </Section>

      <Section
        title="A panel loading"
        caption="the room the content will fill, the wave in its middle"
      >
        <div
          role="status"
          aria-busy="true"
          className="border-border bg-card flex h-48 w-80 items-center justify-center rounded-lg border"
        >
          <WaveLoader aria-label={s("Loading…")} />
        </div>
      </Section>
    </>
  );
}
