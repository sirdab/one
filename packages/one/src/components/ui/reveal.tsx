import * as React from "react";

import { cn } from "../../lib/utils";

/* The Sirdab reveal: a control that comes and goes inside a row (a Save that
   only exists once there is something to save) without the row jumping. The
   slot grows to the control's width while the control springs in, so its
   neighbours slide over; closing reverses it. Pair it with Button's
   `concealed`, which makes the hidden control inert and aria-hidden and
   gives it the arrival animation.

   Built for a gap-2 row: closed, the slot takes back that gap too.

   Usage:
       <Reveal open={edited}>
           <Button concealed={!edited} onClick={save}>Save</Button>
       </Reveal>
*/
function Reveal({
  open,
  className,
  children,
}: {
  open: boolean;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <span
      data-slot="reveal"
      data-open={open || undefined}
      className={cn("reveal-slot", open && "reveal-slot-open", className)}
    >
      {/* A bare wrapper, so the slot can close to nothing: a column
                at 0fr still holds its item's padding, and a button has
                padding. */}
      <span>{children}</span>
    </span>
  );
}

export { Reveal };
