import * as React from "react";

import { cn } from "../../lib/utils";

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
      <span>{children}</span>
    </span>
  );
}

export { Reveal };
