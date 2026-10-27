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

export function isDarkColor(color: string): boolean {
  const rgb = parseHex(color);
  if (!rgb) return false;
  return luminance(rgb) < 0.5;
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return 21;
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

export function blend(color: string, target: string, amount: number): string {
  const a = parseHex(color);
  const b = parseHex(target);
  if (!a || !b) return color;
  return toHex(mix(a, b, amount));
}

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

  return best;
}

export function lightness(color: string): number {
  const rgb = parseHex(color);
  if (!rgb) return 0;
  const y = luminance(rgb);
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (y * 24389) / 27;
}

export function lightnessDelta(a: string, b: string): number {
  return Math.abs(lightness(a) - lightness(b));
}

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

  return best;
}

export function monoOn(ground: string): string {
  return contrastRatio("#ffffff", ground) >= contrastRatio("#000000", ground)
    ? "#ffffff"
    : "#000000";
}
