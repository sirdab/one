import type { FieldName, Locale, PriceOptions } from "@sirdab/one/foundation";

type KnownField<T extends FieldName> = T;

export type QuantityField = KnownField<"quantity">;
// @ts-expect-error Unrecognised fields must not become accepted through missing declarations.
export type UnknownField = KnownField<"not-a-foundation-field">;

export const foundationLocale: Locale = "ar-SA";
export const foundationPriceOptions: PriceOptions = {
  locale: foundationLocale,
};
