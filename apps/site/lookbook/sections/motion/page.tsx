import { cn } from "@sirdab/one/lib/utils";
import { PageHeader, Section } from "../../../lookbook/components/section";

const TIERS = [
  {
    name: "100 · controls, colour, exits",
    note: "bare transition-colors; the default IS 100ms",
    tile: "transition-colors hover:bg-btn-ghost-surface-hover",
    bar: null,
  },
  {
    name: "150 · floating enters",
    note: "popover, menu, tooltip in; dialog out",
    tile: "transition-colors duration-150 hover:bg-btn-ghost-surface-hover",
    bar: null,
  },
  {
    name: "200 · dialog in, chips",
    note: "size and layout changes opt up explicitly",
    tile: "transition-colors hover:bg-btn-ghost-surface-hover",
    bar: "transition-all duration-200 group-hover:w-full",
  },
  {
    name: "300 · drawers, collapsibles",
    note: "size changes; the deliberate end of response times",
    tile: "transition-colors hover:bg-btn-ghost-surface-hover",
    bar: "transition-all duration-300 group-hover:w-full",
  },
] as const;

export default function MotionPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Motion"
        tagline="Transitions are response times; loops are speeds."
      />

      <Section
        title="Response times"
        caption="hover each tile; 100 is the bare default"
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "group border-border flex h-24 flex-col justify-end gap-1 rounded-lg border p-3",
                tier.tile,
              )}
            >
              {tier.bar ? (
                <div
                  className={cn(
                    "mb-auto h-1.5 w-8 rounded-full bg-foreground",
                    tier.bar,
                  )}
                />
              ) : null}
              <p className="text-label">{tier.name}</p>
              <p className="text-caption-quiet text-subtle">{tier.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Loops" caption="linear for rotation">
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="border-border size-6 animate-spin rounded-full border-2 border-t-foreground" />
            <p className="text-caption-quiet text-subtle">spin · 1s</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-muted h-6 w-24 animate-pulse rounded-lg" />
            <p className="text-caption-quiet text-subtle">pulse · 2s</p>
          </div>
        </div>
      </Section>

      <Section title="Easings" caption="ease-out is the default">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 md:grid-cols-2">
          {(
            [
              [
                "ease-out",
                "cubic-bezier(0.16, 1, 0.3, 1)",
                "entrances, the default",
              ],
              ["ease-in", "cubic-bezier(0.7, 0, 0.84, 0)", "exits"],
              [
                "ease-in-out",
                "cubic-bezier(0.65, 0, 0.35, 1)",
                "state to state",
              ],
              ["ease-linear", "linear", "loops, spinners"],
              [
                "ease-spring",
                "cubic-bezier(0.34, 1.56, 0.64, 1)",
                "slight overshoot",
              ],
            ] as const
          ).map(([name, value, use]) => (
            <div
              key={name}
              className="border-border flex items-baseline justify-between gap-2 border-b py-1.5"
            >
              <p className="text-caption">
                {name}{" "}
                <span className="text-caption-quiet text-subtle">{use}</span>
              </p>
              <p className="latin text-caption-quiet text-subtle">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
