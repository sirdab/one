"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";

/* The Sirdab switch: a state of the thing. "Inventory tracked", "needs
   shipping", "code is active": the label names what is true when it is on.
   A switch is a state of the thing and may save with its form; a checkbox
   picks, includes or consents. The products page is the model: its
   switches save with the rest of the form, and a Checkbox there would be
   the wrong word for "this product is tracked".

   Geometry: 20x36 track with a 2px transparent border as the thumb's
   inset, a 16px thumb travelling 16px. There is one size: a second one had
   no screen to live on. A phone taps a 44px square around the 20px look
   (relative touch-target).

   The track: checked is foreground ink, the same ink a checked checkbox
   takes. Unchecked is gray-alpha-300 [decision], one rung darker than the
   input hairline, so OFF reads as a state you can turn on and not as a
   control you may not touch (the dimmed disabled switch sits right beside
   it in a list and must look different). On a mouse the off track deepens
   one rung to alpha-350 on hover, as every field does; touch has no hover,
   and a checked switch never shifts its ink. Everything runs at 150ms
   ease-in-out, NOT the controls' 75: a switch is a state change, not a
   colour tick, and nothing overshoots.

   The press detail: while held, the thumb STRETCHES 16 → 20px
   (group-active/switch:w-5), and the checked side pulls back 4px so the
   stretch always grows toward the middle of the track instead of
   overflowing the edge. RTL needs the SAME pullback, mirrored: the
   thumb's static flex anchor is the physical right edge there, so the
   pressed stretch grows leftward past the track edge unless the checked
   translate eases by 4px too (-translate-x-4 → -3).

   Thumb shadow: shadow-raised, the contact variant [decision], the family
   of a knob resting in a track. Disabled dims the whole control to 50%,
   matching the selection family. Keyboard focus is the global focus-visible
   outline; nothing here sets outline-none. RTL mirrors the travel through
   the rtl: overrides because translate-x has no logical variant.

   Usage:
       <Label htmlFor="live"><Switch id="live" /> Store is live</Label>
       <Switch aria-label="Weekly reports" />
*/
function Switch({
  className,
  disabledReason,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  /** WHY this is unavailable, on a tooltip. Implies disabled, and
        keeps the control reachable so the reason can actually be read
        (see disabled-reason.tsx). */
  disabledReason?: React.ReactNode;
}) {
  const control = (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch touch-target data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-alpha-300 hover:data-[state=unchecked]:bg-gray-alpha-350 relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "shadow-raised pointer-events-none block size-4 rounded-full bg-background transition-all duration-150 ease-in-out data-[state=unchecked]:translate-x-0",
          // 16px thumb, 16px travel. Pressed, the thumb stretches
          // 16 → 20 and the checked side pulls back 4px so the
          // stretch grows toward the track's middle, in BOTH
          // directions (RTL mirrors the pullback).
          "group-active/switch:w-5 data-[state=checked]:translate-x-4 group-active/switch:data-[state=checked]:translate-x-3 rtl:data-[state=checked]:-translate-x-4 rtl:group-active/switch:data-[state=checked]:-translate-x-3",
        )}
      />
    </SwitchPrimitive.Root>
  );

  return withDisabledReason(control, disabledReason);
}

export { Switch };
