import * as React from "react";

import { monoOn } from "@sirdab/one/foundation";

import { cn } from "../../lib/utils";

/* The Sirdab product panel: one square of the store the mood board is
   drawing.

   With the mood board, it is one of the two primitives in this package that
   paint a literal colour. The colour is the merchant's, not ours: a concept's `panelColor` for a product
   nobody has photographed yet, or a photograph over it. That is the
   exception COLORS.md makes (chroma-zero everywhere, colour only inside the
   board or the store), so the fill is an inline style from the
   model and never a token, and `className` stays layout-only.

   The silhouette is drawn in the mono that wins on the panel (`monoOn`,
   the foundation's copy of the scaffold's rule), at the scaffold's own 0.82
   opacity, from the scaffold's own paths: when the store unveils over the
   board, the same shape in the same colour is what makes it read as "it
   became real" rather than "it became something else". Decorative, and
   marked so: the panel carries the accessible name, the svg draws no text.

   A photograph (a concept's sample, a peek's real one) covers the square and
   replaces the silhouette; the colour stays underneath as the frame while
   the image loads. */

export const SKETCH_SHAPES = [
  "bottle",
  "bag",
  "box",
  "jar",
  "tin",
  "tray",
  "cup",
  "kettle",
  "tool",
  "mark",
] as const;

export type SketchShape = (typeof SKETCH_SHAPES)[number];

export function isSketchShape(value: unknown): value is SketchShape {
  return (
    typeof value === "string" &&
    (SKETCH_SHAPES as readonly string[]).includes(value)
  );
}

/* The paper gray a panel paints when the model gave it no colour: a peek
   whose image has not arrived, a concept product the model left unpainted.
   A literal because the board's tiles take no tokens; warm so it sits in
   the same family as the default ground the board paints. */
export const PANEL_FALLBACK_COLOR = "#e9e6e0";

/* The ten silhouettes, verbatim from
   packages/storefront-scaffold/src/lib/shapes.tsx. Every path is drawn
   inside the same 100x120 box so swapping the shape never changes the
   figure's footprint on the card. Geometric rather than illustrative: they
   must read at card size and at detail size from the same paths, and sit on
   ANY panel colour a freed palette produces. */
const SHAPES: Record<SketchShape, React.ReactElement> = {
  bottle: (
    <>
      <path d="M42 6h16v16l13 15v70a7 7 0 0 1-7 7H36a7 7 0 0 1-7-7V37l13-15z" />
      <path d="M38 4h24v6H38z" />
    </>
  ),
  // A tied sack: gathered top, tie band, bulging body.
  bag: (
    <>
      <path d="M36 6q14 10 28 0l6 16H30z" />
      <rect x="32" y="20" width="36" height="9" rx="3" />
      <path d="M34 31h32q22 18 20 50a26 26 0 0 1-26 26H40a26 26 0 0 1-26-26q-2-32 20-50z" />
    </>
  ),
  box: (
    <>
      <path d="M16 36l34-16 34 16v56L50 108 16 92z" />
      <path
        d="M16 36l34 16 34-16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.4"
      />
    </>
  ),
  jar: (
    <>
      <rect x="24" y="32" width="52" height="74" rx="11" />
      <rect x="31" y="14" width="38" height="18" rx="5" />
    </>
  ),
  tray: (
    <>
      <path d="M10 54h80a6 6 0 0 1 6 6v8a34 34 0 0 1-34 34H38A34 34 0 0 1 4 68v-8a6 6 0 0 1 6-6z" />
      <circle cx="33" cy="40" r="10" />
      <circle cx="56" cy="35" r="10" />
      <circle cx="74" cy="44" r="8" />
    </>
  ),
  cup: (
    <>
      <path d="M22 40h48v36a24 24 0 0 1-24 24 24 24 0 0 1-24-24z" />
      <path
        d="M70 50h9a13 13 0 0 1 0 26h-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
    </>
  ),
  tin: (
    <>
      <rect x="16" y="46" width="68" height="50" rx="6" />
      <ellipse cx="50" cy="46" rx="34" ry="9" />
      <rect x="22" y="34" width="56" height="12" rx="4" opacity="0.55" />
    </>
  ),
  kettle: (
    <>
      <path d="M26 46h44a8 8 0 0 1 8 8v30a20 20 0 0 1-20 20H38a20 20 0 0 1-20-20V54a8 8 0 0 1 8-8z" />
      <path
        d="M70 52q22-6 24 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      <rect x="40" y="30" width="20" height="16" rx="4" opacity="0.6" />
    </>
  ),
  // A hand grinder: body, domed cap, crank arm with a knob.
  tool: (
    <>
      <rect x="30" y="44" width="40" height="48" rx="6" />
      <rect x="34" y="32" width="32" height="14" rx="7" />
      <path
        d="M50 30q2-16 22-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      <circle cx="74" cy="17" r="7" />
      <rect x="36" y="96" width="28" height="10" rx="3" opacity="0.6" />
    </>
  ),
  // A hanging product tag, hole cut out via even-odd fill.
  mark: (
    <path
      fillRule="evenodd"
      d="M50 10 84 42v58a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V42zm0 20a8 8 0 1 0 .01 0z"
    />
  ),
};

export function ProductPanel({
  shape,
  color,
  imageUrl,
  label,
  className,
}: {
  shape: SketchShape | null;
  /** The model's colour for this product; null paints the paper gray. */
  color: string | null;
  /** A real photograph (a peek); null draws the silhouette. */
  imageUrl: string | null;
  /** The accessible name: the product's title. */
  label: string;
  /** Layout only (width, grid placement); the panel owns its chrome. */
  className?: string;
}): React.JSX.Element {
  const ground = color ?? PANEL_FALLBACK_COLOR;
  return (
    <div
      data-slot="product-panel"
      role="img"
      aria-label={label}
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-lg",
        className,
      )}
      style={{ backgroundColor: ground }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 100 120"
          data-shape={shape ?? "mark"}
          aria-hidden="true"
          focusable="false"
          className="h-3/4 w-auto shrink-0"
          style={{ color: monoOn(ground) }}
        >
          <g fill="currentColor" opacity="0.82">
            {SHAPES[shape ?? "mark"]}
          </g>
        </svg>
      )}
    </div>
  );
}
