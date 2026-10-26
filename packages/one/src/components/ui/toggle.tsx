"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/* The Sirdab toggle: a button that stays pressed. Trued after the shadcn add
   by borrowing the button's own recipe rather than restating it, so a toggle
   and a button of the same variant and size are the same box, and a pressed
   toggle is the button's data-state="on" pairing that already exists (the
   chip darkens, outline takes its hover border). Radix owns aria-pressed and
   data-state, so no call site wires them by hand.

   Three variants: chip (the default, a quiet bordered pill for tool rows),
   outline, and filter. Filter is FilterChip's pressed state on a Button-sized
   chip: it inverts to full ink (the label goes background-on-foreground,
   hover lightens through the high alpha rungs) on the 200ms colour tier the
   filter chips run, so a pick among a few kinds (the palette's scope chips)
   is unmistakable on a phone, where chip's alpha-100 wash with a muted
   label was nearly invisible. It has no plus glyph: this is a pick-one,
   not an add. Pressed twice it clears, so "nothing pressed" can mean
   everything. Sizes are the button's. `hint` is the button's tooltip, on the
   same wrapper, for the icon-only toggles that need a name for the sighted
   too. className is for LAYOUT, as on Button.

   Usage:
       <Toggle size="icon" aria-label={t("flip")} hint={t("flip")}
               pressed={flipped} onPressedChange={setFlipped}>
           <Icon icon={FlipIcon} />
       </Toggle>
*/
type ToggleVariantProps = {
  variant?: "chip" | "outline" | "filter";
  size?: VariantProps<typeof buttonVariants>["size"];
};

/* FilterChip's pressed state (filter-chip.tsx), spelled once here: the ink
   border and fill, the label turned to the background, and the two alpha
   rungs the ink steps through on hover and press. Merged over the chip
   recipe, whose own pressed wash it replaces. */
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
    /** What this toggle does, on a tooltip (see Button's `hint`). */
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
  // A wrapper, as on Button: asChild would let the tooltip's data-state
  // clobber the toggle's "on".
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
