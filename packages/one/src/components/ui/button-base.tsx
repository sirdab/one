"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import { LoaderIcon } from "../icons/general";
import { buttonVariants } from "./button-variants";

const SPINNER_COLOR: Record<string, string> = {
  default: "text-primary-foreground",
  destructive: "text-btn-destructive",
  chip: "text-muted-foreground",
};

/**
 * Button without the tooltip machinery (no disabledReason or hint), for
 * public pages that count every kilobyte. Same variants, sizes and loading
 * state as Button.
 */
function ButtonBase({
  className,
  variant = "default",
  size = "default",
  shape = "default",
  phone = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled}
      aria-disabled={(asChild && disabled) || undefined}
      className={cn(buttonVariants({ variant, size, shape, phone, className }))}
      {...props}
      onClick={
        loading || disabled
          ? (event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
            }
          : onClick
      }
    >
      {loading && !asChild ? (
        <>
          {children}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              SPINNER_COLOR[variant ?? "default"] ?? "text-foreground",
            )}
          >
            <LoaderIcon className="animate-spin" />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { ButtonBase };
