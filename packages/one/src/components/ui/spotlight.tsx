"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/* The Sirdab Spotlight
   ===================

   A guide's job is to point at something. The scrim that comes with every
   other blocking layer in this system dims the WHOLE page, which is exactly
   wrong here: it blurs the control the copy is describing, so the merchant
   reads "Publish" over a smudge where the Publish button is. The
   Spotlight is the same scrim with a hole in it. Everything except one
   measured rect goes dim and soft; the rect stays sharp, and the popup and
   the thing it explains are on screen together.

   HOW THE HOLE IS CUT, and why it is not a mask.

   The obvious build is one full-viewport scrim with a CSS mask or a
   clip-path punching the hole. It is one element and it rounds for free.
   It also asks `backdrop-filter` and `mask-image` to composite on the same
   box, which is the combination WebKit has historically dropped on the
   floor: the mask wins and the blur silently vanishes, or the entire layer
   does. A guide that renders as a black rectangle on someone's iPhone is
   worse than no guide.

   So the layer is split across the two things the scrim token actually is:

     - FOUR BANDS carry `backdrop-blur-scrim`. They tile the viewport around
       the hole (full-width above and below, one column either side of the
       hole's own rows), so the blur simply is not painted over the rect.
       A rectangular hole is all four boxes can give.
     - ONE HOLE ELEMENT carries the tint, as `--scrim-surface` spread out of
       a rounded box with a viewport-sized `box-shadow`. A spread shadow is
       painted OUTSIDE the border box and follows the border radius, so this
       is a genuinely round-cornered dim with no mask anywhere.

   Composited, the pair is `bg-scrim-surface` + `backdrop-blur-scrim` over
   the same region, which is the one scrim TOKENS.md allows: blurred
   backdrop, tint above it. The only place the two disagree is the four
   corner arcs, a couple of pixels each at a 10px radius, which get the tint
   without the blur. That is the whole cost of not using a mask.

   The padding is what makes it read as a highlight rather than a crop: the
   hole is the control plus a rung of air, with the everyday 10px radius, so
   the bright patch looks like the control has been lifted out of the page
   rather than cut out of it. No ring is drawn on it. The scrim edge is
   already separating two things, and a second line around the same edge is
   the decoration TOKENS.md tells you to delete.

   NOTHING here takes pointer events. A spotlight's whole promise is that
   the control underneath is still the control, so the layer never eats a
   click. If a guide wants the page around it inert, or wants a click
   anywhere to dismiss, that is the guide's own layer to render behind this
   one, the way a dialog owns its overlay.

   Physical `left`, deliberately, never `insetInlineStart`. A DOMRect is
   physical in both directions; pairing it with a logical inset mirrors the
   hole away from the control it is supposed to be showing under RTL. */

/** One rung of air around the measured control. */
export const SPOTLIGHT_PADDING = 8;

export type SpotlightHole = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** The lit rect in viewport coordinates. Exported because a callout has to
 *  clear the same box the spotlight cut, and the two agreeing by accident is
 *  how a popup ends up sitting on the thing it explains. */
export function spotlightHole(
  rect: DOMRect,
  padding: number = SPOTLIGHT_PADDING,
): SpotlightHole {
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

const BAND = "backdrop-blur-scrim absolute";

export function Spotlight({
  rect,
  padding = SPOTLIGHT_PADDING,
  className,
}: {
  rect: DOMRect;
  padding?: number;
  /** Layout only, per the house rule. The z layer in particular belongs to
   *  the guide, which knows whether it is above or below its own scrim. */
  className?: string;
}): React.JSX.Element {
  const hole = spotlightHole(rect, padding);
  // A control flush against an edge produces a band of negative size, which
  // paints as the full viewport rather than nothing.
  const above = Math.max(0, hole.top);
  const start = Math.max(0, hole.left);
  const below = Math.max(0, hole.top + hole.height);
  const end = Math.max(0, hole.left + hole.width);

  return (
    <div
      data-slot="spotlight"
      aria-hidden
      className={cn("pointer-events-none fixed inset-0", className)}
    >
      <div
        data-slot="spotlight-band"
        className={cn(BAND, "inset-x-0 top-0")}
        style={{ height: above }}
      />
      <div
        data-slot="spotlight-band"
        className={cn(BAND, "inset-x-0 bottom-0")}
        style={{ top: below }}
      />
      <div
        data-slot="spotlight-band"
        className={cn(BAND, "left-0")}
        style={{ top: above, height: hole.height, width: start }}
      />
      <div
        data-slot="spotlight-band"
        className={cn(BAND, "right-0")}
        style={{ top: above, height: hole.height, left: end }}
      />
      <div
        data-slot="spotlight-hole"
        className="absolute rounded-lg"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
          /* Geometry, not a design value: the spread only has to
                       outrun the largest viewport it will ever paint on. */
          boxShadow: "0 0 0 100vmax var(--scrim-surface)",
        }}
      />
    </div>
  );
}

export type ConnectorPoint = { x: number; y: number };

/* An elbow, not a diagonal. The callout clamps to the viewport, so it
   routinely sits well to one side of its anchor, and the straight line
   between them would cut across the spotlight it is pointing at. Out of the
   spotlight, across at the midpoint, into the card: the path only ever
   travels through dimmed ground. */
export function SpotlightConnector({
  from,
  to,
  className,
}: {
  /** Where the callout's near edge is. */
  from: ConnectorPoint;
  /** Where the spotlight's near edge is. */
  to: ConnectorPoint;
  className?: string;
}): React.JSX.Element {
  const turn = Math.round((from.y + to.y) / 2);

  return (
    <svg
      data-slot="spotlight-connector"
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 h-full w-full text-foreground",
        className,
      )}
    >
      <path
        d={`M ${Math.round(to.x)} ${Math.round(to.y)} V ${turn} H ${Math.round(from.x)} V ${Math.round(from.y)}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
