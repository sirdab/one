"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { LoaderIcon } from "../icons/general";
import { CloseIcon } from "../icons/shell";
import { Button } from "./button";
import { refusalProps, withDisabledReason } from "./disabled-reason";
import {
  FIELD_BORDER,
  FIELD_FOCUS_WITHIN,
  FIELD_HEIGHT,
  FIELD_RADIUS,
  FIELD_VALUE,
  type FieldSize,
} from "./field-chrome";

/* The Sirdab input. Composite: the wrapper owns the chrome (border, radius,
   focus), the <input> inside is bare, which is what lets a leading icon,
   the field, and a trailing button share one bordered box.

   Chrome: rest border alpha-200 → hover alpha-400 (every size) →
   focus-within ink border +
   0.5px ink ring (~1.5px of ink total, deliberately not the global 2px
   outline). Placeholder and leading icon are subtle; the icon lights to
   foreground with the field, so it focuses as a unit. Type is 16px on
   touch widths (no iOS zoom) and 14px from sm up, regular weight.

   Disabled fields DIM (opacity), unlike buttons' solid pair: two
   deliberate patterns, one per family; do not unify them. Pointer events stay on so
   the not-allowed cursor reads and a trailing button can stay live.

   The loading spinner is a TRAILING SLOT MEMBER (a 32px centered box, like
   an icon button), not an overlay, so spinner and trailing icons align in
   one column across stacked inputs.

   TWO leading slots, because they are two different things. `leading` is
   the ICON gutter: quieted at rest, lighting with focus, dimmed when the
   field is. `leadingControl` is a live CONTROL sharing the box (the phone
   field's country select) and must never be quieted: it owns its own
   hover and press ladder, and dimming it would say it is not pressable.
   It mirrors the trailing slot's snug padding (ps-1 against pe-1) so a
   32px control lands 4+32+4 inside the 40px box.

   readOnly is a DECISION, not disabled: the field stays focusable and
   copyable (focus ring intact) but loses the hover affordance. Hover
   promises editability. Pair it with a trailing copy button.

   Disabled dims the input and leading icon only: the trailing slot stays
   at full opacity because it stays LIVE (a copy button next to a disabled
   field still works); dimming it would say otherwise. The hairline border
   stays undimmed too.

   The inner field is data-slot="input-field", NOT "input": shadcn's slot
   name would put the bridge's standalone-input padding on our bare field
   (it double-padded to 23px once; 12px is the spec).

   INVALID NEVER COLOURS THE BORDER. Errors are destructive TEXT under the
   field; the chrome stays neutral.
   Error text is text-caption + text-destructive, and KEEPS the medium
   weight [decision]: with neutral chrome the text carries the entire
   error signal, so it stays emphatic while other captions dropped to the
   400 quiet role.

   Sizes: sm 32 dense rows · md 36 compact forms · default 40 forms
   (rounded-xl: the 40px rung is the house default [decision]) ·
   search 40 · touch 44 auth/mobile. Every size hovers alpha-400.

   FLOATING LABEL (`floatingLabel`), the Material outlined field: the label
   sits inside the box where a placeholder would, and on focus or once there
   is a value it shrinks onto the top border, which breaks around it, so a
   filled form still says which box is which without a label row over every
   field and the box keeps its height. The break is the label's own fill,
   bg-card, so the field must sit on a card-coloured surface (the auth card,
   a settings card). A placeholder still works, as an example: it only shows
   while the field is focused and empty. Pure CSS (peer +
   :placeholder-shown), so a value set by autofill or a parent floats the
   label too. The label is the field's accessible name (a real <label
   for>).

   The height and corner per size, the border, the focus look and the value
   type are the FIELD CHROME in field-chrome.ts, read by Textarea, Select and
   Combobox too: one family, so a form row never disagrees with itself. */

/* Every size hovers to alpha-400: one input, one hover, standardized on
   the deeper rung. Checkbox/radio keep the gentler -form rung: a 16px box
   at 400 shouts. */
const INPUT_HOVER =
  "hover:not-focus-within:not-has-[:is(input,textarea,select):read-only]:border-input-border-hover";

/* Height and corner come from the shared field chrome (field-chrome.ts), so
   Input, Textarea, Select and Combobox can only change together. */
const SIZE_CLASSES: Record<FieldSize, string> = {
  sm: `${FIELD_HEIGHT.sm} ${FIELD_RADIUS.sm} px-2.5 ${INPUT_HOVER}`,
  md: `${FIELD_HEIGHT.md} ${FIELD_RADIUS.md} px-3 ${INPUT_HOVER}`,
  default: `${FIELD_HEIGHT.default} ${FIELD_RADIUS.default} px-3 ${INPUT_HOVER}`,
  search: `${FIELD_HEIGHT.search} ${FIELD_RADIUS.search} px-3 ${INPUT_HOVER}`,
  touch: `${FIELD_HEIGHT.touch} ${FIELD_RADIUS.touch} px-3 ${INPUT_HOVER}`,
};

/* Leading-icon scale (the 40px search size renders a 20px icon) and the
   trailing-button pairing that keeps the slot snug:
   sm/md → icon 16px, trailing size="icon-sm" (28px)
   default/search/touch → icon 20px, trailing size="icon" (32px) */
const LEADING_ICON = {
  sm: "[&_svg]:size-4",
  md: "[&_svg]:size-4",
  default: "[&_svg]:size-5",
  search: "[&_svg]:size-5",
  touch: "[&_svg]:size-5",
} as const;

/**
 * Usage:
 *
 *     <Input placeholder="اسم المنتج" />
 *     <Input size="search" leading={<Icon icon={Search} />} placeholder="Search…" />
 *     <Input size="search" leading={<Icon icon={Search} />} loading />
 *     <Input size="search" trailing={<Button variant="ghost" size="icon" …/>} />
 *     <Input leadingControl={<CountrySelect …/>} inputMode="tel" />
 *
 * Trailing pairing: sm/md wrappers take size="icon-sm" (28px),
 * default/search/touch take size="icon" (32px: 4+32+4 fills the 40px
 * box exactly). The slot stays a plain node on
 * purpose: cloning to auto-size would guess wrong for non-Button content.
 *
 * A Button BESIDE the input (same row, outside the box) is size="xl",
 * 40px matching the default; see the sizing rule in button.tsx.
 *
 * className is for LAYOUT only: width, margins, grid placement; size and
 * chrome come from the props. `inputClassName` reaches the bare inner
 * element (e.g. "latin tabular" for identifier fields). Leading icons
 * light up with focus automatically. Invalid fields keep neutral chrome.
 * Render destructive caption text below instead. Numeric fields should
 * normalize digits: onChange={(e) => setValue(toWesternDigits(e.target.value))}.
 */
function Input({
  className,
  inputClassName,
  type,
  bare = false,
  size = "default",
  leading,
  leadingControl,
  trailing,
  loading = false,
  disabledReason,
  clearLabel,
  floatingLabel,
  dir,
  ref,
  ...props
}: Omit<React.ComponentProps<"input">, "size" | "children"> & {
  /** The label inside the box that floats up on focus or once filled.
        Replaces a label row over the field; never pair it with one. */
  floatingLabel?: string;
  /** A search field's clear button, named by this: a ghost icon button in
        the trailing slot while the field holds text. type="search" only;
        the browser's own cancel glyph is hidden either way, because it
        ignores the system and sits beside ours as a second X. */
  clearLabel?: string;
  /** WHY this field is unavailable, on a tooltip. Implies disabled.
        A field refuses with readOnly rather than the disabled
        attribute, so it stays focusable and the reason stays readable
        (see disabled-reason.tsx). */
  disabledReason?: React.ReactNode;
  inputClassName?: string;
  /** The inline-edit mode, mirroring Textarea's: no border and no box of
        its own, so an always-editable title reads as text and the caller
        owns the box. Focus is the global ink outline rather than the
        bordered field's border+ring, so clicking or typing is unmistakable
        without chrome at rest. Without this mode, swapping text for a field
        on click changes height, type and width at once: three layout
        shifts in one tap. */
  bare?: boolean;
  size?: FieldSize;
  leading?: React.ReactNode;
  /** A live control inside the box on the leading side, unquieted.
        `leading` is for icons; this is for something the user presses. */
  leadingControl?: React.ReactNode;
  trailing?: React.ReactNode;
  loading?: boolean;
}) {
  const inner = React.useRef<HTMLInputElement | null>(null);
  const autoId = React.useId();
  const fieldId = props.id ?? autoId;
  const floating = floatingLabel !== undefined && !bare;
  const setRef = (node: HTMLInputElement | null): void => {
    inner.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const clearable =
    type === "search" &&
    clearLabel !== undefined &&
    trailing == null &&
    !props.disabled &&
    typeof props.value === "string" &&
    props.value !== "";
  /* Through the native setter and an input event, so a controlled field's
       own onChange sees the empty value exactly as if it were typed. */
  function clear(): void {
    const node = inner.current;
    if (!node) return;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(node, "");
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.focus();
  }
  const trailingSlot = clearable ? (
    <Button
      type="button"
      variant="ghost"
      size={size === "sm" || size === "md" ? "icon-sm" : "icon"}
      aria-label={clearLabel}
      onClick={clear}
    >
      <CloseIcon />
    </Button>
  ) : (
    trailing
  );
  const field = (
    <div
      data-slot="input-wrapper"
      data-size={size}
      /* `dir` pins the whole box, not just the text inside it. On the
               inner element alone it turns the digits around while the flex
               row keeps the document direction, so an RTL page puts a
               phone field's country code on the right of its digits. "auto"
               is about the text only: on the box, a Latin value would mirror
               an Arabic field and carry its trailing button across. */
      dir={dir === "auto" ? undefined : dir}
      className={cn(
        "group flex w-full min-w-0 cursor-text items-center gap-2 bg-transparent transition-colors duration-100",
        bare ? "" : cn(FIELD_BORDER, SIZE_CLASSES[size], FIELD_FOCUS_WITHIN),
        (trailingSlot != null || loading) && "pe-1",
        leadingControl != null && "ps-1",
        "has-disabled:cursor-not-allowed",
        !floating && className,
      )}
      /* The whole bordered box is the field: clicks on the padding and
               icon gutter forward focus to the input (only the trailing
               slot's own controls keep their clicks). preventDefault stops
               the mousedown from blurring the field it just focused. */
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("input, button, a, [role=button]")) return;
        const field = event.currentTarget.querySelector<HTMLInputElement>(
          'input[data-slot="input-field"]',
        );
        if (!field || field.disabled) return;
        event.preventDefault();
        field.focus();
      }}
    >
      {leadingControl != null ? (
        <span
          data-slot="input-leading-control"
          className="flex shrink-0 items-center"
        >
          {leadingControl}
        </span>
      ) : null}
      {leading ? (
        <span
          className={cn(
            // icon-quiet (solid ink + opacity), not text-subtle: alpha ink
            // double-paints where icon strokes cross.
            "icon-quiet group-has-disabled:icon-quiet-disabled flex shrink-0 items-center transition-opacity duration-100 group-focus-within:opacity-100",
            LEADING_ICON[size],
          )}
        >
          {leading}
        </span>
      ) : null}
      {/* Stretched to the box's full height, so the text line has the
                whole field: centred at its own height it clipped Arabic's
                descenders (the dots under ي) off the bottom. */}
      <span className="relative flex min-w-0 grow self-stretch">
        <input
          ref={setRef}
          type={type}
          data-slot="input-field"
          className={cn(
            // No file:* styling on purpose: uploads are a ghost
            // button + hidden <input type="file">, never a styled
            // file control (the house pattern).
            "selection:bg-primary selection:text-primary-foreground placeholder:text-subtle size-full min-w-0 bg-transparent disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:appearance-none",
            FIELD_VALUE,
            /* A bordered field suppresses the global focus
                           outline because its own ink border + 0.5px ring
                           already paint ~1.5px of ink, and both together
                           read as a doubled edge. It is outline-hidden, a
                           transparent outline, because forced-colors mode
                           strips the box-shadow ring and still paints that
                           outline. A BARE field has no
                           border to pair with, so it keeps the global
                           outline: same ink weight, and the only cue that
                           the caret is live. */
            bare
              ? // The radius is invisible at rest (nothing is
                // painted) and only shapes the focus outline,
                // so it follows our scale instead of boxing
                // the text in hard corners.
                "rounded-sm"
              : "outline-hidden focus-visible:outline-hidden",
            floating &&
              "focus:placeholder:text-subtle placeholder:text-transparent",
            inputClassName,
          )}
          /* An empty field has no text for "auto" to read, and
                       resolves to LTR: an Arabic placeholder then sat on the
                       wrong side. Empty, it takes the page's direction. */
          dir={dir === "auto" && props.value === "" ? undefined : dir}
          {...props}
          /* :placeholder-shown is how CSS knows the field is
                       empty, so a floating field always has a placeholder,
                       if only a blank one. */
          {...(floating
            ? {
                id: fieldId,
                placeholder: props.placeholder ?? " ",
              }
            : {})}
          {...refusalProps(disabledReason, "field")}
        />
      </span>
      {/* In-flow trailing member, sized like an icon button's slot so
                spinner and trailing icons share one vertical column (an
                overlay inside the field would need a halo plus reserved
                text padding, the pattern this replaces; in-flow needs
                neither). Renders BEFORE trailing content: spinner, then
                button. */}
      {loading ? (
        // Ink, not the quiet ladder: a spinner is ACTIVITY, and it
        // must read over whatever the field shows. [decision]
        // aria-hidden: decorative motion; loading state is the
        // caller's to announce (aria-busy on the form region).
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center text-foreground"
        >
          <LoaderIcon className="size-4 animate-spin" />
        </span>
      ) : null}
      {trailingSlot}
    </div>
  );

  if (!floating) {
    return withDisabledReason(field, disabledReason, "block w-full");
  }
  /* The label sits OUTSIDE the box, on a wrapper that keeps the page's
       direction: a phone or email box is pinned LTR, and a label inside it
       landed on the left in Arabic, after the country control, while the
       name's sat on the right. Out here every label starts on the reading
       side, the same inset from the edge, and clears the corner's curve.
       It reads the box's state through :has, so autofill and a parent's
       value float it as typing does. */
  const floated = (
    <div className={cn("group/float relative w-full", className)}>
      {field}
      {/* At rest it reads as the placeholder, centred in the box and
                lined up with where the value starts; floated, it is centred
                on the top border, scaled down, its card fill breaking the
                line. Scaled rather than resized, so the size change is one
                compositor transition. */}
      <label
        htmlFor={fieldId}
        className={cn(
          "bg-card text-muted-foreground pointer-events-none absolute start-3 top-0 max-w-4/5 origin-left -translate-y-1/2 scale-75 truncate px-1 transition-all duration-150 ease-out motion-reduce:transition-none rtl:origin-right",
          FIELD_VALUE,
          /* Rest is empty AND unfocused, both at once: as two
                       rules the empty one outranked focus, and a focused
                       empty field kept its label inside, over the example. */
          "group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:text-subtle group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:start-2 group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:top-1/2 group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:scale-100",
          "group-focus-within/float:text-foreground",
          "group-has-disabled/float:opacity-50",
        )}
      >
        {floatingLabel}
      </label>
    </div>
  );
  return withDisabledReason(floated, disabledReason, "block w-full");
}

export { Input };
