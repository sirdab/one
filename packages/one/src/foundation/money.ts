export type Locale = "ar-SA" | "en-SA" | "en-US";

export function numeralLocale(locale: string): Locale {
  return locale.startsWith("ar") ? "ar-SA" : "en-US";
}

export const RIYAL = "\u20C1";

const LRI = "\u2066";
const PDI = "\u2069";

const TWO_DECIMALS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export type PriceNumerals = "localised" | "western";

export interface PriceOptions {
  numerals?: PriceNumerals;

  locale?: string;

  currency?: string;

  symbol?: boolean;
}

export function formatPrice(minor: number, options: PriceOptions = {}): string {
  const {
    locale = "ar-SA",
    currency = "SAR",
    symbol = true,
    numerals = "western",
  } = options;
  const base: Locale = numeralLocale(locale);
  const tag: string = numerals === "localised" ? base : `${base}-u-nu-latn`;
  const amount = minor / 100;
  if (!symbol) return new Intl.NumberFormat(tag, TWO_DECIMALS).format(amount);
  if (currency !== "SAR") {
    const n = new Intl.NumberFormat(tag, {
      style: "currency",
      currency,
    }).format(amount);
    return `${LRI}${n}${PDI}`;
  }
  const n = new Intl.NumberFormat(tag, TWO_DECIMALS).format(amount);
  return `${LRI}${RIYAL} ${n}${PDI}`;
}

export function formatMinor(minor: number): string {
  const rounded = Math.round(minor);
  const abs = Math.abs(rounded);
  const body = `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
  return rounded < 0 ? `-${body}` : body;
}

const ARABIC_INDIC_DIGIT = /[٠-٩]/g;
const EXTENDED_DIGIT = /[۰-۹]/g;

export function toMinor(value: string): number | null {
  const western = value
    .replace(ARABIC_INDIC_DIGIT, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EXTENDED_DIGIT, (d) => String(d.charCodeAt(0) - 0x06f0))
    .trim();
  if (western === "") return null;
  const major = Number(western);
  if (!Number.isFinite(major) || major < 0) return null;
  return Math.round(major * 100);
}
