"use client";

import type { JSX, ReactNode } from "react";
import { Direction } from "radix-ui";

/**
 * Sets reading direction for One's components without OneProvider's theme
 * and tooltip providers, for hosts that own their theme (for example a
 * cookie-backed one). Lives in its own module so importing it pulls in
 * nothing else.
 */
export function DirectionProvider({
  dir,
  children,
}: {
  dir: "ltr" | "rtl";
  children: ReactNode;
}): JSX.Element {
  return <Direction.Provider dir={dir}>{children}</Direction.Provider>;
}
