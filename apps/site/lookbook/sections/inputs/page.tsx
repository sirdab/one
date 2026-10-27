import * as React from "react";

import {
  PreviewIcon,
  SearchIcon,
  UploadIcon,
} from "@sirdab/one/icons/catalogue";
import { CopyIcon } from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import { Icon } from "@sirdab/one/components/icon";
import { Input } from "@sirdab/one/components/input";
import { Kbd } from "@sirdab/one/components/kbd";
import { Label } from "@sirdab/one/components/label";
import { Textarea } from "@sirdab/one/components/textarea";
import { DigitInputDemo } from "../../../lookbook/components/digit-input-demo";
import { sampler } from "../../../lookbook/components/samples";
import {
  PageHeader,
  Section,
  SpecimenLabel,
} from "../../../lookbook/components/section";

type InputSize = React.ComponentProps<typeof Input>["size"];

const SIZES: {
  size: InputSize;
  label: string;
  hover: string;
}[] = [
  { size: "sm", label: "sm · 32", hover: "border-input-border-hover" },
  {
    size: "md",
    label: "md · 36",
    hover: "border-input-border-hover",
  },
  {
    size: "default",
    label: "default · 40",
    hover: "border-input-border-hover",
  },
  {
    size: "search",
    label: "search · 40",
    hover: "border-input-border-hover",
  },
  {
    size: "touch",
    label: "touch · 44",
    hover: "border-input-border-hover",
  },
];

const COLUMNS = ["rest", "hover", "focus", "disabled"] as const;

export default async function InputsPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Inputs"
        tagline="Composite fields: the wrapper owns the chrome."
      />

      <Section title="State matrix" caption="sizes × states, live cells">
        <div className="overflow-x-auto p-1">
          <div
            className="grid min-w-2xl items-center gap-x-4 gap-y-3"

            style={{ gridTemplateColumns: "6rem repeat(4, 1fr)" }}
          >
            <div />
            {COLUMNS.map((column) => (
              <p
                key={column}
                className="text-caption-quiet text-subtle text-center uppercase"
              >
                {column}
              </p>
            ))}
            {SIZES.map((row) => (
              <React.Fragment key={row.label}>
                <p className="text-caption-quiet text-subtle">{row.label}</p>
                <Input
                  size={row.size}
                  leading={<Icon icon={SearchIcon} />}
                  placeholder={s("Search…")}
                />
                <Input
                  size={row.size}
                  leading={<Icon icon={SearchIcon} />}
                  placeholder={s("Search…")}
                  className={row.hover}
                />
                <Input
                  size={row.size}
                  leading={<Icon icon={SearchIcon} />}
                  placeholder={s("Search…")}
                  className="border-ring ring-input-focus"
                />
                <Input
                  size={row.size}
                  leading={<Icon icon={SearchIcon} />}
                  disabled
                  value="sirdab-store"
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Invalid" caption="text, never a border">
        <div className="flex max-w-md flex-col gap-1.5">
          <Label htmlFor="lb-price">{s("Price")}</Label>
          <Input
            id="lb-price"
            aria-invalid
            defaultValue="-20"
            aria-describedby="lb-price-err"
            dir="ltr"
            inputClassName="latin tabular"
          />
          <p id="lb-price-err" className="text-caption text-destructive">
            {s("Price must be zero or more.")}
          </p>
        </div>
      </Section>

      <Section title="Compositions" caption="one box, shared by all of it">
        <div className="flex max-w-md flex-col gap-4">
          <Input
            size="search"
            leading={<Icon icon={SearchIcon} />}
            placeholder={s("Search library voices…")}
            trailing={
              <Button
                variant="ghost"
                size="icon"
                aria-label={s("Search with a file")}
              >
                <Icon icon={UploadIcon} />
              </Button>
            }
          />
          <Input
            size="search"
            leading={<Icon icon={SearchIcon} />}
            loading
            placeholder={s("Searching…")}
          />
          <Input
            readOnly
            value="sk_live_9f2m…c41a"
            dir="ltr"
            aria-label={s("API key")}
            inputClassName="latin tabular"
            trailing={
              <Button
                variant="ghost"
                size="icon"
                aria-label={s("Copy API key")}
              >
                <Icon icon={CopyIcon} />
              </Button>
            }
          />
          <Input
            type="password"
            defaultValue="hunter2222"
            trailing={
              <Button
                variant="ghost"
                size="icon"
                aria-label={s("Show password")}
              >
                <Icon icon={PreviewIcon} />
              </Button>
            }
          />
        </div>
      </Section>

      <Section title="The field recipe" caption="label · field · helper">
        <div className="flex max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lb-name">{s("Product name")}</Label>
            <Input id="lb-name" placeholder={s("Leather tote bag")} />
            <p className="text-caption-quiet text-subtle">
              {s("Shown on your storefront and receipts.")}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lb-desc">{s("Description")}</Label>
            <Textarea
              id="lb-desc"
              placeholder={s("Tell customers what makes this product special…")}
            />
            <p className="text-caption-quiet text-subtle">
              {s("Grows with content from a 64px floor.")}
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Numbers in fields"
        caption="type ٢٤٩, watch the stored value"
      >
        <DigitInputDemo placeholder={s("Type ٢٤٩ or 249: order number")} />
      </Section>

      <Section title="Search trigger" caption="a button dressed as an input">
        <Button
          variant="secondary"
          className="text-muted-foreground w-64 justify-between"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon icon={SearchIcon} />
            <span className="text-body-quiet truncate">
              {s("Search everything…")}
            </span>
          </span>
          <span className="flex shrink-0 gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </Button>
      </Section>

      <Section
        title="Search trigger, collapsed"
        caption="when the row squeezes"
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>keys only</SpecimenLabel>
            <Button
              variant="secondary"
              size="sm"
              aria-label={s("Search everything…")}
            >
              <span className="flex shrink-0 gap-1">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
            </Button>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>icon only</SpecimenLabel>
            <Button
              variant="secondary"
              size="icon"
              aria-label={s("Search everything…")}
            >
              <Icon icon={SearchIcon} />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="In context" caption="a product form">
        <div className="flex max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lb-form-name">{s("Product name")}</Label>
            <Input id="lb-form-name" placeholder={s("Leather tote bag")} />
            <p className="text-caption-quiet text-subtle">
              {s("Shown on your storefront and receipts.")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lb-form-price">{s("Price")}</Label>
              <Input
                id="lb-form-price"
                aria-invalid
                defaultValue="-20"
                aria-describedby="lb-form-price-err"
                dir="ltr"
                inputClassName="latin tabular"
              />
              <p
                id="lb-form-price-err"
                className="text-caption text-destructive"
              >
                {s("Price must be zero or more.")}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lb-form-compare" hint={s("(optional)")}>
                {s("Compare-at price")}
              </Label>
              <Input
                id="lb-form-compare"
                placeholder="199"
                dir="ltr"
                inputClassName="latin tabular"
              />
            </div>
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
