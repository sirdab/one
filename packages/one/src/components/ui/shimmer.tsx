"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

interface ShimmerProps {
  children: string;
  className?: string;

  duration?: number;

  pulseEvery?: number;
}

function Shimmer({
  children,
  className,
  duration = 2,
  pulseEvery = 3,
}: ShimmerProps): React.JSX.Element {
  const spread = `${Math.max(children.length, 4) * 2}px`;
  return (
    <span
      data-slot="shimmer"
      className={cn("shimmer", className)}
      style={
        {
          "--shimmer-duration": `${duration}s`,
          "--shimmer-cycle": `${duration * pulseEvery}s`,
          "--shimmer-spread": spread,
        } as React.CSSProperties
      }
      data-pulse={pulseEvery || undefined}
    >
      {children}
    </span>
  );
}

export { Shimmer };
export type { ShimmerProps };
