import { PageHeader, Section } from "../../../lookbook/components/section";

export default function ElevationPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Elevation"
        tagline="Border and surface separate; shadow is for what floats."
      />

      <Section
        title="The stacking rule"
        caption="three levels, never four"
        bare
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border-border rounded-xl border bg-background p-4">
            <p className="text-caption text-muted-foreground pb-3">
              1 · background
            </p>
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <p className="text-caption text-muted-foreground pb-3">
                2 · card
              </p>
              <div className="bg-popover shadow-popover-sm rounded-lg p-3">
                <p className="text-caption text-muted-foreground">
                  3 · popover · the stack ends here
                </p>
              </div>
            </div>
          </div>
          <div className="border-border flex items-center justify-center rounded-xl border p-4">
            <p className="text-caption text-destructive">
              background + card + modal + popover: never
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="The six shadows"
        caption="named for what floats, and the one page card"
        bare
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6">
          <div className="bg-card flex h-32 flex-col justify-end gap-1 rounded-2xl p-4 shadow-card">
            <p className="text-label">shadow-card</p>
            <p className="text-caption-quiet text-subtle">
              the page card; the ring is its hairline
            </p>
          </div>
          <div className="border-border bg-card flex h-32 flex-col justify-end gap-1 rounded-xl border p-4 shadow-none">
            <p className="text-label">shadow-none</p>
            <p className="text-caption-quiet text-subtle">
              what sits inside a card, list rows
            </p>
          </div>
          <div className="border-border bg-card shadow-raised flex h-32 flex-col justify-end gap-1 rounded-xl border p-4">
            <p className="text-label">shadow-raised</p>
            <p className="text-caption-quiet text-subtle">
              contact: hover lift, drag
            </p>
          </div>
          <div className="bg-popover shadow-popover-sm flex h-32 flex-col justify-end gap-1 rounded-lg p-4">
            <p className="text-label">shadow-popover-sm</p>
            <p className="text-caption-quiet text-subtle">
              floating panels; the ring is the hairline
            </p>
          </div>
          <div className="bg-surface-modal shadow-modal flex h-32 flex-col justify-end gap-1 rounded-xl p-4">
            <p className="text-label">shadow-modal</p>
            <p className="text-caption-quiet text-subtle">
              dialogs (the six-layer ladder)
            </p>
          </div>
          <div className="bg-surface-modal shadow-modal-lg flex h-32 flex-col justify-end gap-1 rounded-xl p-4">
            <p className="text-label">shadow-modal-lg</p>
            <p className="text-caption-quiet text-subtle">
              sheets, palettes (the seven-layer ladder)
            </p>
          </div>
        </div>
      </Section>

      <Section title="Hover lift" caption="light only; hover the card" bare>
        <div className="border-border bg-card hover:shadow-raised flex h-24 w-64 cursor-grab flex-col justify-end gap-1 rounded-xl border p-4 shadow-none transition-shadow">
          <p className="text-label">Drag me</p>
          <p className="text-caption-quiet text-subtle">
            none at rest → raised on hover
          </p>
        </div>
      </Section>

      <Section title="Z layers" caption="portals take a named layer">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 md:grid-cols-4">
          {(
            [
              ["z-behind", "−1 · frost/decoration pseudos"],
              ["z-raised", "1 · local lift"],
              ["z-raised-more", "2"],
              ["z-dropdown", "100"],
              ["z-sticky", "200"],
              ["z-overlay", "300"],
              ["z-modal", "400"],
              ["z-popover", "500"],
              ["z-toast", "600"],
              ["z-tooltip", "700"],
            ] as const
          ).map(([name, value]) => (
            <div
              key={name}
              className="border-border flex items-baseline justify-between gap-2 border-b py-1.5"
            >
              <p className="text-caption">{name}</p>
              <p className="tabular text-caption-quiet text-subtle">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
