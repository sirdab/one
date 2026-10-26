import * as React from "react";

import { cn } from "../../lib/utils";
import { LoaderIcon } from "../icons/general";
import type { IconComponent } from "../icons/house-icon";
import { Icon } from "./icon";

/* The Sirdab spinner. Stock shadcn structure (their Spinner IS a Loader
   icon + animate-spin, nothing more), trued three ways: INK by default
   (TOKENS.md: activity, not decoration, so a spinner is a statement the
   product is working, never an accent), motion-reduce stills it, and
   a11y runs through <Icon> (decorative unless labelled) instead of the
   stock hardcoded English aria-label, which our i18n-free-primitives
   rule forbids.

   Sizes: `sm` (12px) rides inline with caption/body text in a transcript
   line; the default (16px) matches the icon grid everywhere else. Button
   and Input keep their own internal spinners: theirs are state machines
   (loading swaps content), this one is free-standing.

   Decorative by default (Icon's aria-hidden); the surrounding line names
   the activity. Pass aria-label only when the spinner stands alone. */
function Spinner({
  size = "default",
  className,
  ...props
}: Omit<React.ComponentProps<IconComponent>, "size"> & {
  size?: "sm" | "default";
}) {
  return (
    <Icon
      icon={LoaderIcon}
      data-slot="spinner"
      className={cn(
        "animate-spin text-foreground motion-reduce:animate-none",
        size === "sm" ? "size-3" : "size-4",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
