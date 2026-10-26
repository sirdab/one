/** Money uses integer halalas upstream; formatting converts them to riyals. */

export type Locale = "ar-SA" | "en-SA" | "en-US";

/**
 * Map a ui language tag onto the numeral locale.
 *
 * Only Arabic gets the Arabic locale (its minus mark, its percent sign, its
 * words around a non-riyal currency); fr and tr read exactly like en. The
 * digits are Western in all three, pinned by formatPrice below. This lives
 * here because every surface that formats a number needs it, and three
 * hand-rolled copies had already drifted apart.
 */
export function numeralLocale(locale: string): Locale {
  return locale.startsWith("ar") ? "ar-SA" : "en-US";
}

/** U+20C1 SAUDI RIYAL SIGN (Unicode 17.0, September 2025). */
export const RIYAL = "\u20C1";

/** LTR isolate marks. Wrap any digit run embedded in RTL prose. */
const LRI = "\u2066";
const PDI = "\u2069";

const TWO_DECIMALS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

/** Western is the default; localised preserves existing caller intent. */
export type PriceNumerals = "localised" | "western";

export interface PriceOptions {
  numerals?: PriceNumerals;
  /** Any ui language tag ("ar", "en-SA", "fr"). */
  locale?: string;
  /** ISO 4217. SAR gets the riyal sign; anything else uses Intl's symbol. */
  currency?: string;
  /** Drop the sign, e.g. under a column header that already carries it. */
  symbol?: boolean;
}

/**
 * A price with the riyal sign, in Western digits in every locale.
 *
 * Western digits are the default across Sirdab interfaces. Existing callers
 * can explicitly request localised digits.
 *
 * SAMA guidance puts the symbol to the LEFT of the number with a space,
 * in BOTH text directions: it does not mirror in RTL, which is the
 * opposite of what the bidi algorithm would do unaided. Hence the
 * isolate wrapper.
 *
 * The symbol is applied manually because CLDR 48 still lists U+20C1 as
 * an *alternative* currency symbol, so Intl with currency:'SAR' returns
 * ر.س or SAR instead.
 */
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

/**
 * Digits only: "1234.50". Western digits, no grouping, no currency, no
 * isolate. For anything a machine parses (CSV cells, API payloads, model
 * tool summaries) rather than a person reads. Integer arithmetic so a
 * large halala count never picks up float noise on the way to text.
 */
export function formatMinor(minor: number): string {
  const rounded = Math.round(minor);
  const abs = Math.abs(rounded);
  const body = `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
  return rounded < 0 ? `-${body}` : body;
}

/* Saudi keyboards can emit Arabic-Indic or Persian/Urdu digits. */
const ARABIC_INDIC_DIGIT = /[٠-٩]/g; // ٠-٩
const EXTENDED_DIGIT = /[۰-۹]/g; // ۰-۹

/**
 * Riyals as typed into a field, back to halalas: the inverse of
 * `formatMinor` for a person's input. Either digit form (Number() reads
 * ٤٩ as NaN, and a Saudi keyboard types it), whitespace trimmed, rounded
 * to the halala. Null for anything that is not a non-negative number, an
 * empty field included: Number("") is 0, and a blank price must never
 * read as free.
 */
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
