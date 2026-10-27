import { TagIcon } from "@sirdab/one/icons/general";
import {
  AiIcon,
  FilterIcon,
  HomeIcon,
  ManageIcon,
  ProductsIcon,
  WebsiteIcon,
} from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sirdab/one/components/dialog";
import { Icon } from "@sirdab/one/components/icon";
import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectLabelsProvider,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@sirdab/one/components/select";
import { Textarea } from "@sirdab/one/components/textarea";
import { sampler } from "../../../lookbook/components/samples";
import {
  PageHeader,
  Section,
  SpecimenLabel,
} from "../../../lookbook/components/section";
import { ComboboxDemo } from "../combobox/demo";

export default async function SelectPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  const months = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : locale, {
      month: "long",
    }).format(new Date(2026, i, 1)),
  );
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  const countries = [
    "SA",
    "AE",
    "KW",
    "QA",
    "BH",
    "OM",
    "JO",
    "EG",
    "MA",
    "TN",
    "LB",
    "IQ",
    "TR",
    "FR",
    "DE",
    "GB",
    "US",
    "CA",
    "IN",
    "PK",
  ].map((code) => ({ code, name: regions.of(code) ?? code }));
  const categories = (
    <SelectContent>
      <SelectItem value="apparel">{s("Apparel")}</SelectItem>
      <SelectItem value="beauty">{s("Beauty")}</SelectItem>
      <SelectItem value="electronics">{s("Electronics")}</SelectItem>
      <SelectItem value="home">{s("Home & living")}</SelectItem>
      <SelectItem value="perfumes">{s("Perfumes")}</SelectItem>
    </SelectContent>
  );
  return (
    <>
      <PageHeader title="Select" tagline="A field that discloses a menu." />

      <Section
        title="Field states"
        caption="the Input's chrome: the border deepens on hover, focus is the ink edge"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Select defaultValue="apparel">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              {categories}
            </Select>
            <SpecimenLabel>with value</SpecimenLabel>
          </div>
          <div className="flex flex-col gap-1.5">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={s("Choose a category")} />
              </SelectTrigger>
              {categories}
            </Select>
            <SpecimenLabel>placeholder</SpecimenLabel>
          </div>
          <div className="flex flex-col gap-1.5">
            <Select>
              <SelectTrigger
                className="w-full"
                closed={s("Select a language first")}
              >
                <SelectValue placeholder={s("Accent")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">{s("Apparel")}</SelectItem>
              </SelectContent>
            </Select>
            <SpecimenLabel>closed: the reason is the field</SpecimenLabel>
          </div>
          <div className="flex flex-col gap-1.5">
            <Select defaultValue="candles">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candles">
                  {s(
                    "Premium hand-poured soy candles and home fragrance gift sets",
                  )}
                </SelectItem>
                <SelectItem value="apparel">{s("Apparel")}</SelectItem>
              </SelectContent>
            </Select>
            <SpecimenLabel>long value: one line, ellipsis</SpecimenLabel>
          </div>
        </div>
      </Section>

      <Section
        title="In a form"
        caption="Input, Select and Textarea: one corner, one border, one focus"
      >
        <div className="flex max-w-md flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label htmlFor="lb-select-price">{s("Price")}</Label>
              <Input
                id="lb-select-price"
                dir="ltr"
                placeholder="199"
                inputClassName="latin tabular"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label htmlFor="lb-select-context">{s("Category")}</Label>
              <Select defaultValue="apparel">
                <SelectTrigger id="lb-select-context" className="w-full">
                  <SelectValue placeholder={s("Choose a category")} />
                </SelectTrigger>
                {categories}
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lb-select-notes">{s("Description")}</Label>
            <Textarea
              id="lb-select-notes"
              placeholder={s("Tell customers what makes this product special…")}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Field sizes"
        caption="36, 40 and 44: the Input's sizes, xl is the default"
      >
        <div className="flex flex-wrap items-end gap-4">
          {(["lg", "xl", "touch"] as const).map((size) => (
            <div key={size} className="flex flex-col gap-1.5">
              <Select defaultValue="apparel">
                <SelectTrigger size={size} className="w-40">
                  <SelectValue />
                </SelectTrigger>
                {categories}
              </Select>
              <SpecimenLabel>{size}</SpecimenLabel>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Variants"
        caption="a field on white, an outline field on the rail"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="apparel">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              {categories}
            </Select>
          </div>
          <div className="bg-surface-rail flex flex-wrap items-center gap-4 rounded-xl p-4">
            <Select defaultValue="apparel">
              <SelectTrigger variant="outline" className="w-40">
                <SelectValue />
              </SelectTrigger>
              {categories}
            </Select>
          </div>
        </div>
      </Section>

      <Section
        title="Toolbar flavour"
        caption="ghost, chip and 32 and below keep Button's chrome"
      >
        <div className="flex flex-wrap items-end gap-4">
          {(["secondary", "ghost", "chip"] as const).map((variant) => (
            <div key={variant} className="flex flex-col gap-1.5">
              <Select defaultValue="filter">
                <SelectTrigger variant={variant} size="default">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent tone={variant === "chip" ? "quiet" : undefined}>
                  <SelectItem value="filter">{s("Filter")}</SelectItem>
                  <SelectItem value="options">{s("Options")}</SelectItem>
                </SelectContent>
              </Select>
              <SpecimenLabel>{variant}</SpecimenLabel>
            </div>
          ))}
          {(["xs", "sm"] as const).map((size) => (
            <div key={size} className="flex flex-col gap-1.5">
              <Select defaultValue="filter">
                <SelectTrigger size={size}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filter">{s("Filter")}</SelectItem>
                  <SelectItem value="options">{s("Options")}</SelectItem>
                </SelectContent>
              </Select>
              <SpecimenLabel>{size}</SpecimenLabel>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Leading icon">
        <div className="flex flex-wrap items-center gap-4">
          <Select defaultValue="apparel">
            <SelectTrigger>
              <Icon icon={TagIcon} />
              <SelectValue />
            </SelectTrigger>
            {categories}
          </Select>
          <Select defaultValue="apparel">
            <SelectTrigger variant="chip">
              <Icon icon={TagIcon} />
              <SelectValue />
            </SelectTrigger>
            {categories}
          </Select>
        </div>
      </Section>

      <Section title="Without the chevron">
        <div className="flex items-center gap-4">
          <Select defaultValue="filter">
            <SelectTrigger
              variant="ghost"
              size="default"
              chevron={false}
              className="w-fit"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filter">{s("Filter")}</SelectItem>
              <SelectItem value="options">{s("Options")}</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="apparel">
            <SelectTrigger
              variant="ghost"
              size="icon"
              chevron={false}
              aria-label={s("Filter")}
            >
              <Icon icon={FilterIcon} />
            </SelectTrigger>
            {categories}
          </Select>
        </div>
      </Section>

      <Section title="Long lists" caption="scroll strips">
        <Select defaultValue={months[0]}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ maxHeight: "16rem" }}>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      <Section title="Items with icons">
        <Select defaultValue="apparel">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apparel">
              <Icon icon={ProductsIcon} />
              {s("Apparel")}
            </SelectItem>
            <SelectItem value="beauty">
              <Icon icon={AiIcon} />
              {s("Beauty")}
            </SelectItem>
            <SelectItem value="electronics">
              <Icon icon={WebsiteIcon} />
              {s("Electronics")}
            </SelectItem>
            <SelectItem value="home">
              <Icon icon={HomeIcon} />
              {s("Home & living")}
            </SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Section title="Row actions" caption="reveal on highlight">
        <Select defaultValue="apparel">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["apparel", "perfumes"] as const).map((value) => (
              <SelectItem
                key={value}
                value={value}
                action={
                  <Button variant="ghost" size="icon-xs" aria-label={s("Pin")}>
                    <Icon icon={ManageIcon} />
                  </Button>
                }
              >
                {s(value === "apparel" ? "Apparel" : "Perfumes")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      <Section title="Groups" caption="a label and a hairline">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lb-select-shipping">{s("Category")}</Label>
          <Select defaultValue="standard">
            <SelectTrigger id="lb-select-shipping">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{s("Category")}</SelectLabel>
                <SelectItem value="standard">
                  {s("Standard shipping · 2–4 days")}
                </SelectItem>
                <SelectItem value="express">
                  {s("Express shipping · next day")}
                </SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectItem value="sameday">{s("Same-day delivery")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section
        title="On a phone"
        caption="open at 390: below md a Select opens the house tray, titled with its label; inside a dialog it stays a popover"
      >
        <SelectLabelsProvider
          labels={{
            search: s("Search"),
            noMatches: s("Nothing by that name."),
            clear: s("Clear"),
            close: s("Close"),
          }}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Select defaultValue="active">
                <SelectTrigger className="w-full" aria-label={s("Status")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{s("Active")}</SelectItem>
                  <SelectItem value="draft">{s("Draft")}</SelectItem>
                  <SelectItem value="archived">{s("Archived")}</SelectItem>
                </SelectContent>
              </Select>
              <SpecimenLabel>
                a status: three rows, the check on the current
              </SpecimenLabel>
            </div>
            <div className="flex flex-col gap-1.5">
              <Select>
                <SelectTrigger className="w-full" aria-label={s("Country")}>
                  <SelectValue placeholder={s("Country")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SpecimenLabel>
                twenty rows: a search shows past twelve
              </SpecimenLabel>
            </div>
            <div className="flex flex-col gap-1.5">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">{s("Preview")}</Button>
                </DialogTrigger>
                <DialogContent closeLabel={s("Close")}>
                  <DialogHeader>
                    <DialogTitle>{s("Preview")}</DialogTitle>
                  </DialogHeader>
                  <Select defaultValue="active">
                    <SelectTrigger className="w-full" aria-label={s("Status")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{s("Active")}</SelectItem>
                      <SelectItem value="draft">{s("Draft")}</SelectItem>
                    </SelectContent>
                  </Select>
                </DialogContent>
              </Dialog>
              <SpecimenLabel>
                inside a dialog: the popover, never a panel over a panel
              </SpecimenLabel>
            </div>
          </div>
        </SelectLabelsProvider>
      </Section>

      <Section
        title="Searchable, several values"
        caption="the Combobox: the select's field, a Popover + Command panel"
      >
        <ComboboxDemo
          options={[
            { value: "apparel", label: s("Apparel") },
            { value: "beauty", label: s("Beauty") },
            { value: "electronics", label: s("Electronics") },
            { value: "home", label: s("Home & living") },
            { value: "perfumes", label: s("Perfumes") },
          ]}
          placeholder={s("Choose a category")}
          searchPlaceholder={s("Search…")}
          emptyLabel={s("No results.")}
          creatable={false}
        />
      </Section>
    </>
  );
}
