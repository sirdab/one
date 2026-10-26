"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab progress bar. Stock shadcn (Radix Progress root and indicator),
   trued three ways:

   - The track is the wash (`bg-muted`), the same quiet fill the segmented
     control rests on, so the bar sits on a card without a border. The
     indicator is ink-on-primary.
   - The indicator is sized by `width`, not stock's `translateX(-n%)`. A
     width grows from the start edge of its parent in either reading
     direction, so an Arabic bar fills from the right with no direction
     check; a translate would fill from the wrong side under `dir="rtl"`.
   - No `value` (or null) is the indeterminate state, for work whose total
     is not known yet ("0 of 0" is a lie while discovering): the bar pulses
     full width. It stills under reduced motion, and dims, so it never reads as 100%.

   No copy of its own: pass `aria-label` or `aria-labelledby`, because a bar
   with no name reads as "progressbar" and nothing else. */
function Progress({
  className,
  value,
  ...props
}: Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "value" | "max"
> & {
  /** 0 to 100; the caller computes the percentage. */
  value?: number | null;
}): React.JSX.Element {
  const known = typeof value === "number" && Number.isFinite(value);
  const percent = known ? Math.min(100, Math.max(0, value)) : 100;
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={known ? percent : null}
      className={cn(
        "bg-muted relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full rounded-full transition-all duration-300 ease-out motion-reduce:transition-none",
          !known &&
            "animate-pulse motion-reduce:animate-none motion-reduce:opacity-50",
        )}
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
