"use client";

import * as React from "react";

import { ensureContrast, monoOn } from "@sirdab/one/foundation";

import { cn } from "../../lib/utils";
import type { SketchShape } from "./product-panel";

/* The Sirdab mood board: her store's design system, laid out the way every
   brand guideline page is, before the store itself exists.

   Generic on purpose (2026-10-05): a plain board on the house page with four
   quiet sections, her colours, her two fonts, the corner radii and the
   spacing scale. No name, no mood line, no products: the board says what her
   store will look like, not what it sells. The colours are swatches with
   their roles and hexes. The type is two cards on her ground in her ink: the
   brand font (her titles and product sections, a specimen and a headline)
   and the interface font (a nav row, a button in her accent, a sentence of
   body text), each saying what it is for. The radii and the spacing are the
   same for every store, painted in her accent so they read as hers. A pure
   function of a MoodBoardModel and its labels; the model also carries the
   name, mood and products, which the thumbnail and the studio read.

   SECTIONS. Her colours and fonts draw once they exist. While `drawing` (a
   stream is still filling the model) a missing one holds its place with a
   placeholder that pulses, and the real section fades in over it when it
   lands: 200ms, ease-out, no bounce, removed outright under reduced motion.
   Not drawing, a missing one is simply not on the board. The radii and the
   spacing are always there.

   COLOUR. The second exception to COLORS.md's chroma-zero rule, after the
   product panel: the tiles paint HER hexes, from the model, as inline style,
   never a token. Ink and accent are pushed through the foundation's contrast
   rule first (ink to 4.5:1 on the ground, accent to 3:1), the rule the
   generated store applies to its own tokens, so the swatches show the values
   the store will actually paint. Text on a swatch or on the accent is the
   mono that wins there (`monoOn`). The board around the tiles is the house's
   own page (`bg-background`), and tokens carry every radius and type role.

   TYPE. Her two families arrive by name. While the board shows them it adds
   one Google Fonts stylesheet for exactly that pair (`display=swap`, shared
   and counted across boards, removed when the last one goes), and every
   string set in them falls back to the house face until the file lands, so
   nothing is ever invisible while a font loads.

   LAYOUT. It reads its own width (a container query), not the window's: one
   column on a phone, the two type cards side by side and the radii beside
   the spacing from the two-column width up. The board scrolls inside
   whatever frame holds it, and is a focusable region so a keyboard can
   scroll it too.

   ACCESSIBILITY. A region named by the caller (labels.board). Sample text is
   dir="auto", Latin family names, hexes and numbers are isolated, and every
   placeholder and pure sample shape is aria-hidden. */

export interface MoodBoardPalette {
  ground: string;
  ink: string;
  accent: string;
  /** Up to two more the concept named (a micro-label colour, a second
   *  surface), in the order it named them. */
  secondary: string[];
}

export interface MoodBoardTypography {
  /** A Google Fonts family, by its exact name: her name and headings. */
  display: string;
  /** A Google Fonts family, by its exact name: everything a shopper reads. */
  body: string;
}

export interface MoodBoardProduct {
  /** Stable across re-renders (a handle, a peek index), so a card that
   *  gained a photograph does not fade in again. */
  key: string;
  title: string;
  /** Minor units; null when the peek could not read a price. */
  priceMinor: number | null;
  panelColor: string | null;
  panelShape: SketchShape | null;
  /** A photograph (a concept's sample, a peek's real one); null draws the
   *  product panel's silhouette instead. */
  imageUrl: string | null;
}

export interface MoodBoardSource {
  platform: "salla" | "zid" | "shopify";
  name: string | null;
  logoUrl: string | null;
}

export interface MoodBoardModel {
  name: string | null;
  /** True while the name is the model's guess, not one she chose. */
  nameTemporary: boolean;
  /** The two other names the concept offered; empty for none. */
  nameAlternatives: string[];
  /** One sentence about the store, in her language. */
  summary: string | null;
  category: string | null;
  palette: MoodBoardPalette | null;
  typography: MoodBoardTypography | null;
  /** One short line in the store's language: the feeling of the store. */
  mood: string | null;
  /** The wide photograph for the store's opening. */
  heroImageUrl: string | null;
  products: MoodBoardProduct[];
  source: MoodBoardSource | null;
  /** The store's ui language tag ("ar", "en"): direction and digits. */
  locale: string;
  /** ISO 4217, for the prices. */
  currency: string;
}

export interface MoodBoardLabels {
  /** The region's accessible name. */
  board: string;
  /** The chip beside a name the model guessed. */
  tempName: string;
  /** Each swatch's role, under the colour. */
  roles: { ground: string; ink: string; accent: string; secondary: string };
  /** Each family's name on the board: the brand font, the interface font. */
  typeRoles: { display: string; body: string };
  /** What each family is for, under its card. */
  typeUse: { display: string; body: string };
  /** A headline set in the brand font, the way a section title would be. */
  displaySample: string;
  /** One sentence in the interface font, so she sees it as running text. */
  bodySample: string;
  /** The interface font at work: a button and three nav items. */
  interfaceSample: { button: string; nav: [string, string, string] };
  /** The board's section titles. */
  sections: { colors: string; type: string; radius: string; spacing: string };
  /** The last corner-radius sample's name: fully round. */
  radiusFull: string;
}

/* Paper: what the tiles paint before a palette exists. Warm off-white,
   near-black, mid-gray. Literals, because the board's tiles take no tokens,
   and the three clear their own contrast bars as given. */
export const MOOD_BOARD_DEFAULT_PALETTE: MoodBoardPalette = {
  ground: "#f4f2ee",
  ink: "#151515",
  accent: "#6b6b6b",
  secondary: [],
};

const INK_MIN_RATIO = 4.5;
const ACCENT_MIN_RATIO = 3;

/** The palette the board actually paints: the default for null, and ink and
 *  accent pushed through the foundation's rule. The ground never moves; it is
 *  the one value that IS her choice, and the rest is measured against it. */
export function paintedPalette(
  palette: MoodBoardPalette | null,
): MoodBoardPalette {
  const base = palette ?? MOOD_BOARD_DEFAULT_PALETTE;
  return {
    ground: base.ground,
    ink: ensureContrast(base.ink, base.ground, INK_MIN_RATIO),
    accent: ensureContrast(base.accent, base.ground, ACCENT_MIN_RATIO),
    secondary: base.secondary,
  };
}

const FONT_CSS = "https://fonts.googleapis.com/css2";

/* 400 and 700 are on every family the concept may pick (the Arabic set in
   packages/sdk's CONCEPT_FONT_FAMILIES), so one axis value serves the pair:
   the body at 400, the name and the specimen at the display roles' weight,
   which the browser rounds to the nearest file it has. */
const FONT_WEIGHTS = "400;700";

/** The one stylesheet address for exactly the pair, deduplicated when one
 *  family takes both roles; null with no typography. */
export function moodBoardFontsHref(
  typography: MoodBoardTypography | null,
): string | null {
  if (!typography) return null;
  const families = [...new Set([typography.display, typography.body])];
  const named = families.map(
    (family) => `family=${family.replace(/ /g, "+")}:wght@${FONT_WEIGHTS}`,
  );
  return `${FONT_CSS}?${named.join("&")}&display=swap`;
}

/* One <link> per address however many boards show it (the opening's board
   and the deliver dialog's thumbnail show the same pair at once), counted so
   the last board to go takes the stylesheet with it. */
const fontLinks = new Map<string, { link: HTMLLinkElement; users: number }>();

function useFontStylesheet(href: string | null): void {
  React.useEffect(() => {
    if (href === null) return;
    const known = fontLinks.get(href);
    if (known) {
      known.users += 1;
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.slot = "mood-board-font";
      document.head.appendChild(link);
      fontLinks.set(href, { link, users: 1 });
    }
    return () => {
      const entry = fontLinks.get(href);
      if (!entry) return;
      entry.users -= 1;
      if (entry.users > 0) return;
      entry.link.remove();
      fontLinks.delete(href);
    };
  }, [href]);
}

/* Her family first, the house face behind it: what the text is set in until
   the file lands, and for good if it never does. */
function familyStack(family: string, house: "sans" | "display"): string {
  return `"${family}", var(--font-${house})`;
}

/* The store's reading direction: an Arabic store reads right to left
   whatever the shell around the board does. */
function boardDirection(locale: string): "rtl" | "ltr" {
  return locale.startsWith("ar") ? "rtl" : "ltr";
}

/* Glyphs, not copy: a specimen shows both scripts in every studio language,
   which is also why it is not a catalog string (the catalog's Latin-run
   guard would rightly refuse "Aa" in an Arabic line). */
const SPECIMEN_ARABIC = "أب";
const SPECIMEN_LATIN = "Aa";

const ARRIVE =
  "animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none";

const PULSE = "animate-pulse motion-reduce:animate-none";

/* A placeholder on the house page: the quiet skeleton fill. */
function Placeholder({
  slot,
  className,
}: {
  slot: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      data-slot={`mood-board-placeholder-${slot}`}
      className={cn("bg-muted rounded-xl", PULSE, className)}
    />
  );
}

type SwatchRole = "ground" | "ink" | "accent" | "secondary";

/* Her colour behind, a hairline in ink at 20% so a ground swatch still shows
   where it meets the page. An inline shadow because the colour is hers. */
const SWATCH_EDGE =
  "inset 0 0 0 1px color-mix(in oklab, var(--mb-ink) 20%, transparent)";

function Swatch({
  role,
  hex,
  label,
}: {
  role: SwatchRole;
  hex: string;
  label: string;
}): React.JSX.Element {
  return (
    <li
      data-slot="mood-board-swatch"
      data-role={role}
      className="flex w-20 min-w-0 flex-col gap-1.5 @md:w-28"
    >
      <span
        aria-hidden="true"
        className="aspect-square rounded-lg"
        style={{ backgroundColor: hex, boxShadow: SWATCH_EDGE }}
      />
      <span className="text-caption break-words text-foreground">{label}</span>
      <bdi
        data-slot="mood-board-hex"
        className="latin text-caption-quiet text-subtle tabular-nums"
      >
        {hex.toUpperCase()}
      </bdi>
    </li>
  );
}

/* One section of the board: a quiet title over a hairline, the way every
   brand guideline page heads its parts. The house's chrome; only the
   samples under it are hers. */
function BoardSection({
  slot,
  title,
  children,
}: {
  slot: string;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      data-slot={`mood-board-${slot}`}
      className="flex min-w-0 flex-col gap-3"
    >
      <h3 className="border-border text-label text-muted-foreground border-b pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* The corner radii and the spacing scale: generic on purpose, the same for
   every store, painted in her colours so they read as her system. */
const RADII = [0, 8, 16, 9999] as const;
const SPACING = [4, 8, 16, 24, 32, 48] as const;

export function MoodBoard({
  model,
  labels,
  drawing = false,
  className,
}: {
  model: MoodBoardModel;
  labels: MoodBoardLabels;
  /** A stream is still filling the model: missing sections hold their place. */
  drawing?: boolean;
  /** Layout only: how the host sizes and places the board. */
  className?: string;
}): React.JSX.Element {
  const palette = paintedPalette(model.palette);
  const typography = model.typography;
  useFontStylesheet(moodBoardFontsHref(typography));

  const display = typography
    ? { fontFamily: familyStack(typography.display, "display") }
    : undefined;
  const body = typography
    ? { fontFamily: familyStack(typography.body, "sans") }
    : undefined;
  const tiles = {
    "--mb-ground": palette.ground,
    "--mb-ink": palette.ink,
    "--mb-accent": palette.accent,
  } as React.CSSProperties;
  const onGround: React.CSSProperties = {
    backgroundColor: "var(--mb-ground)",
    color: "var(--mb-ink)",
    boxShadow: SWATCH_EDGE,
  };

  const swatches: { role: SwatchRole; hex: string }[] = model.palette
    ? [
        { role: "ground", hex: palette.ground },
        { role: "ink", hex: palette.ink },
        { role: "accent", hex: palette.accent },
        ...palette.secondary
          .slice(0, 2)
          .map((hex) => ({ role: "secondary" as const, hex })),
      ]
    : [];

  return (
    <section
      aria-label={labels.board}
      aria-busy={drawing || undefined}
      data-testid="mood-board"
      dir={boardDirection(model.locale)}
      // A scrolling region has to take focus, or a keyboard cannot
      // scroll it.
      tabIndex={0}
      className={cn(
        "@container size-full overflow-y-auto overscroll-contain bg-background",
        className,
      )}
      style={tiles}
    >
      <div className="flex flex-col gap-6 p-4 @md:gap-8 @md:p-6 @4xl:gap-10 @4xl:p-10">
        {swatches.length > 0 ? (
          <BoardSection slot="palette" title={labels.sections.colors}>
            <ul className={cn("flex flex-wrap gap-3 @md:gap-4", ARRIVE)}>
              {swatches.map((swatch, index) => (
                <Swatch
                  key={`${swatch.role}-${index}`}
                  role={swatch.role}
                  hex={swatch.hex}
                  label={labels.roles[swatch.role]}
                />
              ))}
            </ul>
          </BoardSection>
        ) : drawing ? (
          <Placeholder slot="palette" className="h-32" />
        ) : null}

        {typography ? (
          <BoardSection slot="type" title={labels.sections.type}>
            <div className={cn("grid gap-3 @md:gap-4 @xl:grid-cols-2", ARRIVE)}>
              {/* The brand font: her titles and product sections. */}
              <div
                data-slot="mood-board-brand-font"
                className="flex min-w-0 flex-col gap-4 rounded-xl p-4 @md:p-6"
                style={onGround}
              >
                <span
                  data-slot="mood-board-display-family"
                  className="text-caption"
                  style={{ color: "var(--mb-accent)" }}
                >
                  {labels.typeRoles.display}{" "}
                  <bdi className="latin">{typography.display}</bdi>
                </span>
                <span
                  aria-hidden="true"
                  data-slot="mood-board-specimen"
                  className="text-display-md @4xl:text-display-lg"
                  style={display}
                >
                  <span lang="ar">{SPECIMEN_ARABIC}</span>{" "}
                  <bdi className="latin">{SPECIMEN_LATIN}</bdi>
                </span>
                <p
                  data-slot="mood-board-display-sample"
                  dir="auto"
                  className="text-heading-md"
                  style={display}
                >
                  {labels.displaySample}
                </p>
                <span className="text-caption mt-auto opacity-70">
                  {labels.typeUse.display}
                </span>
              </div>
              {/* The interface font: buttons, body text, the nav. */}
              <div
                data-slot="mood-board-interface-font"
                className="flex min-w-0 flex-col gap-4 rounded-xl p-4 @md:p-6"
                style={{ ...onGround, ...body }}
              >
                <span
                  data-slot="mood-board-body-family"
                  className="text-caption"
                  style={{ color: "var(--mb-accent)" }}
                >
                  {labels.typeRoles.body}{" "}
                  <bdi className="latin">{typography.body}</bdi>
                </span>
                <ul
                  data-slot="mood-board-nav-sample"
                  className="text-body flex flex-wrap gap-x-4 gap-y-1"
                >
                  {labels.interfaceSample.nav.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <span
                  data-slot="mood-board-button-sample"
                  className="text-label self-start rounded-md px-4 py-2"
                  style={{
                    backgroundColor: "var(--mb-accent)",
                    color: monoOn(palette.accent),
                  }}
                >
                  {labels.interfaceSample.button}
                </span>
                <p
                  data-slot="mood-board-body-sample"
                  dir="auto"
                  className="text-body"
                >
                  {labels.bodySample}
                </p>
                <span className="text-caption mt-auto opacity-70">
                  {labels.typeUse.body}
                </span>
              </div>
            </div>
          </BoardSection>
        ) : drawing ? (
          <Placeholder slot="type" className="h-56" />
        ) : null}

        <div className="grid gap-6 @md:gap-8 @xl:grid-cols-2">
          <BoardSection slot="radius" title={labels.sections.radius}>
            <ul className="flex flex-wrap items-end gap-3 @md:gap-4">
              {RADII.map((radius) => (
                <li key={radius} className="flex flex-col items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-14 @md:size-16"
                    style={{
                      ...onGround,
                      borderRadius: radius,
                      boxShadow: "inset 0 0 0 1.5px var(--mb-accent)",
                    }}
                  />
                  <bdi className="latin text-caption-quiet text-subtle tabular-nums">
                    {radius === 9999 ? labels.radiusFull : radius}
                  </bdi>
                </li>
              ))}
            </ul>
          </BoardSection>
          <BoardSection slot="spacing" title={labels.sections.spacing}>
            <ul className="flex flex-col gap-2">
              {SPACING.map((space) => (
                <li key={space} className="flex items-center gap-3">
                  <bdi className="latin text-caption-quiet text-subtle w-6 tabular-nums">
                    {space}
                  </bdi>
                  <span
                    aria-hidden="true"
                    className="h-3 rounded-sm"
                    style={{
                      width: space * 3,
                      backgroundColor: "var(--mb-accent)",
                    }}
                  />
                </li>
              ))}
            </ul>
          </BoardSection>
        </div>
      </div>
    </section>
  );
}

export function MoodBoardThumb({
  model,
  label,
  className,
}: {
  model: MoodBoardModel;
  /** The image's accessible name. */
  label: string;
  /** Layout only. */
  className?: string;
}): React.JSX.Element {
  const palette = paintedPalette(model.palette);
  useFontStylesheet(moodBoardFontsHref(model.typography));
  const photo =
    model.heroImageUrl ??
    model.products.find((product) => product.imageUrl !== null)?.imageUrl ??
    null;
  const initial = model.name ? Array.from(model.name.trim())[0] : undefined;
  const strip = model.palette
    ? [
        palette.ground,
        palette.ink,
        palette.accent,
        ...palette.secondary.slice(0, 2),
      ]
    : [];
  return (
    <div
      role="img"
      aria-label={label}
      data-testid="mood-board-thumb"
      className={cn("flex size-full flex-col overflow-hidden", className)}
      style={{ backgroundColor: palette.ground, color: palette.ink }}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {photo ? (
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : initial ? (
          <span
            dir="auto"
            className="text-heading-sm"
            style={
              model.typography
                ? {
                    fontFamily: familyStack(
                      model.typography.display,
                      "display",
                    ),
                  }
                : undefined
            }
          >
            {initial}
          </span>
        ) : null}
      </div>
      {strip.length > 0 ? (
        <div className="flex h-3 shrink-0">
          {strip.map((hex, index) => (
            <span
              key={`${hex}-${index}`}
              className="flex-1"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
