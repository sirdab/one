import type { Locale as NumeralLocale } from "@sirdab/one/foundation";

/* The numeral layer's locale codes, shared by the sections that format
   values (was triplicated across numerals, tables, and filter-chip). */
export function toNumeralLocale(locale: string): NumeralLocale {
  return locale === "ar" ? "ar-SA" : "en-US";
}
