import { formatValue } from "@sirdab/one/foundation";

import { TagIcon } from "@sirdab/one/icons/general";
import {
  FilterChip,
  FilterChipSelect,
} from "@sirdab/one/components/filter-chip";
import { FilterTrigger } from "@sirdab/one/components/filter-trigger";
import { Icon } from "@sirdab/one/components/icon";
import { FilterChipDemo } from "../../../lookbook/components/filter-chip-demo";
import { toNumeralLocale } from "../../../lookbook/components/numeral-locale";
import { sampler } from "../../../lookbook/components/samples";
import {
  PageHeader,
  Section,
  SpecimenLabel,
} from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function FilterChipPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  const nl = toNumeralLocale(locale);
  const categories = [
    { value: "apparel", label: s("Apparel") },
    { value: "beauty", label: s("Beauty") },
    { value: "electronics", label: s("Electronics") },
    { value: "perfumes", label: s("Perfumes") },
  ];
  return (
    <>
      <PageHeader
        title="Filter chip"
        tagline="A toggle at the smallest rung."
      />

      <Section title="Toggle" caption="pressed inverts to ink">
        <FilterChipDemo items={[s("Image"), s("Video"), s("Generate")]} />
      </Section>

      <Section title="States" caption="rest pair is live">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>unpressed · rest</SpecimenLabel>
            <FilterChip>{s("Apparel")}</FilterChip>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>pressed · rest</SpecimenLabel>
            <FilterChip defaultPressed>{s("Apparel")}</FilterChip>
          </div>
          {/* Pinned via className on a controlled chip so the state
                        cannot flip: a lookbook-only exemption; product code
                        must never pass state colours through className. */}
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>pressed · hover (pinned)</SpecimenLabel>
            <FilterChip pressed className="bg-gray-alpha-800">
              {s("Apparel")}
            </FilterChip>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>pressed · active (pinned)</SpecimenLabel>
            <FilterChip pressed className="bg-gray-alpha-700">
              {s("Apparel")}
            </FilterChip>
          </div>
        </div>
      </Section>

      <Section title="With choices" caption="picks invert the chip">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>with search</SpecimenLabel>
            <FilterChipSelect
              label={s("Category")}
              empty={s("No results.")}
              searchPlaceholder={s("Search…")}
              clearLabel={s("Clear")}
              defaultValue="apparel"
              items={categories}
            />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>plain list (no searchPlaceholder)</SpecimenLabel>
            <FilterChipSelect
              label={s("Category")}
              empty={s("No results.")}
              clearLabel={s("Clear")}
              items={categories}
            />
          </div>
        </div>
      </Section>

      <Section title="Filter trigger" caption="the 40px multi filter">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex flex-col items-start gap-1.5">
              <SpecimenLabel>rest · leading icon</SpecimenLabel>
              <FilterTrigger
                hint={s("Shows one category only")}
                label={s("Category")}
                icon={<Icon icon={TagIcon} />}
                items={categories}
                empty={s("No results.")}
                searchPlaceholder={s("Search…")}
                clearLabel={s("Clear")}
                numeralLocale={nl}
              />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <SpecimenLabel>applied · first pick +N, X clears</SpecimenLabel>
              <FilterTrigger
                label={s("Category")}
                icon={<Icon icon={TagIcon} />}
                items={categories}
                empty={s("No results.")}
                searchPlaceholder={s("Search…")}
                clearLabel={s("Clear")}
                numeralLocale={nl}
                defaultValues={["apparel", "beauty", "perfumes"]}
              />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <SpecimenLabel>plain list (no searchPlaceholder)</SpecimenLabel>
              <FilterTrigger
                label={s("Status")}
                items={[
                  { value: "active", label: s("Active") },
                  { value: "draft", label: s("Draft") },
                ]}
                empty={s("No results.")}
                clearLabel={s("Clear")}
                numeralLocale={nl}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <SpecimenLabel>
              filter bar · triggers lead, chips follow
            </SpecimenLabel>
            <div className="flex flex-wrap items-center gap-2">
              <FilterTrigger
                label={s("Category")}
                icon={<Icon icon={TagIcon} />}
                items={categories}
                empty={s("No results.")}
                searchPlaceholder={s("Search…")}
                clearLabel={s("Clear")}
                numeralLocale={nl}
                defaultValues={["beauty", "electronics"]}
              />
              <FilterTrigger
                label={s("Status")}
                items={[
                  { value: "active", label: s("Active") },
                  { value: "draft", label: s("Draft") },
                ]}
                empty={s("No results.")}
                clearLabel={s("Clear")}
                numeralLocale={nl}
              />
              <FilterChip defaultPressed>{s("Same-day delivery")}</FilterChip>
            </div>
            <p className="text-caption-quiet text-subtle">
              <span className="tabular">{formatValue(12, nl)}</span>{" "}
              {s("results")}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Filter bar" caption="chips compose">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChipSelect
              label={s("Category")}
              empty={s("No results.")}
              searchPlaceholder={s("Search…")}
              clearLabel={s("Clear")}
              defaultValue="beauty"
              items={categories}
            />
            <FilterChip defaultPressed>{s("Video")}</FilterChip>
            <FilterChip>{s("Image")}</FilterChip>
            <FilterChip>{s("Same-day delivery")}</FilterChip>
          </div>
          <p className="text-caption-quiet text-subtle">
            <span className="tabular">{formatValue(24, nl)}</span>{" "}
            {s("results")}
          </p>
        </div>
      </Section>
    </>
  );
}
