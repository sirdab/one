import { formatPrice, type Locale } from "./money";

export type { Locale } from "./money";

const LRI = "\u2066";
const PDI = "\u2069";

export function westernLocale(locale: string): string {
  return new Intl.Locale(locale, { numberingSystem: "latn" }).toString();
}

export function formatValue(
  n: number,
  locale: Locale = "ar-SA",
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(westernLocale(locale), options).format(n);
}

export function formatIdentifier(value: string | number): string {
  return `${LRI}${toWesternDigits(String(value))}${PDI}`;
}

const ARABIC_INDIC = /[\u0660-\u0669]/g;
const EXTENDED = /[\u06F0-\u06F9]/g;

export function toWesternDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EXTENDED, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export function hasLocalisedDigits(input: string): boolean {
  return /[\u0660-\u0669\u06F0-\u06F9]/.test(input);
}

export const FIELD_KIND = {
  price: "money",
  subtotal: "money",
  tax: "money",
  shipping: "money",
  total: "money",

  quantity: "count",
  count: "count",
  rating: "count",
  weight: "count",

  percentage: "percent",

  date: "date",
  time: "time",

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
