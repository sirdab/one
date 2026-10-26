import * as React from "react";

import { cn } from "../../lib/utils";

/* The Sirdab keycap. shadcn's kbd, trued: the chip stands on the keycap
   tokens (a 15% ink hairline and the gray-50 surface, foundation.css
   "kbd"), not stock's bg-muted, and it is set in the caption role rather
   than a stock type step. Stock's tooltip rule is kept in spirit: our
   tooltip is ink, so inside one the chip inverts to a faint light surface
   with light text. Decorative by nature (pointer-events-none, select-none): the chip
   NAMES a key, it never fires one, so the control it sits in keeps the
   click and the accessible name.

       <Kbd>⌘B</Kbd>
       <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>

   className is for layout (margins, placement), never for restyling. */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "rounded-kbd border-kbd-border bg-kbd-surface text-caption text-muted-foreground pointer-events-none inline-flex h-4.5 w-fit min-w-4.5 items-center justify-center border px-1 select-none",
        /* Inside a tooltip the chip squares off one more step (4px),
                   so it reads as a key against the ink fill. */
        "in-data-[slot=tooltip-content]:border-primary-foreground/20 in-data-[slot=tooltip-content]:bg-primary-foreground/15 in-data-[slot=tooltip-content]:text-primary-foreground in-data-[slot=tooltip-content]:rounded-xs",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
