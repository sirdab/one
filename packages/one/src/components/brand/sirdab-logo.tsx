import { cn } from "../../lib/utils";

/**
 * The Sirdab mark and lockup.
 *
 * Everything here is outlined SVG, wordmark included: the logotype is drawn
 * letterforms, not a typeface, so there is no font to load and nothing to
 * swap on first paint. That also keeps it byte-for-shape with the favicon
 * and the app icon, which an OS caches and cannot load a webfont for.
 *
 * Colour comes from --logo-teal / --logo-ink / --logo-paper through the
 * `.sirdab-mark` class and its `data-tone`, which are the brand's literals
 * and NOT the product palette. See the LOGO section of foundation.css before
 * reaching for them anywhere else.
 */

/** The mark's outline, in its native 95.44 x 50.16 box. */
const MARK_PATH =
  "M95.44.54v33.76c0,8.76-7.1,15.86-15.87,15.86H.41c-.23,0-.41-.18-.41-.41V.54C0,.24.24,0,.54,0h12.64c.3,0,.54.24.54.54v35.98h.01s27.12.01,27.12.01V.54c0-.3.24-.54.54-.54h12.65c.3,0,.54.24.54.54v35.76c.07.14.2.22.36.22h26.46c.23,0,.41-.18.41-.41V.54c0-.3.24-.54.54-.54h12.55c.3,0,.54.24.54.54Z";

/** "Sirdab", the Latin logotype, placed in the lockup's 181.87 x 50.3 box. */
const LATIN_PATHS = [
  "M108.5,47.12l2.4-2.5c1.3,1.28,2.83,1.89,4.77,1.89,1.61,0,2.63-.71,2.63-1.86,0-1.02-.82-1.81-2.22-2.09l-2.14-.51c-2.98-.64-4.77-2.6-4.77-5.31,0-3.11,2.88-5.64,6.38-5.64,2.17,0,4.08.74,5.69,2.27l-2.27,2.6c-1.02-.97-2.12-1.4-3.39-1.4-1.63,0-2.78.82-2.78,1.94s.66,1.79,1.86,1.99l2.19.54c3.16.66,5.05,2.65,5.05,5.38,0,3.19-2.63,5.56-6.22,5.56-2.76,0-5.1-.94-7.17-2.86Z",
  "M124.16,33.19c0-1.3,1.05-2.37,2.35-2.37s2.27,1.07,2.3,2.37c.03,1.2-1.05,2.32-2.3,2.32s-2.35-1.02-2.35-2.32ZM124.75,37.35h3.5v12.25h-3.5v-12.25Z",
  "M132.05,37.35h2.04l.38.89c1.07-.79,2.4-1.28,3.85-1.28.43,0,.87.05,1.3.1v3.16c-.33-.08-.59-.15-1.3-.15-1.53,0-2.81,1.35-2.81,2.96v6.56h-3.47v-12.25Z",
  "M140.95,43.55c0-3.85,2.55-6.58,6.15-6.58.97,0,1.84.2,2.63.56v-6.43h3.47v18.5h-2.04l-.33-.82c-1.02.77-2.3,1.2-3.73,1.2-3.6,0-6.15-2.65-6.15-6.43ZM149.73,43.55c0-2.17-1.07-3.47-2.63-3.47s-2.68,1.3-2.68,3.47,1.05,3.32,2.68,3.32,2.63-1.22,2.63-3.32Z",
  "M155.93,46.08c0-2.3,1.86-3.72,4.8-3.72h2.17v-.51c0-1.05-.13-1.76-1.4-1.76-1.17,0-2.3.31-3.24,1.4l-1.94-2.07c1.43-1.66,2.96-2.45,5.18-2.45,3.19,0,4.72,1.45,4.87,4.87v7.76h-2.04l-.25-.64c-1,.66-2.22,1.02-3.57,1.02-2.65,0-4.57-1.48-4.57-3.9ZM162.89,44.9h-2.19c-1.4,0-1.68.48-1.68,1.17,0,.87.28,1.35,1.45,1.35,1.25,0,2.4-.51,2.42-2.53Z",
  "M172,48.78l-.33.82h-2.04v-18.5h3.47v6.43c.79-.36,1.66-.56,2.63-.56,3.6,0,6.15,2.73,6.15,6.58s-2.55,6.43-6.15,6.43c-1.43,0-2.7-.43-3.73-1.2ZM178.4,43.55c0-2.17-1.07-3.47-2.68-3.47s-2.63,1.3-2.63,3.47,1.02,3.32,2.63,3.32,2.68-1.22,2.68-3.32Z",
] as const;

/** "سرداب", the Arabic logotype, placed in the lockup's 181.87 x 50.3 box. */
const ARABIC_PATHS = [
  "M108.62,11.66c0-2.15.76-4.06,2.1-5.42l2.28,2.65c-.52.84-.81,1.6-.81,2.78,0,2.23,1.31,3.64,3.27,3.64h5.53c2.49,0,3.14-.68,3.22-3.51v-5.5h3.56v5.5c-.08,5.69-1.41,7.07-6.79,7.07h-5.53c-3.98,0-6.84-3.01-6.84-7.2ZM117.26,22.77c0-.94.76-1.73,1.73-1.73s1.73.81,1.73,1.73c0,1-.76,1.78-1.73,1.78s-1.73-.79-1.73-1.78Z",
  "M132.41,0h3.56v18.86h-3.56V0Z",
  "M140.19,15.3h7.55v-2.44c-.05-1.65-1.52-3.01-3.28-3.01-.81,0-1.18,0-1.75.05v-3.56c.73-.05.94-.05,1.75-.05,3.67,0,6.73,2.88,6.84,6.44v6.13h-11.11v-3.56Z",
  "M149.78,24.18l1.21-3.04c.55.24.89.29,1.49.29,1.28,0,2.1-1.18,2.1-3.12V6.29h3.56v9.01h2.62v3.56h-2.65c-.21,3.75-2.28,5.97-5.58,5.97-.84,0-1.75-.21-2.75-.66Z",
  "M160.63,15.3h.45c2.49,0,3.14-.68,3.22-3.51v-4.06h3.56v4.06c-.03,1.41-.13,2.57-.34,3.51h.47c2.49,0,3.14-.68,3.22-3.51v-4.06h3.56v4.06c-.03,1.41-.13,2.57-.34,3.51h.42c2.49,0,3.14-.68,3.22-3.51v-5.5h3.56v5.5c-.08,5.69-1.42,7.07-6.79,7.07h-1.52l-.45-1c-1.02.73-2.59,1-4.9,1h-1.52l-.45-1.02c-1.05.76-2.62,1.02-4.95,1.02h-.45v-3.56Z",
] as const;

/**
 * Which of the logo's three colours to paint with. `brand` is the teal the
 * mark was drawn in; `ink` is the guidelines' navy and flips to paper in
 * dark; `paper` is for a mark sitting on a brand or dark ground.
 */
export type SirdabLogoTone = "brand" | "ink" | "paper";

export type SirdabMarkProps = React.ComponentProps<"svg"> & {
  tone?: SirdabLogoTone;
};

/** The mark alone: three pillars and the rounded corner. */
export function SirdabMark({
  tone = "brand",
  className,
  ...props
}: SirdabMarkProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 95.44 50.16"
      aria-hidden="true"
      data-tone={tone}
      // The fill reads a class-scoped token rather than a Tailwind utility
      // so it paints in bundles that never scan this package. See the LOGO
      // section of foundation.css.
      fill="var(--logo-fill)"
      className={cn("sirdab-mark shrink-0", className)}
      {...props}
    >
      <path d={MARK_PATH} />
    </svg>
  );
}

export type SirdabLogoScript = "bilingual" | "latin" | "arabic";

export type SirdabLogoProps = React.ComponentProps<"svg"> & {
  tone?: SirdabLogoTone;
  /**
   * Which logotype sits beside the mark. The official lockup is bilingual
   * (Arabic above, Latin below); pass a single script where the surrounding
   * page is firmly one language and the stacked pair would read as noise.
   */
  script?: SirdabLogoScript;
  /** An accessible name for the image; omit where a visible label sits next to it. */
  title?: string;
};

/* In the bilingual lockup the Arabic sits on top (y 0-24) and the Latin
   below (y 30-50). A single-script lockup centres that one logotype on the
   mark instead of leaving it hugging one edge. */
const LATIN_ALONE = "translate(0 -15)";
const ARABIC_ALONE = "translate(0 13)";

/**
 * Mark + logotype, the standard horizontal lockup. Size is inherited from
 * the caller through `className` (height, width), deliberately: the lockup
 * sits at a different size in the rail, the navbar and the footer, and none
 * of them is a type role, so there is no token to reach for.
 */
export function SirdabLogo({
  tone = "brand",
  script = "bilingual",
  title,
  className,
  ...props
}: SirdabLogoProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 181.87 50.3"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      data-tone={tone}
      fill="var(--logo-fill)"
      className={cn("sirdab-mark shrink-0", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {/* The lockup's mark sits 0.14 lower than the standalone mark's box. */}
      <path d={MARK_PATH} transform="translate(0 0.14)" />
      {script === "arabic" ? null : (
        <g transform={script === "latin" ? LATIN_ALONE : undefined}>
          {LATIN_PATHS.map((d) => (
            <path key={d.slice(0, 12)} d={d} />
          ))}
        </g>
      )}
      {script === "latin" ? null : (
        <g transform={script === "arabic" ? ARABIC_ALONE : undefined}>
          {ARABIC_PATHS.map((d) => (
            <path key={d.slice(0, 12)} d={d} />
          ))}
        </g>
      )}
    </svg>
  );
}
