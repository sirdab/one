/** Western digits for values in every locale; identifiers stay bidi-isolated. */

import { formatPrice, type Locale } from "./money";

export type { Locale } from "./money";

/** LTR isolate marks. Wrap any digit run embedded in RTL prose. */
const LRI = "\u2066";
const PDI = "\u2069";

// ──────────────────────────────────────────────────────────── values

/**
 * Any BCP 47 tag pinned to Western digits: "ar-SA" becomes
 * "ar-SA-u-nu-latn". For an Intl call that cannot route through
 * formatValue (a date, a relative time, a picker's clock): ar-SA and bare
 * "ar" default to the `arab` numbering system in most engines, so an
 * unpinned Arabic formatter is how a ٣ gets back onto the page.
 */
export function westernLocale(locale: string): string {
  return new Intl.Locale(locale, { numberingSystem: "latn" }).toString();
}

/**
 * Numbers the user reads as quantities: counts, percentages, ratings.
 * The locale still decides grouping and the percent sign, never the digits.
 */
export function formatValue(
  n: number,
  locale: Locale = "ar-SA",
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(westernLocale(locale), options).format(n);
}

// Price formatting and parsing live in ./money.

// ─────────────────────────────────────────────────────── identifiers

/**
 * Anything matched against the outside world. Forced to Western digits
 * and bidi-isolated so it cannot reorder the sentence around it.
 *
 * Use for: order IDs, SKUs, barcodes, tracking numbers, phone numbers,
 * IBANs, card last-4, coupon codes, OTPs, VAT/CR numbers, postal codes,
 * building numbers, version strings.
 */
export function formatIdentifier(value: string | number): string {
  return `${LRI}${toWesternDigits(String(value))}${PDI}`;
}

// ─────────────────────────────────────────────────────── normalisation

const ARABIC_INDIC = /[\u0660-\u0669]/g; // ٠-٩  Arabic-Indic
const EXTENDED = /[\u06F0-\u06F9]/g; // ۰-۹  Extended (Persian/Urdu)

/**
 * Convert any digit form to Western. Call this on EVERY numeric input
 * before validating or querying: Saudi keyboards produce either form,
 * and a search for order ٢٤٩ must find order 249.
 */
export function toWesternDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EXTENDED, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** True if the string contains any non-Western digit form. */
export function hasLocalisedDigits(input: string): boolean {
  // Non-global copies: a /g regex shares lastIndex between .test() calls,
  // so reusing ARABIC_INDIC here would alternate true/false on repeat calls.
  return /[\u0660-\u0669\u06F0-\u06F9]/.test(input);
}

// ────────────────────────────────────────────────────────── field map

/**
 * Single source of truth for which formatter each field takes. Keeping this as data
 * rather than scattered call sites is what stops the rule eroding, the
 * same reason the spacing scale needs a lint rule.
 */
export const FIELD_KIND = {
  // money → formatPrice (minor units in, riyal sign, fixed decimals)
  price: "money",
  subtotal: "money",
  tax: "money",
  shipping: "money",
  total: "money",

  // plain numbers, locale grouping
  quantity: "count",
  count: "count",
  rating: "count",
  weight: "count",

  // 0.2 → 20٪ in ar, 20% in en (the stored ratio, not a pre-multiplied number)
  percentage: "percent",

  // timestamps/Date → Intl.DateTimeFormat, never raw numbers
  date: "date",
  time: "time",

  // matched → raw string, isolated
  orderId: "identifier",
  sku: "identifier",
  barcode: "identifier",
  trackingNumber: "identifier",
  phone: "identifier",
  iban: "identifier",
  cardLast4: "identifier",
  couponCode: "identifier",
  otp: "identifier",
  vatNumber: "identifier",
  crNumber: "identifier",
  postalCode: "identifier",
  buildingNumber: "identifier",
  invoiceNumber: "identifier",
  version: "identifier",
} as const;

export type FieldName = keyof typeof FIELD_KIND;

/** Format by field name so the decision lives in one place. Each kind
 * routes to its REAL formatter: money keeps the riyal sign and fixed
 * decimals, percent multiplies and adds the sign, date/time go through
 * Intl.DateTimeFormat. A kind map that localised money as a bare number
 * was a single source of truth that was mostly wrong. */
export function formatField(
  field: FieldName,
  value: string | number | Date,
  locale: Locale = "ar-SA",
): string {
  switch (FIELD_KIND[field]) {
    case "identifier":
      return formatIdentifier(value as string | number);
    case "money":
      return formatPrice(Number(value), { locale });
    case "percent":
      return formatValue(Number(value), locale, { style: "percent" });
    case "date":
      return new Intl.DateTimeFormat(westernLocale(locale)).format(
        new Date(value),
      );
    case "time":
      return new Intl.DateTimeFormat(westernLocale(locale), {
        timeStyle: "short",
      }).format(new Date(value));
    default:
      return formatValue(Number(value), locale);
  }
}
