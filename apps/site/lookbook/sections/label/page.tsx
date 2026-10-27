import { Checkbox } from "@sirdab/one/components/checkbox";
import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";
import { Switch } from "@sirdab/one/components/switch";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function LabelPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Label"
        tagline="The third element of every form row."
      />

      <Section title="Stacked" caption="6px above the field">
        <div className="flex max-w-md flex-col gap-1.5">
          <Label htmlFor="lb-lbl-stacked">{s("Product name")}</Label>
          <Input id="lb-lbl-stacked" placeholder={s("Leather tote bag")} />
        </div>
      </Section>

      <Section title="Inline" caption="control inside the label">
        <div className="flex max-w-md flex-col gap-3">
          <Label htmlFor="lb-lbl-switch">
            <Switch id="lb-lbl-switch" defaultChecked />
            {s("Store is live")}
          </Label>
          <Label htmlFor="lb-lbl-check">
            <Checkbox id="lb-lbl-check" />
            {s("Include gift wrapping")}
          </Label>
        </div>
      </Section>

      <Section title="Long label" caption="the control stays on the first line">
        <div className="flex max-w-xs flex-col gap-4">
          <Label htmlFor="lb-lbl-long-check">
            <Checkbox id="lb-lbl-long-check" defaultChecked />
            {s(
              "Restock the items automatically when an order is refunded or cancelled, even if the product is hidden",
            )}
          </Label>
          <Label htmlFor="lb-lbl-long-switch">
            <Switch id="lb-lbl-long-switch" />
            {s(
              "Restock the items automatically when an order is refunded or cancelled, even if the product is hidden",
            )}
          </Label>
        </div>
      </Section>

      <Section title="Optional fields" caption="mark the minority">
        <div className="flex max-w-md flex-col gap-1.5">
          <Label htmlFor="lb-lbl-optional" hint={s("(optional)")}>
            {s("Compare-at price")}
          </Label>
          <Input id="lb-lbl-optional" placeholder="199" />
        </div>
      </Section>

      <Section title="Disabled pairing" caption="label after its field">
        <div className="flex items-center gap-1.5">
          <Input
            id="lb-lbl-after"
            disabled
            value="sirdab-store"
            readOnly
            size="sm"
            className="peer max-w-32"
          />
          <Label htmlFor="lb-lbl-after">{s("Store handle")}</Label>
        </div>
      </Section>

      <Section title="Disabled via a group" caption="data-disabled wrapper">
        <div
          className="group flex max-w-md flex-col gap-1.5"
          data-disabled="true"
        >
          <Label htmlFor="lb-lbl-group">{s("Product name")}</Label>
          <Input
            id="lb-lbl-group"
            disabled
            value={s("Leather tote bag")}
            readOnly
          />
        </div>
      </Section>

      <Section title="In context" caption="settings rows">
        <div className="border-border bg-card max-w-md rounded-xl border">
          <Label
            htmlFor="lb-lbl-row-live"
            className="border-border justify-between border-b p-4"
          >
            {s("Store is live")}
            <Switch id="lb-lbl-row-live" defaultChecked />
          </Label>
          <Label
            htmlFor="lb-lbl-row-emails"
            className="border-border justify-between border-b p-4"
          >
            {s("New order emails")}
            <Switch id="lb-lbl-row-emails" />
          </Label>
          <Label htmlFor="lb-lbl-row-track" className="justify-between p-4">
            {s("Include gift wrapping")}
            <Checkbox id="lb-lbl-row-track" defaultChecked />
          </Label>
        </div>
      </Section>
    </>
  );
}
