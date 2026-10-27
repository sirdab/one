"use client";

import * as React from "react";

import { Button } from "./button";
import {
  SPOTLIGHT_PADDING,
  SpotlightConnector,
  spotlightHole,
} from "./spotlight";

const WIDTH = 224;
const EDGE_GAP = 12;

const CONNECTOR_GAP = 24;

const CONNECTOR_INSET = 24;

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

  side: "top" | "bottom";

  meta?: string;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };

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
