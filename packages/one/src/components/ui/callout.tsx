"use client";

import * as React from "react";

import { Button } from "./button";
import {
  SPOTLIGHT_PADDING,
  SpotlightConnector,
  spotlightHole,
} from "./spotlight";

/* The Sirdab Callout
   =================

   The popup half of a guide: a small card that explains one control, parked
   against that control's measured rect. It is the only thing in the system
   positioned from a `DOMRect` rather than composed around a trigger, because
   a guide labels controls it does not own and cannot wrap.

   It is a CARD, not floating text. It wears the modal recipe verbatim
   (`bg-surface-modal` + `shadow-modal`) because it is the content of a blocking layer, the same job a dialog
   does, and a frosted popover surface over an already-blurred scrim reads as
   mush. The radius is the popover's 20px rather than the modal's 24px: at
   224px wide the modal corner eats the padding.

   It NEVER overlaps its own spotlight. Placement is measured from the padded
   hole, not from the raw rect, and the gap it leaves is elbow room for the
   connector rather than a hairline.

   Side is a PREFERENCE, not an instruction. A caller declaring "bottom" for
   a control that turns out to sit near the viewport floor would push the
   card off screen, so the card flips above the anchor when below does not
   fit and above does. The height it measures itself against is its own,
   read after paint; the estimate below only stands in for the first frame
   and for environments with no layout at all.

   And when NEITHER vertical side fits, the card goes beside the anchor
   instead. A full-height panel (the studio's builder column, its canvas) has
   no above and no below at all, so a component that only knew top and bottom
   parked those cards off the top edge of the window. Beside is not a third
   value a caller can ask for: it is what a top/bottom preference degrades
   to when the anchor is too tall to have sides, and it picks whichever of
   start or end has the room.

   Physical `left`, deliberately, not `insetInlineStart`. A DOMRect is always
   physical: `rect.left` is the distance from the viewport's left edge in
   both directions. `insetInlineStart` flips its origin to the right edge
   under RTL, so pairing the two would push every callout off screen in
   Arabic. What actually differs in RTL is which controls sit near which
   edge, and the clamp below handles that without the component needing to
   know the direction at all.

   Takes no strings of its own: primitives in this system receive copy as
   props, matching ProductStatusBadge's `label` convention. */

/** Matches `w-56`. The clamp needs the box width before the box exists. */
const WIDTH = 224;
const EDGE_GAP = 12;
/** Enough room between the spotlight and the card for the elbow to turn. */
const CONNECTOR_GAP = 24;
/** How far in from the card's leading edge the connector meets it. Off the
 *  corner, so the line reads as attached rather than as a continuation. */
const CONNECTOR_INSET = 24;
/** First-frame stand-in for the card's own height, and the only number
 *  available where nothing lays out. Roughly title + two body lines + an
 *  action; erring high just means flipping a touch early. */
const ESTIMATED_HEIGHT = 148;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function Callout({
  rect,
  side,
  meta,
  title,
  body,
  action,
  padding = SPOTLIGHT_PADDING,
  connector = true,
}: {
  rect: DOMRect;
  /** Preferred side. The card flips when that side has no room. */
  side: "top" | "bottom";
  /** An eyebrow above the title, for a presentation that has to say where
   *  in itself it is. The map has nowhere to be, so it passes nothing. */
  meta?: string;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
  /** Must match the Spotlight's padding, or the card clears the wrong box. */
  padding?: number;
  connector?: boolean;
}): React.JSX.Element {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = React.useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    const node = cardRef.current;
    if (node === null) return;
    const next = node.offsetHeight;
    setMeasured((previous: number) => (previous === next ? previous : next));
  });

  const height = measured > 0 ? measured : ESTIMATED_HEIGHT;
  const hole = spotlightHole(rect, padding);
  const gap = connector ? CONNECTOR_GAP : EDGE_GAP;

  // No window during the server pass, and a rect measured on the client is
  // the only thing that ever reaches this component anyway.
  const viewportWidth =
    typeof window === "undefined" ? Infinity : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? Infinity : window.innerHeight;

  const fitsBelow =
    hole.top + hole.height + gap + height + EDGE_GAP <= viewportHeight;
  const fitsAbove = hole.top - gap - height - EDGE_GAP >= 0;
  const holeEnd = hole.left + hole.width;
  const roomBefore = hole.left - gap - WIDTH - EDGE_GAP;
  const roomAfter = viewportWidth - (holeEnd + gap + WIDTH + EDGE_GAP);
  /* Beside is the LAST resort, reached only when the anchor is tall enough
       that above and below both fall off the window. A short viewport can hit
       it too, and taking the roomier flank there is no worse than the clipped
       card a strict preference produces. */
  const resolved: "top" | "bottom" | "before" | "after" =
    fitsBelow || fitsAbove
      ? side === "bottom"
        ? fitsBelow
          ? "bottom"
          : "top"
        : fitsAbove
          ? "top"
          : "bottom"
      : roomAfter >= roomBefore
        ? "after"
        : "before";
  const beside = resolved === "before" || resolved === "after";

  /* Centred on the hole rather than on the anchor's top, so the card reads
       as belonging to the whole panel it is beside, then clamped: a panel
       taller than the window still has to leave the card on screen. */
  const top = beside
    ? Math.max(
        EDGE_GAP,
        Math.min(
          hole.top + hole.height / 2 - height / 2,
          viewportHeight - height - EDGE_GAP,
        ),
      )
    : resolved === "bottom"
      ? hole.top + hole.height + gap
      : hole.top - gap;
  const left = Math.max(
    EDGE_GAP,
    Math.min(
      resolved === "before"
        ? hole.left - gap - WIDTH
        : resolved === "after"
          ? holeEnd + gap
          : rect.left,
      viewportWidth - WIDTH - EDGE_GAP,
    ),
  );

  return (
    <>
      {connector ? (
        <SpotlightConnector
          /* `top` is the card's NEAR edge either way: below it is
                       the card's top, above it is the card's bottom, because
                       the card hangs upward from that same line. Beside, the
                       near edge is a vertical one, so both ends sit on the
                       card's own midline and the elbow flattens to a rule. */
          from={
            beside
              ? {
                  x: resolved === "before" ? left + WIDTH : left,
                  y: top + height / 2,
                }
              : { x: left + CONNECTOR_INSET, y: top }
          }
          to={
            beside
              ? {
                  x: resolved === "before" ? hole.left : holeEnd,
                  y: top + height / 2,
                }
              : {
                  x: hole.left + hole.width / 2,
                  y: resolved === "bottom" ? hole.top + hole.height : hole.top,
                }
          }
        />
      ) : null}
      <div
        ref={cardRef}
        data-slot="callout"
        className="rounded-popover bg-surface-modal shadow-modal pointer-events-auto fixed w-56 p-4"
        style={{
          top,
          left,
          transform: resolved === "top" ? "translateY(-100%)" : undefined,
        }}
      >
        {meta !== undefined ? (
          <p className="text-caption-quiet text-subtle">{meta}</p>
        ) : null}
        <p className="text-label">{title}</p>
        <p className="text-body-quiet text-muted-foreground mt-1">{body}</p>
        {action !== undefined ? (
          <Button size="sm" className="mt-3" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null}
      </div>
    </>
  );
}
