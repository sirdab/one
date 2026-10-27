"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import { LoaderIcon } from "../icons/general";
import { buttonVariants } from "./button-variants";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const SPINNER_COLOR: Record<string, string> = {
  default: "text-primary-foreground",
  destructive: "text-btn-destructive",
  chip: "text-muted-foreground",
};

function Button({
  className,
  variant = "default",
  size = "default",
  shape = "default",
  phone = "default",
  asChild = false,
  loading = false,
  disabled,
  disabledReason: givenReason,
  hint,
  hintSide = "top",
  concealed,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;

    disabledReason?: React.ReactNode;

    hint?: React.ReactNode;

    hintSide?: React.ComponentProps<typeof TooltipContent>["side"];

    concealed?: boolean;
  }) {
  const disabledReason = concealed ? undefined : givenReason;
  const Comp = asChild ? Slot.Root : "button";
  const explained = disabledReason != null;
  const isDisabled = disabled || explained;

  const ariaDisabled = asChild ? isDisabled : explained ? true : undefined;

  const pointerType = React.useRef<string>("");
  const [tapped, setTapped] = React.useState(false);
  if (!explained && tapped) setTapped(false);

  const button = (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}

      aria-busy={loading || undefined}

      disabled={asChild || explained ? undefined : disabled}
      aria-disabled={ariaDisabled || undefined}
      className={cn(
        buttonVariants({ variant, size, shape, phone, className }),

        explained && "aria-disabled:pointer-events-auto",
        concealed === true && "invisible",
        concealed === false &&
          "animate-in fade-in-0 zoom-in-75 duration-200 ease-out",
      )}
      inert={concealed || undefined}
      aria-hidden={concealed || undefined}
      {...props}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
        pointerType.current = event.pointerType;
        props.onPointerDown?.(event);
      }}
      onClick={
        loading || isDisabled
          ? (event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              if (
                explained &&
                !loading &&
                (pointerType.current === "touch" ||
                  pointerType.current === "pen")
              ) {
                setTapped(true);
              }
            }
          : props.onClick
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

  const tip = disabledReason ?? (concealed || disabled ? undefined : hint);
  if (tip == null) return button;

  return (
    <Tooltip
      open={tapped || undefined}
      onOpenChange={(next: boolean) => {
        if (!next) setTapped(false);
      }}
    >
      <TooltipTrigger asChild>
        <span className="inline-flex [&:has(>.w-full)]:w-full">{button}</span>
      </TooltipTrigger>
      <TooltipContent side={hintSide}>{tip}</TooltipContent>
    </Tooltip>
  );
}

export { Button, buttonVariants };
