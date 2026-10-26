"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { CheckIcon } from "../icons/catalogue";
import { MinusIcon } from "../icons/general";
import { refusalProps, withDisabledReason } from "./disabled-reason";

/* The Sirdab checkbox. A checkbox picks, includes or consents: list
   selections, options, agreements. A state of the thing ("tracked",
   "active") is a Switch; one choice out of a few is a RadioGroup.

   Chrome: a 16px box with a 1px border-interactive border (the retained
   alias of --input, the input hairline) and a radius-xs corner. On a touch
   screen the box is 20px with a radius-sm (6px) corner [decision]: the
   nearest on-scale corner to the same proportion, and the size a thumb can
   see in a list. A 44px tap box (relative touch-target) surrounds it
   either way, so the look is the box and the target is the finger. The
   border walks the FORM ladder: rest alpha-200, hover one rung deeper
   (input-border-hover-form, alpha-300), gated to unchecked so the ink
   checked state is untouched. Checked steps border and fill to primary
   ink and the glyph goes primary-foreground, the same ink a switched-on
   Switch takes.

   The glyphs are drawn in a 14px box (18 on touch) at stroke 3, which
   renders the tick at 1.75px (2.25px on touch). At 12px and a 1px stroke
   it read grey at 2x; at this weight it reads black. They are never
   mirrored, in RTL either: a check has no direction.

   Checking it lands: the box fills over 150ms ease-out while the glyph
   fades in and grows from 75%, so the tick reads as landing rather than
   appearing, and nothing overshoots. Always-rendered with opacity and
   scale toggled by state: Radix mounts the Indicator per state, so the
   motion needs forceMount plus in-data toggles on the glyphs. Reduced
   motion snaps.

   Indeterminate is the third real state, not a hidden one: same ink fill,
   a minus glyph. Without an explicit style Radix would show the CHECK for
   it, which is the one signal a tri-state must never send. It is for a
   select-all that stands for some of a list; a click on it checks.

   Disabled dims to 50%, the Radix convention and the house number for
   every control that dims. Focus is the global 2px ink focus-visible
   outline: the root renders a <button>, so it comes free, and nothing
   here may set outline-none or keyboard focus disappears.

   Wire it through Label's inline form: wrap the control in the label,
   never sibling the two with a hand-rolled flex row.

   Usage:
       <Label htmlFor="vat">
           <Checkbox id="vat" defaultChecked /> Charge VAT on this product
       </Label>
       <Label htmlFor="terms">
           <Checkbox id="terms" required /> I agree to the terms
       </Label>
       <Checkbox checked="indeterminate" aria-label="Select all" />
*/
/* The box and its states, shared by the control and by CheckboxMark so a
   list row's tick can never drift from a form's. */
const CHECKBOX_BOX =
  "size-4 shrink-0 rounded-xs border border-border-interactive transition-colors duration-150 ease-out pointer-coarse:size-5 pointer-coarse:rounded-sm motion-reduce:transition-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground";

/* The glyph box: 14px, 18 on touch. Each glyph fills it and lands by easing
   in from 75%; whichever state is not the current one stays at zero. */
const GLYPH_BOX = "relative block size-3.5 pointer-coarse:size-4.5";
const GLYPH =
  "absolute inset-0 size-full scale-75 opacity-0 transition duration-150 ease-out motion-reduce:transition-none";

function Checkbox({
  className,
  disabledReason,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** WHY this is unavailable, on a tooltip. Implies disabled, and
        keeps the control reachable so the reason can actually be read
        (see disabled-reason.tsx). */
  disabledReason?: React.ReactNode;
}) {
  const control = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        CHECKBOX_BOX,
        "peer touch-target hover:data-[state=unchecked]:border-input-border-hover-form relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        forceMount
        className="grid place-content-center text-current"
      >
        <span className={GLYPH_BOX}>
          <CheckIcon
            strokeWidth={3}
            className={cn(
              GLYPH,
              "in-data-[state=checked]:scale-100 in-data-[state=checked]:opacity-100",
            )}
          />
          <MinusIcon
            strokeWidth={3}
            className={cn(
              GLYPH,
              "in-data-[state=indeterminate]:scale-100 in-data-[state=indeterminate]:opacity-100",
            )}
          />
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  return withDisabledReason(control, disabledReason);
}

/* The checkbox's look without the control: for a row that is itself the
   control (a multi-select menu item), where a nested <button> would be a
   second tab stop and invalid inside the row's own role. Decorative; the
   row carries aria-checked. "indeterminate" draws the minus, never the
   check, exactly as the control does. */
function CheckboxMark({
  checked,
  className,
}: {
  checked: boolean | "indeterminate";
  className?: string;
}): React.JSX.Element {
  const state =
    checked === "indeterminate"
      ? "indeterminate"
      : checked
        ? "checked"
        : "unchecked";
  return (
    <span
      aria-hidden
      data-slot="checkbox-mark"
      data-state={state}
      className={cn("grid place-content-center", CHECKBOX_BOX, className)}
    >
      <span className={GLYPH_BOX}>
        <CheckIcon
          strokeWidth={3}
          className={cn(
            GLYPH,
            "in-data-[state=checked]:scale-100 in-data-[state=checked]:opacity-100",
          )}
        />
        <MinusIcon
          strokeWidth={3}
          className={cn(
            GLYPH,
            "in-data-[state=indeterminate]:scale-100 in-data-[state=indeterminate]:opacity-100",
          )}
        />
      </span>
    </span>
  );
}

export { Checkbox, CheckboxMark };
