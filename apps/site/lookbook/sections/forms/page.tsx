import { Card, CardContent } from "@sirdab/one/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRow,
  FieldSet,
} from "@sirdab/one/components/field";
import { Input } from "@sirdab/one/components/input";
import { Switch } from "@sirdab/one/components/switch";
import { FormCardDemo } from "../../../lookbook/components/form-card-demo";
import { PhoneFieldDemo } from "../../../lookbook/components/phone-field-demo";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function FormsPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Forms"
        tagline="Label, field, help or error. One recipe, one Save."
      />

      <Section title="Field" caption="label, control, help: 6px apart">
        <Field className="max-w-md">
          <FieldLabel htmlFor="lb-form-email">{s("Contact email")}</FieldLabel>
          <Input
            id="lb-form-email"
            type="email"
            dir="ltr"
            placeholder="hello@matjar.sa"
            aria-describedby="lb-form-email-help"
          />
          <FieldDescription id="lb-form-email-help">
            {s("Customers write here about their orders.")}
          </FieldDescription>
        </Field>
      </Section>

      <Section
        title="Floating label"
        caption="the auth forms: the label inside the box, up small on focus or once filled"
      >
        <FieldGroup className="max-w-md gap-3">
          <Input size="touch" floatingLabel={s("Name")} />
          <Input
            size="touch"
            floatingLabel={s("Contact email")}
            type="email"
            dir="ltr"
            placeholder="hello@matjar.sa"
            defaultValue="hello@matjar.sa"
          />
        </FieldGroup>
      </Section>

      <Section
        title="Error"
        caption="the fix, under the field; the border stays neutral"
      >
        <div className="max-w-md">
          <PhoneFieldDemo
            id="lb-form-phone"
            locale={locale}
            label={s("Contact phone")}
            countryLabelText={s("Country")}
            invalidText={s("Enter a valid mobile number.")}
            initial="+96650123"
            explain
          />
        </div>
      </Section>

      <Section
        title="Optional"
        caption="mark the minority, in the label; never an asterisk"
      >
        <Field className="max-w-md">
          <FieldLabel htmlFor="lb-form-compare" hint={s("(optional)")}>
            {s("Compare-at price")}
          </FieldLabel>
          <Input id="lb-form-compare" placeholder="199" />
        </Field>
      </Section>

      <Section
        title="Placeholders"
        caption="an example value, never an instruction"
      >
        <FieldGroup className="max-w-md">
          <FieldRow>
            <Field>
              <FieldLabel htmlFor="lb-form-first">{s("First name")}</FieldLabel>
              <Input id="lb-form-first" placeholder={s("Sara")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="lb-form-last">{s("Last name")}</FieldLabel>
              <Input id="lb-form-last" placeholder={s("Alqahtani")} />
            </Field>
          </FieldRow>
          <Field>
            <FieldLabel htmlFor="lb-form-code">
              {s("National address code")}
            </FieldLabel>
            <Input
              id="lb-form-code"
              dir="ltr"
              inputClassName="latin"
              placeholder="RRRD2929"
            />
          </Field>
        </FieldGroup>
      </Section>

      <Section
        title="Two-up and its collapse"
        caption="by the width of the group, not the screen"
        bare
      >
        <div className="flex flex-wrap items-start gap-6">
          <Card className="w-full max-w-lg">
            <CardContent>
              <FieldGroup>
                <FieldRow>
                  <Field>
                    <FieldLabel htmlFor="lb-form-a1">
                      {s("First name")}
                    </FieldLabel>
                    <Input id="lb-form-a1" placeholder={s("Sara")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lb-form-a2">
                      {s("Last name")}
                    </FieldLabel>
                    <Input id="lb-form-a2" placeholder={s("Alqahtani")} />
                  </Field>
                </FieldRow>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card className="w-64">
            <CardContent>
              <FieldGroup>
                <FieldRow>
                  <Field>
                    <FieldLabel htmlFor="lb-form-b1">
                      {s("First name")}
                    </FieldLabel>
                    <Input id="lb-form-b1" placeholder={s("Sara")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lb-form-b2">
                      {s("Last name")}
                    </FieldLabel>
                    <Input id="lb-form-b2" placeholder={s("Alqahtani")} />
                  </Field>
                </FieldRow>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        title="Three-up"
        caption="short numbers only; stays three across on a phone"
      >
        <FieldGroup className="max-w-md">
          <FieldRow columns={3}>
            <Field>
              <FieldLabel htmlFor="lb-form-l">{s("Length")}</FieldLabel>
              <Input
                id="lb-form-l"
                inputMode="decimal"
                dir="ltr"
                placeholder="30"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lb-form-w">{s("Width")}</FieldLabel>
              <Input
                id="lb-form-w"
                inputMode="decimal"
                dir="ltr"
                placeholder="20"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lb-form-h">{s("Height")}</FieldLabel>
              <Input
                id="lb-form-h"
                inputMode="decimal"
                dir="ltr"
                placeholder="10"
              />
            </Field>
          </FieldRow>
        </FieldGroup>
      </Section>

      <Section
        title="Fieldset"
        caption="a named group; past five fields, split"
      >
        <FieldSet className="max-w-md">
          <FieldLegend>{s("Analytics")}</FieldLegend>
          <FieldDescription>
            {s("Paste an id to measure your own visitors and ads.")}
          </FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="lb-form-ga4">
                Google Analytics (GA4)
              </FieldLabel>
              <Input
                id="lb-form-ga4"
                dir="ltr"
                inputClassName="latin"
                placeholder="G-XXXXXXXXXX"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </Section>

      <Section title="Switch row" caption="control and text on one axis">
        <Field orientation="horizontal" className="max-w-md">
          <Switch id="lb-form-track" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="lb-form-track">
              {s("Track inventory")}
            </FieldLabel>
            <FieldDescription>
              {s("Stop selling when it reaches zero.")}
            </FieldDescription>
          </FieldContent>
        </Field>
      </Section>

      <Section
        title="Where Save goes"
        caption="the bar's tail, only once it would save"
        bare
      >
        <FormCardDemo locale={locale} />
      </Section>
    </>
  );
}
