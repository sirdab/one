"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export const SPOTLIGHT_PADDING = 8;

export type SpotlightHole = {
  top: number;
  left: number;
  width: number;
  height: number;
};

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

  className?: string;
}): React.JSX.Element {
  const hole = spotlightHole(rect, padding);

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

          boxShadow: "0 0 0 100vmax var(--scrim-surface)",
        }}
      />
    </div>
  );
}

export type ConnectorPoint = { x: number; y: number };

export function SpotlightConnector({
  from,
  to,
  className,
}: {
  from: ConnectorPoint;

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
