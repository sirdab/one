import { Button } from "@sirdab/one/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sirdab/one/components/dialog";
import { Field, FieldLabel } from "@sirdab/one/components/field";
import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sirdab/one/components/select";
import { Textarea } from "@sirdab/one/components/textarea";
import { DialogFormDemo } from "../../../lookbook/components/dialog-form-demo";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function DialogPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader title="Dialog" tagline="The blocking layer." />

      <Section
        title="Form dialog"
        caption="Save arrives once the draft would save"
      >
        <DialogFormDemo locale={locale} />
      </Section>

      <Section title="Bigger form">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">{s("New product")}</Button>
          </DialogTrigger>
          <DialogContent closeLabel={s("Close")}>
            <DialogHeader>
              <DialogTitle>{s("New product")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="dlg-p-name">{s("Name")}</FieldLabel>
                <Input id="dlg-p-name" size="md" />
              </Field>
              <div className="flex items-end gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="dlg-p-price">{s("Price")}</Label>
                  <Input
                    id="dlg-p-price"
                    size="md"
                    dir="ltr"
                    inputClassName="latin tabular"
                  />
                </div>
                <Select defaultValue="apparel">
                  <SelectTrigger size="lg" aria-label={s("Category")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apparel">{s("Apparel")}</SelectItem>
                    <SelectItem value="beauty">{s("Beauty")}</SelectItem>
                    <SelectItem value="home">{s("Home")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field>
                <FieldLabel htmlFor="dlg-p-desc">{s("Description")}</FieldLabel>
                <Textarea id="dlg-p-desc" rows={3} />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="ghost">{s("Cancel")}</Button>
              <Button>{s("Save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Confirmation" caption="primary verb, never a red fill">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">{s("Delete product")}</Button>
          </DialogTrigger>
          <DialogContent closeLabel={s("Close")}>
            <DialogHeader>
              <DialogTitle>{s("Delete product")}</DialogTitle>
              <DialogDescription>
                {s(
                  "This removes the product from your storefront. Orders keep their history.",
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost">{s("Cancel")}</Button>
              <Button>{s("Delete product")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>
    </>
  );
}
