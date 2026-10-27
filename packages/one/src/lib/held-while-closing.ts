import * as React from "react";

export function useHeldWhileClosing<T>(open: boolean, value: T): T {
  const [held, setHeld] = React.useState(value);
  if (open && held !== value) setHeld(value);
  return open ? value : held;
}
