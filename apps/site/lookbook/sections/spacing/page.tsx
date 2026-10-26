import { cn } from "@sirdab/one/lib/utils";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose lives in ./notes.md. */

const STEPS = [
  { px: 2, cls: "w-0.5" },
  { px: 4, cls: "w-1" },
  { px: 6, cls: "w-1.5" },
  { px: 8, cls: "w-2" },
  { px: 10, cls: "w-2.5" },
  { px: 12, cls: "w-3" },
  { px: 16, cls: "w-4" },
  { px: 24, cls: "w-6" },
  { px: 32, cls: "w-8" },
  { px: 48, cls: "w-12" },
  { px: 64, cls: "w-16" },
  { px: 96, cls: "w-24" },
] as const;

const RADII = [
  { name: "xs", px: 4, cls: "rounded-xs" },
  { name: "sm", px: 6, cls: "rounded-sm" },
  { name: "md", px: 8, cls: "rounded-md" },
  { name: "lg", px: 10, cls: "rounded-lg" },
  { name: "xl", px: 12, cls: "rounded-xl" },
  { name: "2xl", px: 16, cls: "rounded-2xl" },
  { name: "popover", px: 20, cls: "rounded-popover" },
  { name: "modal", px: 24, cls: "rounded-modal" },
  { name: "full", px: 0, cls: "rounded-full" },
] as const;

export default function SpacingPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Spacing & radius"
        tagline="A 2px grid, not 4px; twelve steps total."
      />

      <Section
        title="Spacing scale"
        caption="app in 2 to 16, marketing in 24 to 96"
      >
        <div className="flex flex-col gap-2">
          {STEPS.map((step) => (
            <div key={step.px} className="flex items-center gap-4">
              <p className="tabular text-caption-quiet text-subtle w-16">
                {step.px}px
              </p>
              <div className={cn("bg-primary h-4 rounded-xs", step.cls)} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius scale" caption="10px is the default">
        <div className="flex flex-wrap items-end gap-4">
          {RADII.map((radius) => (
            <div
              key={radius.name}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "border-border-interactive bg-muted size-16 border",
                  radius.cls,
                )}
              />
              <p className="text-caption-quiet text-subtle">
                {radius.name}
                {radius.px > 0 ? ` · ${radius.px}px` : ""}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Control heights" caption="40px is the house control">
        <div className="flex flex-wrap items-end gap-4">
          {(
            [
              ["control-xs", "h-control-xs", "24"],
              ["control-sm", "h-control-sm", "28"],
              ["control-md", "h-control", "32 · primary action"],
              ["control-lg", "h-control-lg", "36"],
              ["control-xl", "h-control-xl", "40 · THE house control"],
              ["touch", "h-control-touch", "44 · touch floor"],
              ["row", "h-row", "52 · data rows"],
            ] as const
          ).map(([name, cls, note]) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "border-border-interactive text-caption flex w-24 items-center justify-center rounded-lg border",
                  cls,
                )}
              >
                {name}
              </div>
              <p className="text-caption-quiet text-subtle">{note}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
