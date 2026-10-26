/** WCAG 2.1 relative-luminance / contrast math on sRGB hex. */
interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const part = (n: number): string =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(rgb: Rgb): number {
  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  );
}

/**
 * Whether text and marks sitting on `color` need to be light to be seen.
 *
 * Same luminance math the token guard runs on, exposed because an uploaded
 * logo cannot be pushed along a lightness axis the way a token can: the brand
 * layer can only ask which way a background leans and put a backdrop behind the
 * mark when it leans the same way the mark does. Unparseable colours report
 * light, matching the default near-white canvas.
 */
export function isDarkColor(color: string): boolean {
  const rgb = parseHex(color);
  if (!rgb) return false;
  return luminance(rgb) < 0.5;
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return 21; // Unparseable (a named colour or gradient): don't touch it.
  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

function mix(color: Rgb, target: Rgb, amount: number): Rgb {
  return {
    r: color.r + (target.r - color.r) * amount,
    g: color.g + (target.g - color.g) * amount,
    b: color.b + (target.b - color.b) * amount,
  };
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/**
 * `amount` of `target` composited over `color`, as an exact hex.
 *
 * Exported because a clamp is only real when it runs against the colour that
 * actually renders, and two things in the panel renderer are composites rather
 * than flat fills: the gradient's second stop, and the white highlight over it.
 * Computing them here instead of leaving them to CSS `color-mix()` is the same
 * argument a renderer uses for the panel colour itself.
 */
export function blend(color: string, target: string, amount: number): string {
  const a = parseHex(color);
  const b = parseHex(target);
  if (!a || !b) return color;
  return toHex(mix(a, b, amount));
}

/**
 * Return `foreground` unchanged when it already clears `minRatio` against
 * `background`, otherwise the nearest version of it that does. The colour is
 * pushed away from the background's own luminance (dark bg pushes toward
 * white, light bg toward black) in small steps, so the result keeps as much of
 * the original hue as the ratio allows.
 *
 * "Away from the background" is a preference, not the guarantee, and a MID-TONE
 * background is where the two come apart. A luminance test says a mid gold like
 * #C8A24B is dark and so wants white text, but white on it reaches only 2.41:1
 * while black reaches 8.7:1. That is not hypothetical: it shipped a 2.41:1 badge
 * on a gold card the moment the palette was free enough to pick a mid-tone
 * brand. So when the preferred direction cannot reach the ratio, the other one is
 * tried before giving up.
 */
export function ensureContrast(
  foreground: string,
  background: string,
  minRatio: number,
): string {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return foreground;
  if (contrastRatio(foreground, background) >= minRatio) return foreground;

  const preferred = luminance(bg) < 0.5 ? WHITE : BLACK;
  let best = foreground;
  let bestRatio = contrastRatio(foreground, background);
  for (const target of [preferred, preferred === WHITE ? BLACK : WHITE]) {
    for (let step = 1; step <= 20; step += 1) {
      const hex = toHex(mix(fg, target, step / 20));
      const ratio = contrastRatio(hex, background);
      if (ratio >= minRatio) return hex;
      if (ratio > bestRatio) {
        best = hex;
        bestRatio = ratio;
      }
    }
  }
  // Unreachable in either direction: return whichever end got closest.
  return best;
}

/**
 * CIE L*, perceptual lightness on 0..100.
 *
 * Separation between two adjacent LAYERS is a different question from
 * legibility of text on one, and the WCAG ratio answers it badly: two near-white
 * tones a clearly visible step apart score 1.04, while two near-black tones an
 * invisible step apart score 1.10. Ranking layer pairs by that ratio gets the
 * order backwards, which is measurable on real runs. L* is uniform, so one
 * threshold means the same thing on a white page and a black one.
 */
export function lightness(color: string): number {
  const rgb = parseHex(color);
  if (!rgb) return 0;
  const y = luminance(rgb);
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (y * 24389) / 27;
}

/** Perceptual lightness distance between two colours, in L* points. */
export function lightnessDelta(a: string, b: string): number {
  return Math.abs(lightness(a) - lightness(b));
}

/**
 * Return `layer` unchanged when it is already at least `minDelta` L* points
 * from `against`, otherwise the nearest version of it that is.
 *
 * Same shape as ensureContrast, different guarantee: this one is about being
 * able to SEE the edge between two stacked surfaces, not about reading text on
 * one. The existing offset is preferred where there is one (a card lighter than
 * its page stays lighter), because flipping it inverts the raised or recessed
 * reading of a design; an exactly-degenerate pair moves away from the
 * background's own lightness. That is a preference and not a rule: near either
 * end of the range the preferred direction can run out of room, and then the
 * delta matters more than which side of the page the card sits on.
 */
export function ensureSeparation(
  layer: string,
  against: string,
  minDelta: number,
): string {
  const a = parseHex(layer);
  const b = parseHex(against);
  if (!a || !b) return layer;
  if (lightnessDelta(layer, against) >= minDelta) return layer;

  const layerL = lightness(layer);
  const againstL = lightness(against);
  const preferLighter = layerL === againstL ? againstL < 50 : layerL > againstL;

  let best = layer;
  let bestDelta = lightnessDelta(layer, against);
  for (const target of preferLighter ? [WHITE, BLACK] : [BLACK, WHITE]) {
    for (let step = 1; step <= 20; step += 1) {
      const hex = toHex(mix(a, target, step / 20));
      const delta = lightnessDelta(hex, against);
      if (delta >= minDelta) return hex;
      if (delta > bestDelta) {
        best = hex;
        bestDelta = delta;
      }
    }
  }
  // Unreachable in either direction (both layers pinned at the same extreme).
  return best;
}

/**
 * Pure white or pure black, whichever reads better on `ground`.
 *
 * The mark a brand puts on a colour it did not choose (a logo on a sampled
 * ground, a silhouette on a product panel) can only be one of two things, and
 * the theme's own ink would be a recolour. Measured both ways instead of
 * thresholding the ground's lightness, for the reason ensureContrast spells
 * out: a mid-tone gold reads as dark to a luminance test while black on it
 * beats white by three times over.
 */
export function monoOn(ground: string): string {
  return contrastRatio("#ffffff", ground) >= contrastRatio("#000000", ground)
    ? "#ffffff"
    : "#000000";
}
