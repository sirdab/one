import * as React from "react";

import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";
import {
  FIELD_BORDER,
  FIELD_FOCUS_VISIBLE,
  FIELD_RADIUS,
  FIELD_VALUE,
} from "./field-chrome";

/* The Sirdab textarea, the multiline sibling of Input: alpha-200 rest
   border, ink border + 0.5px ring on focus, the field chrome Input, Select
   and Combobox read too (field-chrome.ts: one corner, border and focus for
   every field in a form). NO hover state: a textarea
   goes straight from rest to focus; only single-line inputs hover.
   Never user-resizable. Grows with content (field-sizing) from a 64px floor
   (the nearest on-grid step). Type matches inputs: 16px on
   touch widths (no iOS zoom), 14px regular from sm up. Invalid never colours
   the border; errors are destructive text under the field.

   field-sizing has no Firefox support yet; it degrades to the rows/height
   given, which is acceptable: a fixed-height composer, not a broken one.

   Disabled dims CONTENTS, not chrome, matching Input's undimmed hairline
   (element opacity would drag the border down with the text, and two
   adjacent disabled fields would disagree). Same math as Input's inner
   opacity-50: ink at half alpha, placeholder alpha halved.

   `bare` is the composer/editor mode: no border, no ring, no radius (the
   surrounding panel owns the chrome), the same responsive type as the
   bordered mode, caller-controlled padding and height. Pair it with a bottom fade when content scrolls. */
function Textarea({
  className,
  bare = false,
  disabledReason,
  dir,
  ...props
}: React.ComponentProps<"textarea"> & {
  bare?: boolean;
  /** WHY this field is unavailable, on a tooltip. Implies disabled.
        A field refuses with readOnly rather than the disabled
        attribute, so it stays focusable and the reason stays readable
        (see disabled-reason.tsx). */
  disabledReason?: React.ReactNode;
}) {
  const field = (
    <textarea
      data-slot="textarea"
      data-bare={bare || undefined}
      className={cn(
        /* focus-visible (not Input's focus-within) because the
                   textarea IS the focus target; Input is a composite
                   whose wrapper lights when the inner field focuses.
                   Editable elements match :focus-visible on mouse focus
                   too, so the two behave identically. */
        "placeholder:text-subtle disabled:placeholder:text-subtle/50 w-full resize-none bg-transparent outline-hidden transition-colors duration-100 disabled:cursor-not-allowed disabled:text-foreground/50",
        bare
          ? // Same responsive step as the bordered mode: 16px on
            // touch widths (below 16px iOS zooms the page on focus),
            // the 14px body role from sm up. Pinning 16px
            // everywhere made desktop composers read oversized.
            FIELD_VALUE
          : cn(
              "field-sizing-content min-h-16 px-3 py-2",
              FIELD_RADIUS.default,
              FIELD_BORDER,
              FIELD_VALUE,
              FIELD_FOCUS_VISIBLE,
            ),
        className,
      )}
      /* Empty, "auto" resolves to LTR and puts an Arabic placeholder
               on the wrong side; with no text it takes the page's. */
      dir={dir === "auto" && props.value === "" ? undefined : dir}
      {...props}
      {...refusalProps(disabledReason, "field")}
    />
  );

  return withDisabledReason(field, disabledReason, "block w-full");
}

export { Textarea };
