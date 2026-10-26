import * as React from "react";

/* What a closing overlay shows during its exit animation: the content it
   had when it was last open. Callers reset their steps in onOpenChange
   (back to the first step, the list emptied), and without this the panel
   flashed that reset state for the 200ms it took to fade out. */
export function useHeldWhileClosing<T>(open: boolean, value: T): T {
  const [held, setHeld] = React.useState(value);
  if (open && held !== value) setHeld(value);
  return open ? value : held;
}
