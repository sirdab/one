import { PageHeader, Section } from "../../../lookbook/components/section";

const BREAKPOINTS: { name: string; px: number; ours?: boolean }[] = [
  { name: "2xs", px: 375, ours: true },
  { name: "xs", px: 480, ours: true },
  { name: "sm", px: 640 },
  { name: "md", px: 768 },
  { name: "lg", px: 1024 },
  { name: "xl", px: 1280 },
  { name: "2xl", px: 1536 },
  { name: "3xl", px: 1920, ours: true },
];

const CONTAINERS: { name: string; px: number }[] = [
  { name: "sm", px: 384 },
  { name: "md", px: 448 },
  { name: "lg", px: 512 },
  { name: "xl", px: 576 },
  { name: "2xl", px: 672 },
  { name: "3xl", px: 768 },
  { name: "4xl", px: 896 },
  { name: "5xl", px: 1024 },
  { name: "6xl", px: 1152 },
  { name: "7xl", px: 1280 },
];

export default function BreakpointsPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Breakpoints"
        tagline="Tailwind's five, untouched, plus 2xs, xs, and 3xl at the edges."
      />

      <Section title="Breakpoint scale" caption="bars proportional to 3xl">
        <div className="flex flex-col gap-2">
          {BREAKPOINTS.map((bp) => (
            <div key={bp.name} className="flex items-center gap-4">
              <p className="latin text-caption w-8 shrink-0">{bp.name}</p>
              <div className="min-w-0 flex-1">
                <div
                  className="bg-primary h-4 rounded-xs"
                  style={{
                    width: `${(bp.px / 1920) * 100}%`,
                  }}
                />
              </div>
              <p className="tabular text-caption-quiet text-subtle w-24 shrink-0 text-end">
                {bp.px}px{bp.ours ? " · ours" : ""}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Container scale"
        caption="max-w-* stops, Tailwind defaults"
      >
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {CONTAINERS.map((container) => (
            <div
              key={container.name}
              className="border-border flex items-baseline justify-between border-b py-2 last:border-b-0 sm:nth-last-2:border-b-0"
            >
              <p className="latin text-caption">--container-{container.name}</p>
              <p className="tabular text-caption-quiet text-subtle">
                {container.px}px
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
