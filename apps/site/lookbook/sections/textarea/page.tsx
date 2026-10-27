import { ArrowUpIcon } from "@sirdab/one/icons/general";
import { FilterIcon } from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import { Icon } from "@sirdab/one/components/icon";
import { Label } from "@sirdab/one/components/label";
import { Textarea } from "@sirdab/one/components/textarea";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function TextareaPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Textarea"
        tagline="The multiline sibling: no hover, grows from a 64px floor."
      />

      <Section title="States" caption="rest → focus, nothing between">
        <div className="flex max-w-md flex-col gap-3">
          <div className="flex items-center gap-4">
            <p className="text-caption-quiet text-subtle w-16 shrink-0">rest</p>
            <Textarea
              rows={2}
              placeholder={s("Tell customers what makes this product special…")}
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-caption-quiet text-subtle w-16 shrink-0">
              focus
            </p>
            <Textarea
              rows={2}
              placeholder={s("Tell customers what makes this product special…")}
              className="border-ring ring-input-focus"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-caption-quiet text-subtle w-16 shrink-0">
              disabled
            </p>
            <Textarea
              rows={2}
              disabled
              value={s("Leather tote bag")}
              readOnly
            />
          </div>
        </div>
      </Section>

      <Section title="Autogrow" caption="type: it expands from 64px">
        <Textarea
          aria-label={s("Description")}
          defaultValue={s("Tell customers what makes this product special…")}
          className="max-w-md"
        />
      </Section>

      <Section title="With a label" caption="the field recipe">
        <div className="flex max-w-md flex-col gap-1.5">
          <Label htmlFor="lb-ta-desc">{s("Description")}</Label>
          <Textarea
            id="lb-ta-desc"
            placeholder={s("Tell customers what makes this product special…")}
          />
          <p className="text-caption-quiet text-subtle">
            {s("Grows with content from a 64px floor.")}
          </p>
        </div>
      </Section>

      <Section title="Invalid" caption="text, never a border">
        <div className="flex max-w-md flex-col gap-1.5">
          <Label htmlFor="lb-ta-invalid">{s("Description")}</Label>
          <Textarea
            id="lb-ta-invalid"
            aria-invalid
            aria-describedby="lb-ta-invalid-err"
            placeholder={s("Tell customers what makes this product special…")}
          />
          <p id="lb-ta-invalid-err" className="text-caption text-destructive">
            {s("Description is required.")}
          </p>
        </div>
      </Section>

      <Section title="The composer" caption="bare mode, panel owns the chrome">
        <div className="border-border bg-card max-w-2xl rounded-2xl border">
          <div className="relative">
            <Textarea
              bare
              rows={4}
              maxLength={5000}
              aria-label={s("Store prompt")}
              placeholder={s(
                "Describe your store: what you sell, who it's for, the vibe…",
              )}
              className="p-4"
            />
            <div className="to-card pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b from-transparent" />
          </div>
          <div className="border-border flex items-center justify-between gap-2 border-t p-2">
            <Button variant="chip">
              <Icon icon={FilterIcon} />
              {s("Perfumes")}
            </Button>
            <Button>
              <Icon icon={ArrowUpIcon} />
              {s("Generate store")}
            </Button>
          </div>
        </div>
      </Section>

      <Section title="In context" caption="an edit form">
        <div className="flex max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lb-ta-edit">{s("Description")}</Label>
            <Textarea
              id="lb-ta-edit"
              defaultValue={s(
                "Tell customers what makes this product special…",
              )}
            />
            <p className="text-caption-quiet text-subtle">
              {s("Shown on your storefront and receipts.")}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost">{s("Cancel")}</Button>
            <Button>{s("Save changes")}</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
