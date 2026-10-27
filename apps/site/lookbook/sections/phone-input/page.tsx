import { Label } from "@sirdab/one/components/label";
import { PhoneInputDemo } from "../../../lookbook/components/phone-input-demo";
import { sampler } from "../../../lookbook/components/samples";
import {
  PageHeader,
  Section,
  SpecimenLabel,
} from "../../../lookbook/components/section";

export default async function PhoneInputPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  const country = s("Country");
  const invalid = s("Enter a valid mobile number.");

  return (
    <>
      <PageHeader
        title="Phone input"
        tagline="One box: the country picker rides inside the field, the value leaves as E.164."
      />

      <Section
        title="Default"
        caption="Saudi, and the value under the field is what the caller gets"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lb-phone">{s("Phone")}</Label>
          <PhoneInputDemo
            locale={locale}
            countryLabelText={country}
            invalidText={invalid}
          />
        </div>
      </Section>

      <Section
        title="Prefilled"
        caption="a stored number opens on its own country"
      >
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col gap-1.5">
            <PhoneInputDemo
              locale={locale}
              countryLabelText={country}
              invalidText={invalid}
              initial="+966551785151"
            />
            <SpecimenLabel>Saudi</SpecimenLabel>
          </div>
          <div className="flex flex-col gap-1.5">
            <PhoneInputDemo
              locale={locale}
              countryLabelText={country}
              invalidText={invalid}
              initial="+971501234567"
            />
            <SpecimenLabel>UAE</SpecimenLabel>
          </div>
        </div>
      </Section>

      <Section
        title="Invalid"
        caption="the box stays neutral, the caption carries the error"
      >
        <PhoneInputDemo
          locale={locale}
          countryLabelText={country}
          invalidText={invalid}
          initial="+96655178"
        />
      </Section>

      <Section title="Sizes" caption="32 · 36 · 40 · 44">
        <div className="flex flex-wrap items-end gap-6">
          {(["sm", "md", "default", "touch"] as const).map((size) => (
            <div key={size} className="flex flex-col gap-1.5">
              <PhoneInputDemo
                locale={locale}
                countryLabelText={country}
                invalidText={invalid}
                initial="+966551785151"
                size={size}
              />
              <SpecimenLabel>{size}</SpecimenLabel>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Disabled" caption="the whole box dims, picker included">
        <PhoneInputDemo
          locale={locale}
          countryLabelText={country}
          invalidText={invalid}
          initial="+966551785151"
          disabled
        />
      </Section>
    </>
  );
}
