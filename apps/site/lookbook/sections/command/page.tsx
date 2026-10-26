import { StoreIcon } from "@sirdab/one/icons/general";
import {
  AiIcon,
  HomeIcon,
  ProductsIcon,
  WebsiteIcon,
} from "@sirdab/one/icons/shell";
import { ExternalLinkIcon } from "@sirdab/one/icons/system";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@sirdab/one/components/command";
import { Icon } from "@sirdab/one/components/icon";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function CommandPage({
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
  return (
    <>
      <PageHeader title="Command" tagline="The searchable menu." />

      <Section title="Inline" caption="long list, sticky header">
        <div className="border-border w-72 rounded-lg border">
          <Command>
            <CommandInput placeholder={s("Search…")} />
            <CommandList>
              <CommandEmpty>{s("No results.")}</CommandEmpty>
              <CommandGroup heading={s("Category")}>
                <CommandItem value={s("Apparel")}>{s("Apparel")}</CommandItem>
                <CommandItem value={s("Beauty")}>{s("Beauty")}</CommandItem>
                <CommandItem value={s("Electronics")}>
                  {s("Electronics")}
                </CommandItem>
                <CommandItem value={s("Perfumes")}>{s("Perfumes")}</CommandItem>
                {months.map((month) => (
                  <CommandItem key={month} value={month}>
                    {month}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem disabled value={s("Coming soon")}>
                  {s("Coming soon")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </Section>

      <Section title="Items with icons">
        <div className="border-border w-72 rounded-lg border">
          <Command>
            <CommandInput placeholder={s("Search…")} />
            <CommandList>
              <CommandEmpty>{s("No results.")}</CommandEmpty>
              <CommandGroup>
                <CommandItem value={s("Apparel")}>
                  <Icon icon={ProductsIcon} />
                  {s("Apparel")}
                </CommandItem>
                <CommandItem value={s("Beauty")}>
                  <Icon icon={AiIcon} />
                  {s("Beauty")}
                </CommandItem>
                <CommandItem value={s("Electronics")}>
                  <Icon icon={WebsiteIcon} />
                  {s("Electronics")}
                </CommandItem>
                <CommandItem value={s("Home & living")}>
                  <Icon icon={HomeIcon} />
                  {s("Home & living")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </Section>

      <Section title="In context" caption="a ⌘K panel">
        <div className="border-border shadow-popover-sm w-96 rounded-xl border">
          <Command>
            <CommandInput placeholder={s("Search everything…")} />
            <CommandList>
              <CommandEmpty>{s("No results.")}</CommandEmpty>
              <CommandGroup heading={s("Options")}>
                <CommandItem value={s("Add product")}>
                  <Icon icon={ProductsIcon} />
                  {s("Add product")}
                </CommandItem>
                <CommandItem value={s("New collection")}>
                  <Icon icon={AiIcon} />
                  {s("New collection")}
                </CommandItem>
                <CommandItem value={s("Generate store")}>
                  <Icon icon={StoreIcon} />
                  {s("Generate store")}
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading={s("Docs")}>
                <CommandItem value={s("View storefront")}>
                  <Icon icon={ExternalLinkIcon} />
                  {s("View storefront")}
                </CommandItem>
                <CommandItem value={s("Learn more")}>
                  <Icon icon={ExternalLinkIcon} />
                  {s("Learn more")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </Section>
    </>
  );
}
