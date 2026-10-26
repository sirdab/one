"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab label: the third element of every form row. 14px medium in
   foreground (explicit, so it holds on tinted surfaces), normal role
   leading, never selectable. The field recipe: label → field → helper/error,
   6px stack gap, always wired with htmlFor.

   Flex + 6px gap supports the inline form: a control beside its text
   (checkbox / radio / switch rows). The disabled hooks are positional:
   peer-disabled needs the label AFTER its field; group-data-disabled needs
   a group wrapper. In the stacked recipe (label first) neither fires, and
   the field dims alone, which is the intended behaviour.

   display: flex makes the label block-level, so the whole row (including
   the space after the text) is clickable and focuses the field. DECISION:
   kept for the bigger hit target; inline-flex would hug the text. A row
   that wraps a control (checkbox / radio / switch) shows cursor-pointer
   across the whole row via has-[button], and not-allowed when that control
   is disabled; stacked form labels keep the default cursor.

   A CONTROL ROW (a checkbox, radio or switch as a direct child) is
   start-aligned [decision]: when the text wraps to a second line the control
   stays on the FIRST line, where the eye starts reading, instead of floating
   at the middle of the paragraph. The control gets a small top offset so it
   is centred on that first line: the line is 20px in Latin and 24px in
   Arabic (the Arabic leading floor), the box is 16 or 20, the switch 20, so
   the offset is per control and per script. On a touch screen a control row
   is at least 44px tall with its first line centred in that box (py-3), so a
   thumb always has the floor and a single line still looks centred. That
   touch padding is FIXED: its selector carries the :has() condition, so it
   outranks any padding a call site passes on the label itself, on touch. A
   form never patches pointer-coarse:min-h-11 or py-* onto its labels; a row
   that needs more room wraps the label in a container that carries the
   padding.

   Deliberately NOT variants (rejected as drift): cursor-pointer and
   gray-900 text on auth forms, an 8px gap for the wrapping-label case,
   and labels rendered as bare <p> tags. Ours stays a real <label>.

   REQUIRED-FIELD CONVENTION [decision]: mark the MINORITY, never with an
   asterisk (a status colour by the back door). In most forms required is
   the majority, so it goes unmarked and optional fields carry the
   localized "(اختياري)" / "(optional)" via `hint`. In a majority-optional
   form (settings, long editors) flip it: mark the required ones, as
   text, still never an asterisk. The caller passes the string either way;
   the primitive stays i18n-free.

   hint joins the ACCESSIBLE NAME: everything inside <label> is announced
   as part of the field's name. "Weight, optional" and "Weight, kg" read
   right; a sentence of context does not. Keep hint to a word or two
   (optional/required marker, units); anything longer is helper text below
   the field, wired with aria-describedby, not a second hint.

   Usage:
       <Label htmlFor="name">Product name</Label>
       <Label htmlFor="bio" hint={t("optional")}>Bio</Label>
       <Label htmlFor="live"><Switch id="live" /> Store is live</Label>
*/
/* Medium weight: the body role runs 400 in Arabic, which let a field's name
   read as quietly as its placeholder; Latin body is already 500.
   Stretch is the base so a STACKED label (flex-col: text over its field)
   lines its text up with the field's start edge; centring there parked the
   text mid-card. A label that sits BESIDE its control (a switch, checkbox or
   radio as a direct child) start-aligns the row instead, with the control
   on the first line (see CONTROL_ROW). */
/* The control row, in one place. The offsets are the first-line centring: a
   16px box (checkbox, radio) on a 20px line is 2px down, on Arabic's 24px
   line 4px; the checkbox is 20px on a touch screen (0 / 2px); the 20px
   switch is 0 / 2px. rtl: is the Arabic script knob (foundation.css keys
   its leading on [dir=rtl]). The touch floor is 44px with the first line
   centred in it. Written out in full: Tailwind reads class names, it does
   not run string builders. */
const CONTROL_ROW = [
  "has-[>:is([role=checkbox],[role=radio],[role=switch])]:items-start",
  "[&>[role=checkbox]]:mt-0.5 [&>[role=radio]]:mt-0.5",
  "rtl:[&>[role=checkbox]]:mt-1 rtl:[&>[role=radio]]:mt-1 rtl:[&>[role=switch]]:mt-0.5",
  "pointer-coarse:[&>[role=checkbox]]:mt-0 rtl:pointer-coarse:[&>[role=checkbox]]:mt-0.5",
  "pointer-coarse:has-[>:is([role=checkbox],[role=radio],[role=switch])]:min-h-11",
  "pointer-coarse:has-[>:is([role=checkbox],[role=radio],[role=switch])]:py-3",
].join(" ");

function Label({
  className,
  hint,
  stacked = false,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  hint?: React.ReactNode;
  /** The form-row recipe with the field INSIDE the label: text over its
        field, 6px apart, so no htmlFor/id pair is needed. */
  stacked?: boolean;
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-body flex items-stretch gap-1.5 font-medium text-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[button]:cursor-pointer has-[button:disabled]:cursor-not-allowed",
        CONTROL_ROW,
        stacked && "flex-col",
        className,
      )}
      {...props}
    >
      {children}
      {hint != null ? (
        <span className="text-caption-quiet text-muted-foreground">{hint}</span>
      ) : null}
    </LabelPrimitive.Root>
  );
}

export { Label };
