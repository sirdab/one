"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab separator: a hairline in `--border`, the same line a bordered
   card or a table row draws. Inside a card it divides sections (a CardContent
   block, then another) across the card's full width; between settings rows it
   is ItemSeparator. It is decorative by default (role="none"), so a screen
   reader meets the sections, not the lines.

   Taken from shadcn's separator unchanged but for the import path: it already
   paints with `bg-border`, the token this system draws every hairline in. */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
