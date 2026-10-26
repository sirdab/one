import { SearchIcon } from "@sirdab/one/icons/catalogue";
import { ReceiptIcon, UserIcon } from "@sirdab/one/icons/general";
import {
  AiIcon,
  DiscountsIcon,
  ProductsIcon,
} from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@sirdab/one/components/dialog";
import { Icon } from "@sirdab/one/components/icon";
import { Kbd, KbdGroup } from "@sirdab/one/components/kbd";
import {
  Palette,
  PaletteEmpty,
  PaletteGroup,
  PaletteInput,
  PaletteItem,
  PaletteItemAvatar,
  PaletteItemIcon,
  PaletteItemImage,
  PaletteList,
} from "@sirdab/one/components/palette";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@sirdab/one/components/toggle-group";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* A flat "product photo" as an SVG data URI, so the recent row shows a real
   <img> in its tile without the package shipping a photograph. The fills
   are the demo photo's own colours, not tokens: a photo is content. */
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="#E9DFD3"/>` +
    `<path d="M30 30 L50 22 L70 30 L78 48 L68 52 L68 82 L32 82 L32 52 L22 48 Z" fill="#B08D6E"/></svg>`,
)}`;

/* Gallery page: prose and usage live in ./notes.md. */
export default async function PalettePage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  /* The palette as it opens: nothing typed, three verbs and the records
       the merchant opened last. The recents are the colourful rows: a
       product wears its own photo, an order and a customer an aurora face
       off their id. */
  const idle = (
    <>
      <PaletteEmpty>{s("No results.")}</PaletteEmpty>
      <PaletteGroup groupId="quick" heading={s("Quick actions")}>
        <PaletteItem
          value="create-product"
          title={s("Create product")}
          subtitle={s("Add a new product to your catalog")}
          leading={<PaletteItemIcon icon={ProductsIcon} />}
        />
        <PaletteItem
          value="create-discount"
          title={s("Create discount")}
          subtitle={s("A code your customers enter at checkout")}
          leading={<PaletteItemIcon icon={DiscountsIcon} />}
        />
        <PaletteItem
          value="create-order"
          title={s("Create order")}
          subtitle={s("A manual order for a phone or in-store sale")}
          enterLabel={s("Create")}
          leading={<PaletteItemIcon icon={ReceiptIcon} />}
        />
      </PaletteGroup>
      <PaletteGroup groupId="recent" heading={s("Recent")}>
        <PaletteItem
          value="recent-product"
          title={s("Cotton overshirt")}
          subtitle={s("Product")}
          leading={<PaletteItemImage src={PHOTO} />}
        />
        <PaletteItem
          value="recent-order"
          title="#1042"
          subtitle={s("Order · Pending")}
          leading={<PaletteItemAvatar seed="order-1042" icon={ReceiptIcon} />}
        />
        <PaletteItem
          value="recent-customer"
          title={s("Nourah Al-Harbi")}
          subtitle={s("Customer")}
          leading={<PaletteItemAvatar seed="customer-nourah" icon={UserIcon} />}
        />
      </PaletteGroup>
    </>
  );
  /* The palette answering a query: the store's own records, grouped. */
  const results = (
    <>
      <PaletteEmpty>{s("No results.")}</PaletteEmpty>
      <PaletteGroup groupId="products" heading={s("Products")}>
        <PaletteItem
          value="product-1"
          title={s("Cotton overshirt")}
          subtitle={s("In stock")}
          leading={<PaletteItemImage src={PHOTO} />}
        />
        <PaletteItem
          value="product-2"
          title={s("Linen trousers")}
          subtitle={s("Out of stock")}
          leading={<PaletteItemIcon icon={ProductsIcon} />}
        />
      </PaletteGroup>
      <PaletteGroup groupId="orders" heading={s("Orders")}>
        <PaletteItem
          value="order-1"
          title="#1042"
          subtitle={s("Nourah Al-Harbi")}
          leading={<PaletteItemIcon icon={ReceiptIcon} />}
        />
      </PaletteGroup>
      <PaletteGroup groupId="customers" heading={s("Customers")}>
        <PaletteItem
          value="customer-1"
          title={s("Nourah Al-Harbi")}
          subtitle="+966 55 000 0000"
          leading={<PaletteItemIcon icon={UserIcon} />}
        />
      </PaletteGroup>
    </>
  );

  return (
    <>
      <PageHeader
        title="Palette"
        tagline="The command palette, a launcher over the topbar."
      />

      <Section
        title="Launcher"
        caption="a fixed box 20vh down that never resizes with its results"
      >
        <Dialog>
          <DialogTrigger asChild>
            {/* The topbar's own trigger anatomy: a field-shaped
                            button with a plain magnifier, the word "Search"
                            (no ellipsis), and the chord as two keycaps. */}
            <Button
              variant="secondary"
              aria-label={s("Search")}
              className="w-shell-search text-muted-foreground justify-start"
            >
              <Icon icon={SearchIcon} />
              <span
                aria-hidden
                className="text-label text-muted-foreground min-w-0 flex-1 truncate text-start"
              >
                {s("Search")}
              </span>
              <KbdGroup aria-hidden dir="ltr" className="ms-auto">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
          </DialogTrigger>
          <DialogContent
            position="launcher"
            className="gap-0 overflow-hidden p-0"
          >
            <DialogTitle className="sr-only">{s("Search")}</DialogTitle>
            <DialogDescription className="sr-only">
              {s("Search across the store and jump to a page or action.")}
            </DialogDescription>
            <Palette openLabel={s("Open")}>
              <PaletteInput
                autoFocus
                aria-label={s("Search")}
                placeholder={s("Search orders, products, customers")}
                /* A phone has no Esc: Cancel is the way out
                                   of the full-screen launcher. */
                trailing={
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      className="min-w-11 shrink-0 md:hidden"
                    >
                      {s("Cancel")}
                    </Button>
                  </DialogClose>
                }
              />
              <PaletteList aria-label={s("Search")}>{idle}</PaletteList>
            </Palette>
          </DialogContent>
        </Dialog>
      </Section>

      <Section
        title="Idle"
        caption="nothing typed: the three quick actions, then what the merchant opened last"
      >
        <div className="h-shell-launcher w-shell-palette rounded-modal border-border bg-surface-modal flex max-w-full flex-col overflow-hidden border">
          <Palette openLabel={s("Open")}>
            <PaletteInput
              aria-label={s("Search")}
              placeholder={s("Search orders, products, customers")}
            />
            <PaletteList aria-label={s("Search")}>{idle}</PaletteList>
          </Palette>
        </div>
      </Section>

      <Section
        title="Results"
        caption="a query answered: every row a tile, a title and what it is"
      >
        <div className="h-shell-launcher w-shell-palette rounded-modal border-border bg-surface-modal flex max-w-full flex-col overflow-hidden border">
          <Palette openLabel={s("Open")}>
            <PaletteInput
              aria-label={s("Search")}
              placeholder={s("Search orders, products, customers")}
            />
            <PaletteList aria-label={s("Search")}>{results}</PaletteList>
          </Palette>
        </div>
      </Section>

      <Section
        title="Scopes and the top result"
        caption="a pressed chip narrows the search, the best answer sits alone on top and says what Enter does, the assistant is the last row"
      >
        <div className="h-shell-launcher w-shell-palette rounded-modal border-border bg-surface-modal flex max-w-full flex-col overflow-hidden border">
          <Palette openLabel={s("Open")} activeValue="top-customer">
            <PaletteInput
              aria-label={s("Search")}
              placeholder={s("Search orders, products, customers")}
            />
            <div className="px-4 pb-2">
              <ToggleGroup
                type="single"
                variant="filter"
                defaultValue="customers"
                aria-label={s("Where to search")}
              >
                <ToggleGroupItem value="orders">{s("Orders")}</ToggleGroupItem>
                <ToggleGroupItem value="products">
                  {s("Products")}
                </ToggleGroupItem>
                <ToggleGroupItem value="customers">
                  {s("Customers")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <PaletteList aria-label={s("Search")}>
              <PaletteGroup groupId="top" heading={s("Top result")}>
                <PaletteItem
                  value="top-customer"
                  title={s("Nourah Al-Harbi")}
                  subtitle={s("Customer")}
                  leading={<PaletteItemIcon icon={UserIcon} />}
                />
              </PaletteGroup>
              <PaletteGroup groupId="actions" heading={s("Actions")}>
                <PaletteItem
                  value="create-discount"
                  title={s("Create discount")}
                  subtitle={s("A code your customers enter at checkout")}
                  enterLabel={s("Create")}
                  leading={<PaletteItemIcon icon={DiscountsIcon} />}
                />
              </PaletteGroup>
              <PaletteGroup groupId="ask" heading={s("Not what you need?")}>
                <PaletteItem
                  value="ask"
                  title={s("Ask sirdab")}
                  subtitle={s("Sirdab picks it up from here")}
                  enterLabel={s("Ask")}
                  leading={<PaletteItemIcon icon={AiIcon} />}
                />
              </PaletteGroup>
            </PaletteList>
          </Palette>
        </div>
      </Section>
    </>
  );
}
