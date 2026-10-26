import { formatPrice } from "@sirdab/one/foundation";

import {
  ArchivedIcon,
  DraftIcon,
  LiveIcon,
  WarningIcon,
} from "@sirdab/one/icons/catalogue";
import { AlertCircleIcon } from "@sirdab/one/icons/general";
import type { IconComponent } from "@sirdab/one/icons/house-icon";
import {
  Badge,
  STATUS_TONES,
  StatusNote,
  type StatusTone,
} from "@sirdab/one/components/badge";
import { Icon } from "@sirdab/one/components/icon";
import { cn } from "@sirdab/one/lib/utils";
import { toNumeralLocale } from "../../../lookbook/components/numeral-locale";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: the rules (whose move it is, which domain value takes which
   tone) live in ./notes.md and in the badge's header comment. */
const MEANING: Record<StatusTone, string> = {
  neutral: "Nothing for you to do",
  attention: "Your move, nothing is wrong",
  warning: "Off, and needs you soon",
  critical: "Failed, will not fix itself",
  success: "Live, switched on",
};

const WORD: Record<StatusTone, string> = {
  neutral: "Fulfilled",
  attention: "Draft",
  warning: "Payouts on hold",
  critical: "Failed",
  success: "Live",
};

/* An icon on a card takes the tone's -glyph step (3:1), never the 700 text
   step, which at icon size reads as a dull brown. A solid disc cuts its
   mark out in the page colour. */
const GLYPH: Record<StatusTone, { icon: IconComponent; className: string }> = {
  neutral: {
    icon: ArchivedIcon,
    className: "fill-neutral-glyph text-background",
  },
  attention: { icon: DraftIcon, className: "text-attention-glyph" },
  warning: { icon: WarningIcon, className: "text-warning-glyph" },
  critical: { icon: AlertCircleIcon, className: "text-destructive-glyph" },
  success: {
    icon: LiveIcon,
    className: "fill-success-glyph text-background",
  },
};

export default async function BadgePage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  const nl = toNumeralLocale(locale);
  return (
    <>
      <PageHeader
        title="Badge"
        tagline="A status is a tone. A tag is a look."
      />

      <Section
        title="The five tones"
        caption="the colour says whose move it is"
      >
        <ul className="flex flex-col gap-3">
          {STATUS_TONES.map((tone) => (
            <li key={tone} className="flex items-center gap-4">
              <span className="flex w-52 shrink-0 justify-start">
                <Badge tone={tone}>{s(WORD[tone])}</Badge>
              </span>
              <span className="text-body-quiet text-muted-foreground">
                {tone}: {MEANING[tone]}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Tags"
        caption="no dot, no tone: an attribute, not a state"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{s("Digital")}</Badge>
          <Badge variant="outline">{s("Package")}</Badge>
          <Badge variant="outline">{s("Credit note")}</Badge>
          <Badge variant="secondary">3</Badge>
          <Badge variant="ghost">{s("Invoice")}</Badge>
        </div>
      </Section>

      <Section
        title="Notes"
        caption="the wash as a centred sentence about a record"
      >
        <div className="flex flex-col items-center gap-3">
          <StatusNote tone="attention">
            {s("Draft: only you can see it")}
          </StatusNote>
          <StatusNote tone="warning">{s("3 with no tracking")}</StatusNote>
          <StatusNote tone="neutral">
            {s("Archived. Shoppers cannot see this product.")}
          </StatusNote>
        </div>
      </Section>

      <Section title="In a row" caption="the chip sits at the inline end">
        <ul className="divide-border flex max-w-md flex-col divide-y">
          {(
            [
              ["Leather tote bag", "success", "Live", 24900],
              ["Scented candle", "attention", "Draft", 4900],
              ["Oud perfume", "neutral", "Archived", 124950],
            ] as const
          ).map(([name, tone, word, priceMinor]) => (
            <li
              key={name}
              className="flex items-center justify-between gap-3 py-3"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-body truncate">{s(name)}</span>
                <span className="latin text-caption-quiet text-subtle">
                  {formatPrice(priceMinor, { locale: nl })}
                </span>
              </span>
              <Badge tone={tone}>{s(word)}</Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="On the dark frame" caption="the 950 wash, the 400 word">
        <div className="dark flex flex-wrap items-center gap-2 rounded-xl bg-background p-4 text-foreground">
          {STATUS_TONES.map((tone) => (
            <Badge key={tone} tone={tone}>
              {s(WORD[tone])}
            </Badge>
          ))}
        </div>
      </Section>

      <Section
        title="Glyphs"
        caption="each tone's -glyph step, for icons on a card"
      >
        <div className="flex flex-wrap items-center gap-6">
          {STATUS_TONES.map((tone) => (
            <span key={tone} className="flex items-center gap-2">
              <Icon
                icon={GLYPH[tone].icon}
                aria-hidden
                className={cn("size-5", GLYPH[tone].className)}
              />
              <span className="text-caption text-muted-foreground">{tone}</span>
            </span>
          ))}
        </div>
        <div className="dark mt-4 flex flex-wrap items-center gap-6 rounded-xl bg-background p-4 text-foreground">
          {STATUS_TONES.map((tone) => (
            <span key={tone} className="flex items-center gap-2">
              <Icon
                icon={GLYPH[tone].icon}
                aria-hidden
                className={cn("size-5", GLYPH[tone].className)}
              />
              <span className="text-caption text-muted-foreground">{tone}</span>
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}
