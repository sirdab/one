"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type ToggleVariantProps = {
  variant?: "chip" | "outline" | "filter";
  size?: VariantProps<typeof buttonVariants>["size"];
};

const FILTER_PRESSED =
  "duration-200 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-gray-alpha-800 data-[state=on]:active:bg-gray-alpha-700";

function toggleVariants({
  variant = "chip",
  size = "default",
  className,
}: ToggleVariantProps & { className?: string }): string {
  if (variant === "filter") {
    return cn(
      buttonVariants({ variant: "chip", size }),
      FILTER_PRESSED,
      className,
    );
  }
  return buttonVariants({ variant, size, className });
}

function Toggle({
  className,
  variant,
  size,
  hint,
  hintSide = "top",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  ToggleVariantProps & {
    hint?: React.ReactNode;
    hintSide?: React.ComponentProps<typeof TooltipContent>["side"];
  }) {
  const toggle = (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
  if (hint == null) return toggle;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{toggle}</span>
      </TooltipTrigger>
      <TooltipContent side={hintSide}>{hint}</TooltipContent>
    </Tooltip>
  );
}

export { Toggle, toggleVariants, type ToggleVariantProps };
