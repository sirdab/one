"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/* The Sirdab shimmer: a band of light crossing muted text, for one job only,
   saying "working on it" in words (the assistant's "Thinking", a running
   step's label). Taken from the shadcn.io AI Elements shimmer and trued:

   - it is the foundation `shimmer` utility, so the sweep and the breath are
     CSS keyframes and no motion library rides the page for a loading word;
     the band paints with the text tokens, the page tone crossing
     --muted-foreground in both scopes;
   - the element hands the utility its timing as custom properties (one
     sweep, the band's half width, one breath), set inline because they are
     measurements, not design values;
   - under reduced motion the utility drops the band and leaves plain muted
     text;
   - every third sweep the words fade out and back (pulseEvery), so a long
     wait reads as alive. One shimmer for every "working on it" in the
     product: never a hand-rolled copy.

   Text only: the effect clips a gradient to glyphs, so any element inside
   it would paint transparent. That is why children is a string.

   Usage:
       <Shimmer>{t("thinking")}</Shimmer>
*/
interface ShimmerProps {
  children: string;
  className?: string;
  /** Seconds per sweep. */
  duration?: number;
  /** Every this many sweeps the words fade out and back, a breath that
   *  says the wait is long but alive; 0 for none. The fade closes each
   *  cycle of that many sweeps, so it stays in step with the band. */
  pulseEvery?: number;
}

function Shimmer({
  children,
  className,
  duration = 2,
  pulseEvery = 3,
}: ShimmerProps): React.JSX.Element {
  // The band widens with the text, so a long label and a short one
  // sweep at the same apparent speed.
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
