import { FilterIcon } from "@sirdab/one/icons/shell";
import { Icon } from "@sirdab/one/components/icon";
import { Toggle } from "@sirdab/one/components/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@sirdab/one/components/toggle-group";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function TogglePage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Toggle"
        tagline="A button that stays pressed, and a row of them."
      />

      <Section title="Toggle" caption="chip, the button's own recipe">
        <div className="flex items-center gap-2">
          <Toggle>
            <Icon icon={FilterIcon} />
            {s("Filter")}
          </Toggle>
          <Toggle defaultPressed>
            <Icon icon={FilterIcon} />
            {s("Filter")}
          </Toggle>
          <Toggle size="icon" aria-label={s("Filter")} hint={s("Filter")}>
            <Icon icon={FilterIcon} />
          </Toggle>
          <Toggle variant="outline" defaultPressed>
            {s("Filter")}
          </Toggle>
        </div>
      </Section>

      <Section
        title="Pick one"
        caption='type="single" required: radios, arrow keys'
      >
        <ToggleGroup
          type="single"
          size="sm"
          required
          defaultValue="medium"
          aria-label={s("Options")}
        >
          <ToggleGroupItem value="small">{s("Small")}</ToggleGroupItem>
          <ToggleGroupItem value="medium">{s("Medium")}</ToggleGroupItem>
          <ToggleGroupItem value="large">{s("Large")}</ToggleGroupItem>
        </ToggleGroup>
      </Section>

      <Section
        title="Scope"
        caption='variant="filter": FilterChip&apos;s ink inversion, nothing pressed means everything'
      >
        <ToggleGroup
          type="single"
          variant="filter"
          defaultValue="customers"
          aria-label={s("Where to search")}
        >
          <ToggleGroupItem value="orders">{s("Orders")}</ToggleGroupItem>
          <ToggleGroupItem value="products">{s("Products")}</ToggleGroupItem>
          <ToggleGroupItem value="customers">{s("Customers")}</ToggleGroupItem>
        </ToggleGroup>
      </Section>
    </>
  );
}
