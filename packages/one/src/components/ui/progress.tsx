"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function Progress({
  className,
  value,
  ...props
}: Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "value" | "max"
> & {
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
