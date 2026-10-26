import { formatIdentifier, formatPrice, formatValue } from "@sirdab/one/foundation";

import { toNumeralLocale } from "../../../lookbook/components/numeral-locale";
import { PageHeader, Section } from "../../../lookbook/components/section";

type PageProps = { lang: string };

/* Gallery page: prose lives in ./notes.md. */
export default async function NumeralsPage({
  lang,
}: PageProps): Promise<React.JSX.Element> {
  const locale = lang;
  const nl = toNumeralLocale(locale);

  return (
    <>
      <PageHeader
        title="Numerals"
        tagline="Western digits everywhere; identifiers stay raw."
      />

      <Section title="Values" caption="locale grouping">
        <div className="flex flex-col">
          {(
            [
              ["formatPrice(124950)", formatPrice(124950, { locale: nl })],
              ["formatPrice(4900)", formatPrice(4900, { locale: nl })],
              ["formatValue(12030)", formatValue(12030, nl)],
              [
                "formatValue(0.184, percent)",
                formatValue(0.184, nl, { style: "percent" }),
              ],
            ] as const
          ).map(([expr, value]) => (
            <div
              key={expr}
              className="h-control-xl border-border flex items-center justify-between gap-4 border-b last:border-b-0"
            >
              <p className="latin text-caption-quiet text-subtle">{expr}</p>
              <p className="tabular text-body">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Identifiers" caption="raw, isolated">
        <div className="flex flex-col">
          {(
            [
              ["orderId", formatIdentifier(249107)],
              ["sku", formatIdentifier("SKU-92841-A")],
              ["phone", formatIdentifier("0551234567")],
              ["otp", formatIdentifier("039284")],
            ] as const
          ).map(([field, value]) => (
            <div
              key={field}
              className="h-control-xl border-border flex items-center justify-between gap-4 border-b last:border-b-0"
            >
              <p className="latin text-caption-quiet text-subtle">{field}</p>
              <p className="tabular text-body">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tabular alignment" caption="tabular figures">
        <div className="flex max-w-64 flex-col">
          {[124950, 8900, 1203025, 475].map((amount) => (
            <p
              key={amount}
              className="tabular border-border text-body border-b py-1.5 text-end last:border-b-0"
            >
              {formatPrice(amount, { locale: nl })}
            </p>
          ))}
        </div>
      </Section>
    </>
  );
}
