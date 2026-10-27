import * as React from "react";

import { cn } from "../../lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "rounded-kbd border-kbd-border bg-kbd-surface text-caption text-muted-foreground pointer-events-none inline-flex h-4.5 w-fit min-w-4.5 items-center justify-center border px-1 select-none",

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
