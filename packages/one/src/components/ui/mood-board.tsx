"use client";

import * as React from "react";

import { ensureContrast, monoOn } from "@sirdab/one/foundation";

import { cn } from "../../lib/utils";
import type { SketchShape } from "./product-panel";

export interface MoodBoardPalette {
  ground: string;
  ink: string;
  accent: string;

  secondary: string[];
}

export interface MoodBoardTypography {
  display: string;

  body: string;
}

export interface MoodBoardProduct {
  key: string;
  title: string;

  priceMinor: number | null;
  panelColor: string | null;
  panelShape: SketchShape | null;

  imageUrl: string | null;
}

export interface MoodBoardSource {
  platform: "salla" | "zid" | "shopify";
  name: string | null;
  logoUrl: string | null;
}

export interface MoodBoardModel {
  name: string | null;

  nameTemporary: boolean;

  nameAlternatives: string[];

  summary: string | null;
  category: string | null;
  palette: MoodBoardPalette | null;
  typography: MoodBoardTypography | null;

  mood: string | null;

  heroImageUrl: string | null;
  products: MoodBoardProduct[];
  source: MoodBoardSource | null;

  locale: string;

  currency: string;
}

export interface MoodBoardLabels {
  board: string;

  tempName: string;

  roles: { ground: string; ink: string; accent: string; secondary: string };

  typeRoles: { display: string; body: string };

  typeUse: { display: string; body: string };

  displaySample: string;

  bodySample: string;

  interfaceSample: { button: string; nav: [string, string, string] };

  sections: { colors: string; type: string; radius: string; spacing: string };

  radiusFull: string;
}

export const MOOD_BOARD_DEFAULT_PALETTE: MoodBoardPalette = {
  ground: "#f4f2ee",
  ink: "#151515",
  accent: "#6b6b6b",
  secondary: [],
};

const INK_MIN_RATIO = 4.5;
const ACCENT_MIN_RATIO = 3;

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

const FONT_WEIGHTS = "400;700";

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

function familyStack(family: string, house: "sans" | "display"): string {
  return `"${family}", var(--font-${house})`;
}

function boardDirection(locale: string): "rtl" | "ltr" {
  return locale.startsWith("ar") ? "rtl" : "ltr";
}

const SPECIMEN_ARABIC = "أب";
const SPECIMEN_LATIN = "Aa";

const ARRIVE =
  "animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none";

const PULSE = "animate-pulse motion-reduce:animate-none";

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

  drawing?: boolean;

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

  label: string;

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
