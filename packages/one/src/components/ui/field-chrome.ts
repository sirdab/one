/* The field chrome: the one place that says what a FIELD looks like.

   A merchant fills a price (Input), a category (Select), notes (Textarea)
   and a sections list (Combobox) in one form, and they must read as one
   family: one corner, one border, one hover, one focus. Input, Textarea,
   Select and Combobox all read this file, so none of them can change on its
   own. Change a value here and every field follows in the same diff.

   CORNER, per size. 12px (rounded-xl) is the 40 and 44 field, the sizes
   forms are built from. The dense 32 and 36 inputs keep the 10px step
   (rounded-lg): a smaller box takes a smaller corner. Textarea and the
   Select/Combobox triggers all sit at the default (40) rung.

   BORDER and HOVER. alpha-200 at rest, alpha-400 on hover (every size, one
   rung deeper than a Button because a field is an outline, not a fill). No
   fill ever appears on hover or press: a field is white and only its edge
   answers.

   FOCUS is the ink border plus a 0.5px ring (~1.5px of ink in all),
   deliberately not the global 2px offset outline: a bordered field paints
   its own focus and suppresses the global one. Input is a wrapper whose
   inner <input> holds focus, so it reads the focus-WITHIN pair. Textarea,
   Select and Combobox ARE the focus target, so they read the focus-VISIBLE
   pair. The two pairs sit side by side so they cannot drift. An open Select
   or Combobox keeps the focus look while its panel is up (the open pair).

   VALUE type is the Input's: 16px on a phone (below 16px iOS zooms the page
   on focus; 16.8px in Arabic), the quiet 400 body role from sm up.

   The tap target is a separate matter: fields are 40 tall on a phone, and a
   control that is a button (Select, Combobox) carries `touch-target`, the
   invisible 44px box. Raising the field itself to 44 on coarse pointers is
   one `pointer-coarse:` class on FIELD_HEIGHT.default, here, for all four. */

export type FieldSize = "sm" | "md" | "default" | "search" | "touch";

export const FIELD_HEIGHT: Record<FieldSize, string> = {
  sm: "h-control",
  md: "h-control-lg",
  default: "h-control-xl",
  search: "h-control-xl",
  touch: "h-control-touch",
};

export const FIELD_RADIUS: Record<FieldSize, string> = {
  sm: "rounded-lg",
  md: "rounded-lg",
  default: "rounded-xl",
  search: "rounded-xl",
  touch: "rounded-xl",
};

export const FIELD_BORDER = "border border-input";

export const FIELD_VALUE = "text-body-lg sm:text-body-quiet";

export const FIELD_FOCUS_WITHIN =
  "focus-within:border-ring focus-within:ring-input-focus";

export const FIELD_FOCUS_VISIBLE =
  "focus-visible:border-ring focus-visible:ring-input-focus";

export const FIELD_OPEN =
  "data-[state=open]:border-ring data-[state=open]:ring-input-focus";

/* Hover darkens the border of a field that is neither focused nor open, so
   it never repaints the ink edge of a field being used. The gate is the
   Button-family `hover:` variant (fine pointers only, never on a disabled or
   aria-disabled control). */
export const FIELD_HOVER_BORDER =
  "hover:not-focus-visible:not-data-[state=open]:border-input-border-hover";

/* A field that is a BUTTON (Select, Combobox): what both triggers share, so
   the combobox is the select's field by construction. Height and corner are
   added per size from the maps above. The padding is the Input's 12px
   inset; a trigger with a chevron takes ps-3 pe-2 because the chevron's own
   4px inset puts its stroke 12px from the edge. The value is left-aligned
   (start), the global outline is suppressed in favour of the field's own
   ink edge. outline-hidden, not outline-none: the ink border and ring are
   box-shadows, which forced-colors mode (Windows High Contrast) removes,
   and the transparent outline is what that mode still paints. An unsized
   icon in the trigger is 16px, as in a Button. */
export const FIELD_TRIGGER = [
  "relative touch-target inline-flex shrink-0 items-center justify-between gap-2 bg-transparent text-start whitespace-nowrap text-foreground transition-colors duration-100 select-none focus-visible:outline-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  FIELD_BORDER,
  FIELD_VALUE,
  FIELD_HOVER_BORDER,
  FIELD_FOCUS_VISIBLE,
  FIELD_OPEN,
].join(" ");
