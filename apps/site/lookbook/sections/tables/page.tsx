import { formatPrice } from "@sirdab/one/foundation";

import { MoreIcon } from "@sirdab/one/icons/catalogue";
import { Badge } from "@sirdab/one/components/badge";
import { Button } from "@sirdab/one/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sirdab/one/components/dropdown-menu";
import { Icon } from "@sirdab/one/components/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
  TableRowLink,
  TableSortLink,
} from "@sirdab/one/components/table";
import { toNumeralLocale } from "../../../lookbook/components/numeral-locale";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

const PRODUCTS = [
  {
    name: "Leather tote bag",
    category: "Apparel",
    priceMinor: 24900,
    status: "Active",
  },
  {
    name: "Oud perfume",
    category: "Perfumes",
    priceMinor: 124950,
    status: "Active",
  },
  {
    name: "Scented candle",
    category: "Home & living",
    priceMinor: 4900,
    status: "Draft",
  },
  {
    name: "Linen summer dress",
    category: "Apparel",
    priceMinor: 18900,
    status: "Active",
  },
] as const;

export default async function TablesPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  const nl = toNumeralLocale(locale);
  return (
    <>
      <PageHeader title="Tables" tagline="A list of rows you can act on." />

      <Section
        title="Stacked records"
        caption="multiline cells grow with their contents; use explicit links"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{s("Product")}</TableHead>
              <TableHead>{s("Category")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell multiline>
                <div className="flex flex-col gap-2">
                  {PRODUCTS.slice(0, 3).map((product) => (
                    <span key={product.name}>{s(product.name)}</span>
                  ))}
                </div>
              </TableCell>
              <TableCell multiline>{s("Home & living")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>
      <Section
        title="Products"
        caption="rows open: hover the pill, click anywhere"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{s("Product")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {s("Category")}
              </TableHead>
              <TableHead numeric>{s("Price")}</TableHead>
              <TableHead>{s("Status")}</TableHead>
              <TableHead className="w-0">
                <span className="sr-only">{s("Options")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRODUCTS.map((product) => (
              <TableRow key={product.name} interactive>
                <TableCell>
                  <TableRowLink href="#">{s(product.name)}</TableRowLink>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-muted-foreground truncate">
                    {s(product.category)}
                  </span>
                </TableCell>
                <TableCell numeric className="latin">
                  {formatPrice(product.priceMinor, {
                    locale: nl,
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    tone={product.status === "Active" ? "success" : "attention"}
                  >
                    {s(product.status)}
                  </Badge>
                </TableCell>
                <TableCell className="w-0">
                  <TableRowActions>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={s("Options")}
                        >
                          <Icon icon={MoreIcon} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>{s("Edit name")}</DropdownMenuItem>
                        <DropdownMenuItem>{s("Duplicate")}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          {s("Delete product")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableRowActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        title="Display only"
        caption="nothing to open: no pointer, no pill"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{s("Product")}</TableHead>
              <TableHead numeric>{s("Price")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRODUCTS.slice(0, 3).map((product) => (
              <TableRow key={product.name}>
                <TableCell>{s(product.name)}</TableCell>
                <TableCell numeric className="latin">
                  {formatPrice(product.priceMinor, {
                    locale: nl,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        title="Sortable"
        caption="the sorted head shows its direction; idle heads show a hint on hover, always on touch"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sort="ascending">
                <TableSortLink asChild sort="ascending">
                  <a href="#">{s("Product")}</a>
                </TableSortLink>
              </TableHead>
              <TableHead sort="none">
                <TableSortLink asChild sort="none">
                  <a href="#">{s("Category")}</a>
                </TableSortLink>
              </TableHead>
              <TableHead numeric sort="none">
                <TableSortLink asChild sort="none">
                  <a href="#">{s("Price")}</a>
                </TableSortLink>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...PRODUCTS]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((product) => (
                <TableRow key={product.name}>
                  <TableCell>{s(product.name)}</TableCell>
                  <TableCell>{s(product.category)}</TableCell>
                  <TableCell numeric className="latin">
                    {formatPrice(product.priceMinor, {
                      locale: nl,
                    })}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Section>
    </>
  );
}
