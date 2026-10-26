"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";

/* The Sirdab radio group. One choice out of a visible few: two to four
   options stack as control + label rows (past five it is a Select).
   Arrow keys move between options with roving focus, and Radix follows
   the direction provider, so RTL works untouched. The root is layout
   only: a vertical stack with the family's 12px row gap.

   Usage:
       <RadioGroup defaultValue="standard">
           <Label htmlFor="ship-std">
               <RadioGroupItem id="ship-std" value="standard" /> Standard
           </Label>
           <Label htmlFor="ship-exp">
               <RadioGroupItem id="ship-exp" value="express" /> Express
           </Label>
       </RadioGroup>
*/
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

/* The item: a 16px circle [interim; composed from the system's own
   input tokens] with the
   same chrome story as the checkbox, border-interactive hairline walking
   the FORM ladder (rest alpha-200, hover one rung deeper, gated to
   unchecked), and primary ink when checked, but as RING + DOT, never a
   fill: a filled circle reads as a checkbox at a glance. The dot is a
   plain 8px span (page-tone-free, solid primary), fading in at 100ms the
   way the select check does: always-rendered via forceMount
   with the opacity toggled by state, never a stroked icon snapped on
   mount. Disabled dims to 50%, the house number for every control that
   dims. The colour-swap alternative at full opacity
   is what our Buttons already do, and the chrome-light alternative is
   alpha text, a shape our text doctrine rules out (Arabic joins
   double-paint alpha). Focus is the global 2px ink
   focus-visible outline; the item renders a <button>, so it comes free. */
function RadioGroupItem({
  className,
  disabledReason,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  /** WHY this is unavailable, on a tooltip. Implies disabled, and
        keeps the control reachable so the reason can actually be read
        (see disabled-reason.tsx). */
  disabledReason?: React.ReactNode;
}) {
  const control = (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer border-border-interactive data-[state=checked]:border-primary hover:data-[state=unchecked]:border-input-border-hover-form aspect-square size-4 shrink-0 cursor-pointer rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        forceMount
        className="grid place-content-center"
      >
        <span className="bg-primary block size-2 rounded-full opacity-0 transition-opacity duration-100 in-data-[state=checked]:opacity-100" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );

  return withDisabledReason(control, disabledReason);
}

export { RadioGroup, RadioGroupItem };
