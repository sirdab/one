import { Fragment } from "react";

import {
  CheckCircleIcon,
  WarningIcon,
} from "@sirdab/one/icons/catalogue";
import { AlertCircleIcon } from "@sirdab/one/icons/general";
import { Badge } from "@sirdab/one/components/badge";
import { Icon } from "@sirdab/one/components/icon";
import { cn } from "@sirdab/one/lib/utils";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

// Gallery page: prose lives in ./notes.md. The raw ramp is rendered here
// for DOCUMENTATION via constructed names; components never reference it
// (the token lint enforces that). The alpha ramp is public: nav fills and
// the component ladders use it directly.

const RAMP_STEPS = [
  50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750,
  800, 850, 900, 925, 950,
] as const;

const SEMANTIC_GROUPS: {
  title: string;
  caption: string;
  tokens: {
    name: string;
    /* Rows that are not a plain --var: muted-foreground paints --secondary
           (the shadcn collision), the icon-quiet ladder paints solid ink at an
           --icon-quiet-opacity*, and ring-input-focus demos the live utility
           on the swatch. utility rows are class names, so no -- prefix. */
    swatch?: string;
    opacity?: string;
    className?: string;
    utility?: boolean;
    on?: string;
    note: string;
  }[];
}[] = [
  {
    title: "Surfaces",
    caption: "depth is surface + border, not shadows",
    tokens: [
      { name: "background", note: "the page" },
      {
        name: "card",
        note: "resting card: the page white, separated by its hairline",
      },
      { name: "surface-flat", note: "what card resolves through" },
      {
        name: "surface-whisper",
        note: "the tonal panel: recessed groups (preview, media, code)",
      },
      {
        name: "surface-overlay",
        note: "popovers, dropdowns, select panels; painted at 90% frost",
      },
      {
        name: "surface-modal",
        note: "dialogs, sheets, command palette; the scrim separates",
      },
      {
        name: "surface-rail",
        note: "the docked rail: between the page and a card",
      },
      {
        name: "scrim-surface",
        note: "the veil behind a modal: brightens, never dims",
      },
      { name: "popover", note: "alias of surface-overlay" },
      {
        name: "popover-surface",
        note: "the actual floating fill: popover at 90% over backdrop-blur-popover",
      },
      {
        name: "popover-foreground",
        note: "text on the frosted surface",
      },
    ],
  },
  {
    title: "Text",
    caption: "three tiers",
    tokens: [
      { name: "foreground", note: "body text; ink under the hood" },
      {
        name: "muted-foreground",
        swatch: "secondary",
        note: "de-emphasised text a user must still read",
      },
      {
        name: "subtle",
        note: "placeholders, timestamps, redundant labels",
      },
    ],
  },
  {
    title: "Actions & fills",
    caption: "one primary per view",
    tokens: [
      { name: "primary", on: "primary-foreground", note: "THE action" },
      {
        name: "primary-hover",
        on: "primary-foreground",
        note: "hover; gray-800 exact",
      },
      {
        name: "primary-active",
        on: "primary-foreground",
        note: "active / open / on; gray-700 exact",
      },
      { name: "primary-foreground", note: "text on primary" },
      {
        name: "muted",
        note: "quiet fill: icon wells, skeletons, counts, the neutral status chip (never text)",
      },
      {
        name: "accent",
        on: "accent-foreground",
        note: "shadcn-compat only; never paint hovers with bg-accent",
      },
      { name: "accent-foreground", note: "text on accent" },
    ],
  },
  {
    title: "Status (report only)",
    caption: "reports, never commands",
    tokens: [
      {
        name: "destructive",
        note: "error text under a field, failed badges (6.5:1 on white)",
      },
      {
        name: "destructive-foreground",
        note: "ink for the solid fill; reserved, the fill never ships",
      },
      {
        name: "destructive-subtle",
        on: "destructive",
        note: "critical chip and error banner fill; destructive text on top (5.5:1)",
      },
      {
        name: "destructive-glyph",
        note: "an icon beside a failure, 3:1 on a card",
      },
      { name: "warning", note: "warning chip and banner text" },
      {
        name: "warning-foreground",
        note: "ink for the solid fill; reserved, the fill never ships",
      },
      {
        name: "warning-subtle",
        on: "warning",
        note: "warning chip fill; warning text on top (5.2:1), foreground on a banner",
      },
      {
        name: "warning-glyph",
        note: "an icon in the warning tone: the load-error triangle",
      },
      { name: "success", note: "success chip and banner text" },
      {
        name: "success-foreground",
        note: "ink for the solid fill; reserved, the fill never ships",
      },
      {
        name: "success-subtle",
        on: "success",
        note: "success chip fill; success text on top (4.7:1), foreground on a banner",
      },
      {
        name: "success-glyph",
        note: "an icon beside a live record: the tick, the picker disc",
      },
      {
        name: "attention",
        note: "the yellow: draft, pending, waiting on you (5.0:1 on its fill)",
      },
      {
        name: "attention-foreground",
        note: "ink for the solid fill; reserved, the fill never ships",
      },
      {
        name: "attention-subtle",
        on: "attention",
        note: "attention chip and note fill; attention text on top",
      },
      {
        name: "attention-glyph",
        note: "an icon beside a draft, 3.1:1 on white (a mustard: a lemon cannot clear 3:1)",
      },
      {
        name: "neutral-glyph",
        note: "an icon in the neutral tone: gray-500, 3.35:1, same in both themes",
      },
    ],
  },
  {
    title: "Borders & focus",
    caption: "tuned by eye, not WCAG",
    tokens: [
      { name: "border", note: "dividers, container edges" },
      {
        name: "border-interactive",
        note: "checkbox / radio rest border (= input's alpha-200)",
      },
      { name: "input", note: "input rest border (alpha-200)" },
      {
        name: "input-border-hover",
        note: "input hover, every size (alpha-400, a bigger jump than buttons)",
      },
      {
        name: "input-border-hover-form",
        note: "checkbox / radio hover: one gentle rung (alpha-300)",
      },
      { name: "ring", note: "focus colour: ink" },
      {
        name: "ring-input-focus",
        utility: true,
        swatch: "background",
        className: "ring-input-focus",
        note: "0.5px ink ring utility; Input / Textarea focus-within pairs it with border-ring",
      },
    ],
  },
  {
    title: "Component ladders",
    caption: "one alpha rung per step",
    tokens: [
      { name: "btn-border", note: "secondary button rest (alpha-200)" },
      {
        name: "btn-border-hover",
        note: "hover / active border (alpha-300)",
      },
      {
        name: "btn-surface-hover",
        note: "secondary hover fill (alpha-50)",
      },
      {
        name: "btn-surface-active",
        note: "secondary active fill (alpha-100)",
      },
      {
        name: "btn-ghost-surface-hover",
        note: "ghost hover (alpha-100)",
      },
      {
        name: "btn-ghost-surface-active",
        note: "ghost active (alpha-200)",
      },
      {
        name: "btn-destructive",
        note: "the destructive button's red outline: border and text, translucent washes on interaction",
      },
      {
        name: "btn-destructive-border-disabled",
        note: "disabled destructive outline",
      },
      {
        name: "btn-destructive-text-disabled",
        note: "disabled destructive text",
      },
      {
        name: "btn-disabled-surface",
        note: "primary disabled fill: solid gray-400, not an opacity fade",
      },
      {
        name: "btn-disabled-text",
        note: "primary disabled text: gray-100 on the gray-400 fill",
      },
      {
        name: "row-surface-hover",
        note: "table-row pill hover (alpha-50)",
      },
      {
        name: "row-surface-selected",
        note: "a ticked table row (alpha-100)",
      },
      {
        name: "row-surface-selected-hover",
        note: "a ticked row under the pointer (alpha-150)",
      },
      {
        name: "row-divider",
        note: "under every row, the header included (alpha-100)",
      },
      {
        name: "icon-quiet",
        utility: true,
        swatch: "foreground",
        opacity: "var(--icon-quiet-opacity)",
        note: "quiet icons: solid ink at fixed opacity, never an alpha colour",
      },
      {
        name: "icon-quiet-hover",
        utility: true,
        swatch: "foreground",
        opacity: "var(--icon-quiet-opacity-hover)",
        note: "hover steps up to the label's tone, never full ink",
      },
      {
        name: "icon-quiet-disabled",
        utility: true,
        swatch: "foreground",
        opacity: "var(--icon-quiet-opacity-disabled)",
        note: "half of rest, relative, never an absolute fade",
      },
    ],
  },
];

function Ramp({
  prefix,
  steps,
}: {
  prefix: string;
  steps: readonly number[];
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <div className="border-border flex overflow-hidden rounded-lg border">
        {steps.map((step) => (
          <div
            key={step}
            className="h-12 flex-1"
            title={`--${prefix}-${step}`}
            style={{ background: `var(--${prefix}-${step})` }}
          />
        ))}
      </div>
      <div className="flex">
        {steps.map((step) => (
          <p
            key={step}
            className="tabular text-caption-quiet text-subtle flex-1 text-center"
          >
            {step}
          </p>
        ))}
      </div>
    </div>
  );
}

export default async function ColorsPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Colors"
        tagline="One neutral ramp, with the semantic layer on top."
      />

      <Section
        title="Neutral ramp"
        caption="21 steps; the ink rail reads it mirrored"
      >
        <Ramp prefix="gray" steps={RAMP_STEPS} />
      </Section>

      <Section title="Ink & background" caption="beyond the ramp" bare>
        <div className="flex gap-4">
          <div className="border-border text-body flex h-16 flex-1 items-center justify-center rounded-lg border bg-background">
            background
          </div>
          <div className="text-body flex h-16 flex-1 items-center justify-center rounded-lg bg-foreground text-background">
            ink / foreground
          </div>
        </div>
      </Section>

      <Section title="Alpha ramp" caption="fills only, text is solid">
        <Ramp prefix="gray-alpha" steps={RAMP_STEPS} />
      </Section>

      {SEMANTIC_GROUPS.map((group) => (
        <Fragment key={group.title}>
          <Section title={group.title} caption={group.caption}>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {group.tokens.map((token) => (
                <div
                  key={token.name}
                  className="border-border flex items-center gap-3 border-b py-2 last:border-b-0 sm:nth-last-2:border-b-0"
                >
                  <div
                    className={cn(
                      "border-border flex h-10 w-16 shrink-0 items-center justify-center rounded-lg border",
                      token.className,
                    )}
                    style={{
                      background: `var(--${token.swatch ?? token.name})`,
                      color: token.on ? `var(--${token.on})` : undefined,
                      opacity: token.opacity,
                    }}
                  >
                    {token.on ? <span className="text-label">Aa</span> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="latin text-caption">
                      {token.utility ? token.name : `--${token.name}`}
                    </p>
                    <p className="text-caption-quiet text-subtle">
                      {token.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          {group.title === "Status (report only)" ? (
            <Section
              title="Status banners"
              caption="the -subtle washes in context"
            >
              <div className="flex flex-col gap-3">
                <div className="bg-destructive-subtle text-body text-destructive flex items-center gap-2 rounded-lg p-3">
                  <Icon icon={AlertCircleIcon} className="size-4 shrink-0" />
                  {s("Payment failed")}
                </div>
                <div className="bg-warning-subtle text-body flex items-center gap-2 rounded-lg p-3 text-foreground">
                  <Icon icon={WarningIcon} className="size-4 shrink-0" />
                  {s("Price must be zero or more.")}
                </div>
                <div className="bg-success-subtle text-body flex items-center gap-2 rounded-lg p-3 text-foreground">
                  <Icon icon={CheckCircleIcon} className="size-4 shrink-0" />
                  {s("Product published")}
                </div>
              </div>
            </Section>
          ) : null}
          {group.title === "Status (report only)" ? (
            <Section
              title="Status chips"
              caption="Badge tone, the colour says whose move it is"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{s("Fulfilled")}</Badge>
                <Badge tone="attention">{s("Draft")}</Badge>
                <Badge tone="warning">{s("Payouts on hold")}</Badge>
                <Badge tone="critical">{s("Failed")}</Badge>
                <Badge tone="success">{s("Live")}</Badge>
              </div>
            </Section>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}
