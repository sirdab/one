import * as React from "react";

import { cn } from "../../lib/utils";

/* The Sirdab card: one raised plane for every page-level group (a form, a
   settings group, a detail section, a stat tile). It is lifted by
   `--shadow-card`, whose first layer is the hairline, so the card has no
   border to double it. Anything INSIDE a card is a hairline (`border
   border-border rounded-xl`, 12px, no shadow) or a whisper well: containment
   is shown once, nesting is semantic. A card never stacks two shadows, and
   never a shadow and a border. Popovers keep their own shadow, dialogs theirs.

   Anatomy, every part owning its own padding (24px from sm, 16px on a phone)
   so the container is a plain 16px plane:

       <Card>
           <CardHeader>
               <CardTitle>…</CardTitle>
               <CardDescription>…</CardDescription>
               <CardAction>…one secondary button, ghost icon or link…</CardAction>
           </CardHeader>
           <CardContent>…fields, gap-4…</CardContent>
           <Separator />
           <CardContent>…a second section…</CardContent>
           <CardFooter>…help at the start, secondary actions at the end…</CardFooter>
       </Card>

   CardHeader is a two-column grid: title and description in the first, the
   action in the second, on the END edge and top-aligned with the title (the
   same classes put it left in Arabic and right in English). A header that is
   the last thing in the card closes it with its own bottom padding; one that
   has content below hands that job to the content, which opens 16px under it.
   The Save is never a card action or a card footer button: a page has one
   Save, in the topbar tail, shown only once it would save.

   Sections inside one card are CardContent blocks divided by a `Separator`
   across the full card width, each opening with a `FieldLegend`. Past five
   fields, split into sections or into cards.

   `variant="outline"` is the hairline card, for the few places a card sits on
   a whisper well or inside another surface, or carries its own depth (the
   staged change's aurora ring). `raised` is accepted as an alias of the
   default so existing call sites keep working.

   `flat` drops the card from a breakpoint up: no plane, no padding, no header,
   just its content, for a side column whose fields stand on the page next to
   the raised cards. Below the breakpoint it is its variant.

   `lift` is for a card that is itself pressable, or that holds the one thing
   to press (home's launch cards), after Amboras: under the pointer it rises
   4px, overshooting a hair before it settles (the `card-lift` utility,
   foundation), and takes the deeper --shadow-card-hover; a press dips it
   further and shrinks it a touch. Never on a card that only
   groups fields. */
const CARD_VARIANT = {
  default: "shadow-card",
  outline: "border border-border",
  raised: "shadow-card",
} as const;

const CARD_FLAT = {
  lg: "lg:border-transparent lg:bg-transparent lg:shadow-none",
} as const;

type CardVariant = keyof typeof CARD_VARIANT;

const CARD_LIFT =
  "card-lift hover:-translate-y-1 hover:shadow-card-hover active:-translate-y-2 active:scale-98";

function Card({
  className,
  variant = "default",
  flat,
  lift = false,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: CardVariant;
  flat?: keyof typeof CARD_FLAT;
  lift?: boolean;
}) {
  /* The parts read the card off these data attributes through the card
       group rather than a React context: Card renders in server components,
       where context does not exist. */
  return (
    <div
      data-slot="card"
      data-variant={variant === "raised" ? "default" : variant}
      data-flat={flat}
      className={cn(
        "group/card bg-card rounded-2xl",
        CARD_VARIANT[variant],
        flat && CARD_FLAT[flat],
        lift && CARD_LIFT,
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      /* justify-between keeps the title column to its content and the
               action column to the end edge: the auto tracks would otherwise
               stretch equally and wrap the title at half the width. */
      className={cn(
        "grid items-start justify-between gap-x-4 px-6 pt-6 last:pb-6 max-sm:px-4 max-sm:pt-4 max-sm:last:pb-4 lg:group-data-[flat=lg]/card:hidden",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-heading-xs", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      /* The 4px under the title lives here, not in a grid row gap: a
               header without a description has no second row to pad. */
      className={cn(
        "text-body-quiet text-muted-foreground max-w-prose [[data-slot=card-title]+&]:mt-1",
        className,
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      /* Flat, the content drops all its inset: a flat group's fields sit
               on the column's own rhythm, so the gap between two groups is the
               gap between two fields. The pt-0 repeats the sibling rule's
               specificity, or the 16px under the (hidden) header would stay. */
      className={cn(
        "p-6 max-sm:p-4 lg:group-data-[flat=lg]/card:p-0 [[data-slot=card-header]+&]:pt-4 lg:group-data-[flat=lg]/card:[[data-slot=card-header]+&]:pt-0",
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "border-border flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t px-6 py-4 max-sm:px-4 max-sm:py-3 lg:group-data-[flat=lg]/card:border-t-0 lg:group-data-[flat=lg]/card:p-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};
