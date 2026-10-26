import { MetricsProbe } from "../../../lookbook/components/metrics-probe";
import { PageHeader, Section } from "../../../lookbook/components/section";
import { WeightLadder } from "../../../lookbook/components/weight-ladder";

/* Gallery page: prose lives in ./notes.md. */

const APP_ROLES = [
  {
    cls: "text-caption",
    name: "caption",
    spec: "12/16 · 500 · chips, meta that must hold its own",
  },
  {
    cls: "text-caption-quiet",
    name: "caption-quiet",
    spec: "12/16 · 400 · helper text, quiet meta (pairs with subtle)",
  },
  { cls: "text-label", name: "label", spec: "13/20 · 500 · buttons" },
  { cls: "text-body", name: "body", spec: "14/20 · 500 · 78% of all text" },
  {
    cls: "text-body-quiet",
    name: "body-quiet",
    spec: "14/20 · 400 · inputs and overlay items from sm up, quiet prose",
  },
  {
    cls: "text-body-lg",
    name: "body-lg",
    spec: "16/24 · 400 · the touch-width type: auth fields, inputs below sm",
  },
  {
    cls: "text-heading-xs",
    name: "heading-xs",
    spec: "18/26 · 500 · section titles, stat values",
  },
  { cls: "text-heading-sm", name: "heading-sm", spec: "24/30 · 500" },
  {
    cls: "text-heading-md",
    name: "heading-md",
    spec: "35/40 · 500 · page titles",
  },
] as const;

const DISPLAY_ROLES = [
  { cls: "text-display-sm", name: "display-sm", spec: "32/36 · 300" },
  { cls: "text-display-md", name: "display-md", spec: "36/42 · 300" },
  {
    cls: "text-display-lg",
    name: "display-lg",
    spec: "48/52 · 300 · -0.02em",
  },
] as const;

export default function TypographyPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Typography"
        tagline="Nine app roles plus a display tier; Arabic runs 5% larger and can carry its own weight."
      />

      <Section
        title="Weight ladder"
        caption="live; ✳ marks a role Arabic carries heavier"
      >
        <WeightLadder />
      </Section>

      <Section
        title="App roles"
        caption="Latin and Arabic, side by side; the spec is the Latin one"
      >
        <div className="flex flex-col gap-4">
          {APP_ROLES.map((role) => (
            <div
              key={role.name}
              className="border-border flex flex-col gap-1 border-b pb-4 last:border-b-0 last:pb-0"
            >
              <p className="text-caption-quiet text-subtle">
                {role.name} · {role.spec}
              </p>
              <div className="grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-2">
                <p className={role.cls}>Add your first product to the store</p>
                <p className={role.cls} lang="ar" dir="rtl">
                  أضف أول منتج إلى متجرك
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Display tier" caption="marketing only, never mixed">
        <div className="flex flex-col gap-6">
          {DISPLAY_ROLES.map((role) => (
            <div key={role.name} className="flex flex-col gap-1">
              <p className="text-caption-quiet text-subtle">
                {role.name} · {role.spec}
              </p>
              <p className={role.cls}>Sell everywhere</p>
              <p className={role.cls} lang="ar" dir="rtl">
                بيع في كل مكان
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Metrics probe" caption="live; measures the rendered page">
        <MetricsProbe />
      </Section>

      <Section title="Diacritics" caption="fully vocalized clipping test">
        <div className="flex flex-col gap-2">
          <p className="text-body" lang="ar" dir="rtl">
            أَضِفْ أَوَّلَ مُنْتَجٍ إِلَى مَتْجَرِكَ الإِلِكْتُرُونِيِّ
          </p>
          <p className="text-heading-sm" lang="ar" dir="rtl">
            عَقِيلُ يَبْنِي مَتْجَرَك
          </p>
        </div>
      </Section>

      <Section title="Latin islands" caption="SKUs opt back in, prices do not">
        <p className="text-body" lang="ar" dir="rtl">
          وصل الطلب <span className="latin">SKU-92841-A</span> من متجر{" "}
          <span className="latin">Nike</span> وجاهز للشحن.
        </p>
      </Section>
    </>
  );
}
