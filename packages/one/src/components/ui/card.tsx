import * as React from "react";

import { cn } from "../../lib/utils";

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
