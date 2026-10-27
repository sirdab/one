import type { Locale as NumeralLocale } from "@sirdab/one/foundation";

export function toNumeralLocale(locale: string): NumeralLocale {
  return locale === "ar" ? "ar-SA" : "en-US";
}
