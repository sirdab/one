# Numerals notes

Not rendered. The gallery page shows; this file explains. Formatter
usage stays canonical in the foundation's `numerals.ts`.

## Doctrine

Western digits for every number, in every locale (a Sirdab ruling,
2026-10-03): the studio reads the same 0123 the checkout shows the
shopper. Switch the locale toggle and watch the words around the numbers
change while the digits stay put.

Values: prices, counts, percentages, dates. They keep their locale's
grouping, percent sign and words. The riyal sign (U+20C1) sits to the
LEFT of the number in both directions per SAMA guidance. It does not
flip in RTL.

Identifiers: anything matched against the outside world: order IDs,
SKUs, tracking, phone, IBAN, OTP. Typed digits fold to Western, and the
string is bidi-isolated so it cannot reorder the sentence around it.

Tabular alignment: price columns use the four type longhands plus
tabular figures. The `font:` shorthand would silently reset them.

## Usage

```tsx
import {
  formatIdentifier,
  formatPrice,
  formatValue,
} from "@sirdab/one/foundation";
```
