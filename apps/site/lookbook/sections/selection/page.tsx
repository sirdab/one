import { Checkbox } from "@sirdab/one/components/checkbox";
import { Label } from "@sirdab/one/components/label";
import { RadioGroup, RadioGroupItem } from "@sirdab/one/components/radio-group";
import { Switch } from "@sirdab/one/components/switch";
import { sampler } from "../../../lookbook/components/samples";
import {
  PageHeader,
  Section,
  SpecimenLabel,
} from "../../../lookbook/components/section";

export default async function SelectionPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Selection"
        tagline="Switch is a state, Checkbox picks, Radio chooses one."
      />

      <Section
        title="Checkbox"
        caption="picks, includes or consents; saves with the form"
      >
        <div className="flex flex-col gap-3">
          <Label htmlFor="lb-gift">
            <Checkbox id="lb-gift" defaultChecked />
            {s("Include gift wrapping")}
          </Label>
          <Label htmlFor="lb-terms">
            <Checkbox id="lb-terms" />
            {s("I agree to the shipping terms")}
          </Label>
          <Label htmlFor="lb-off">
            <Checkbox id="lb-off" disabled />
            {s("Disabled option")}
          </Label>
        </div>
      </Section>

      <Section
        title="Select all"
        caption="some of the list: a minus, never a check"
      >
        <div className="border-border max-w-md rounded-xl border">
          <Label htmlFor="lb-list-all" className="border-border border-b p-3">
            <Checkbox id="lb-list-all" checked="indeterminate" />
            {s("Select all")}
          </Label>
          {(
            [
              ["lb-list-oud", "Oud perfume", true],
              ["lb-list-candle", "Scented candle", false],
              ["lb-list-dress", "Linen summer dress", false],
            ] as const
          ).map(([id, name, picked]) => (
            <Label
              key={id}
              htmlFor={id}
              className="not-last:border-border p-3 not-last:border-b"
            >
              <Checkbox id={id} defaultChecked={picked} />
              {s(name)}
            </Label>
          ))}
        </div>
      </Section>

      <Section title="Radio group" caption="one of a visible few">
        <RadioGroup defaultValue="standard" className="flex flex-col gap-3">
          <Label htmlFor="lb-standard">
            <RadioGroupItem id="lb-standard" value="standard" />
            {s("Standard shipping · 2–4 days")}
          </Label>
          <Label htmlFor="lb-express">
            <RadioGroupItem id="lb-express" value="express" />
            {s("Express shipping · next day")}
          </Label>
          <Label htmlFor="lb-sameday">
            <RadioGroupItem id="lb-sameday" value="sameday" disabled />
            {s("Same-day delivery")}
          </Label>
        </RadioGroup>
      </Section>

      <Section
        title="Switch"
        caption="a state of the thing, may save with its form"
      >
        <div className="flex flex-col gap-3">
          <Label htmlFor="lb-emails">
            <Switch id="lb-emails" />
            {s("New order emails")}
          </Label>
          <Label htmlFor="lb-publish">
            <Switch id="lb-publish" defaultChecked />
            {s("Store is live")}
          </Label>
          <Label htmlFor="lb-track">
            <Switch id="lb-track" defaultChecked />
            {s("Track inventory")}
          </Label>
        </div>
      </Section>

      <Section
        title="Off next to disabled"
        caption="off is a darker track you can turn on; disabled is dimmed"
      >
        <div className="flex flex-wrap items-start gap-8">
          {(
            [
              ["off", false, false],
              ["off, disabled", false, true],
              ["on", true, false],
              ["on, disabled", true, true],
            ] as const
          ).map(([name, checked, disabled]) => (
            <div key={name} className="flex flex-col items-start gap-2">
              <Switch
                aria-label={name}
                defaultChecked={checked}
                disabled={disabled}
              />
              <SpecimenLabel>{name}</SpecimenLabel>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Long label"
        caption="the control stays on the first line, in every script"
      >
        <div className="flex max-w-xs flex-col gap-4">
          <Label htmlFor="lb-long-check">
            <Checkbox id="lb-long-check" defaultChecked />
            {s(
              "Restock the items automatically when an order is refunded or cancelled, even if the product is hidden",
            )}
          </Label>
          <Label htmlFor="lb-long-switch">
            <Switch id="lb-long-switch" />
            {s(
              "Restock the items automatically when an order is refunded or cancelled, even if the product is hidden",
            )}
          </Label>
          <RadioGroup defaultValue="long">
            <Label htmlFor="lb-long-radio">
              <RadioGroupItem id="lb-long-radio" value="long" />
              {s(
                "Restock the items automatically when an order is refunded or cancelled, even if the product is hidden",
              )}
            </Label>
          </RadioGroup>
        </div>
      </Section>

      <Section title="In context" caption="a settings panel">
        <div className="border-border bg-card max-w-md rounded-xl border">
          <div className="border-border flex flex-col gap-3 border-b p-4">
            <SpecimenLabel>notifications</SpecimenLabel>
            <Label htmlFor="lb-panel-orders" className="justify-between">
              {s("New order emails")}
              <Switch id="lb-panel-orders" defaultChecked />
            </Label>
            <Label htmlFor="lb-panel-sms" className="justify-between">
              {s("SMS updates")}
              <Switch id="lb-panel-sms" />
            </Label>
          </div>
          <div className="border-border flex flex-col gap-3 border-b p-4">
            <SpecimenLabel>product</SpecimenLabel>
            <Label htmlFor="lb-panel-track" className="justify-between">
              {s("Track inventory")}
              <Switch id="lb-panel-track" defaultChecked />
            </Label>
            <Label htmlFor="lb-panel-vat" className="justify-between">
              {s("Charge VAT on this product")}
              <Switch id="lb-panel-vat" />
            </Label>
          </div>
          <div className="border-border flex flex-col gap-3 border-b p-4">
            <SpecimenLabel>order</SpecimenLabel>
            <Label htmlFor="lb-panel-gift">
              <Checkbox id="lb-panel-gift" defaultChecked />
              {s("Include gift wrapping")}
            </Label>
            <Label htmlFor="lb-panel-terms">
              <Checkbox id="lb-panel-terms" />
              {s("I agree to the shipping terms")}
            </Label>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <SpecimenLabel>shipping</SpecimenLabel>
            <RadioGroup defaultValue="standard" className="flex flex-col gap-3">
              <Label htmlFor="lb-panel-std">
                <RadioGroupItem id="lb-panel-std" value="standard" />
                {s("Standard shipping · 2–4 days")}
              </Label>
              <Label htmlFor="lb-panel-exp">
                <RadioGroupItem id="lb-panel-exp" value="express" />
                {s("Express shipping · next day")}
              </Label>
            </RadioGroup>
          </div>
        </div>
      </Section>
    </>
  );
}
