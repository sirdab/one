import { MoreIcon, PencilIcon } from "@sirdab/one/icons/catalogue";
import { CopyIcon, DeleteIcon } from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sirdab/one/components/dropdown-menu";
import { Icon } from "@sirdab/one/components/icon";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function DropdownMenuPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Dropdown menu"
        tagline="It does things: Edit, Duplicate, Delete."
      />

      <Section title="Row actions" caption="the ⋯ trigger">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={s("Options")}>
              <Icon icon={MoreIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem>
              <Icon icon={PencilIcon} />
              {s("Edit name")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon icon={CopyIcon} />
              {s("Duplicate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon icon={DeleteIcon} />
              {s("Delete product")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Marking a current choice" caption="static fill, no check">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">{s("Options")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>{s("Category")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value="apparel">
              <DropdownMenuRadioItem value="apparel">
                {s("Apparel")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="beauty">
                {s("Beauty")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="home">
                {s("Home")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="In context" caption="a list row">
        <div className="divide-border border-border max-w-md divide-y rounded-xl border">
          {(
            [
              { name: "Leather tote bag", meta: "Apparel" },
              { name: "New collection", meta: "Coming soon" },
            ] as const
          ).map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="flex flex-col">
                <p className="text-body text-foreground">{s(row.name)}</p>
                <p className="text-caption-quiet text-subtle">{s(row.meta)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={s("Options")}>
                    <Icon icon={MoreIcon} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Icon icon={PencilIcon} />
                    {s("Edit name")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon icon={CopyIcon} />
                    {s("Duplicate")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Icon icon={DeleteIcon} />
                    {s("Delete product")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
