import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import { Separator } from "./separator";

/* The Sirdab item: a row that says what a thing is, what it holds now, and the
   one action that changes it (a settings row, an integration tile, a profile
   field). Taken from shadcn's `item` and trued.

       <Card>
           <ItemGroup>
               <Item>
                   <ItemContent>
                       <ItemTitle>Contact email</ItemTitle>
                       <ItemDescription>sara@example.com</ItemDescription>
                   </ItemContent>
                   <ItemActions><Button variant="secondary" size="xl">Change</Button></ItemActions>
               </Item>
               <ItemSeparator />
               <Item>…</Item>
           </ItemGroup>
       </Card>

   An ItemGroup straight inside a Card is the card's whole body, so a card of
   rows has no header unless the page needs one; the rows pad like a card part
   (24px from sm, 16px on a phone) and the separator between them is a
   hairline across the card, with none after the last (the card's edge closes
   the list). The action stays ON the row at 390 and never drops under the
   text: ItemContent gives (min-w-0, the description clamps) and ItemActions
   holds (shrink-0).

   VARIANTS. `default` is a row in a card. `outline` is a hairline tile
   (12px, `px-4 py-3`) for a thing inside a card's content; `muted` is the
   whisper well, for a recessed block. Neither is a shadow: depth is shown
   once, on the card (card.tsx).

   Titles are `text-body font-medium`, descriptions `text-body-quiet` in
   `text-muted-foreground`, at most two lines. A link row (asChild on an
   anchor) hovers with the row wash and takes the global focus outline; the
   stock ring and outline-none are gone. ItemGroup is not a `role="list"`:
   stock paired it with items that are not list items, which reads as an empty
   list to a screen reader. */
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-group"
      /* Straight inside a card the group clips to the card's corners, so
               a link row's hover wash does not square them off. */
      className={cn(
        "group/item-group flex flex-col [[data-slot=card]>&]:overflow-hidden [[data-slot=card]>&]:rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  "group/item flex items-center gap-4 text-body transition-colors duration-100 [a]:hover:bg-row-surface-hover",
  {
    variants: {
      variant: {
        default: "px-6 py-4 max-sm:px-4 max-sm:py-3.5",
        outline: "rounded-xl border border-border px-4 py-3",
        muted: "rounded-xl bg-surface-whisper px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Item({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      className={cn(itemVariants({ variant }), className)}
      {...props}
    />
  );
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-10 rounded-xl border border-border bg-card [&_svg:not([class*='size-'])]:size-5",
        image:
          "size-10 overflow-hidden rounded-lg [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
        className,
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "text-body flex w-fit items-center gap-2 font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "text-body-quiet text-muted-foreground line-clamp-2",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
};
