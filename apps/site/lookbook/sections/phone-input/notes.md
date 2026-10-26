# Phone input

Input + Select, joined: the country picker rides the input's
`leadingControl` slot, so there is one border, one focus ring, and one
40px control instead of a field with a dropdown parked beside it.

## The contract

`value` and `onChange` speak E.164 (`+9665XXXXXXXX`) and nothing else.
National digits, the trunk 0, and the country code are the component's
problem. An empty field is `""`, never a bare `+966`, so a caller can
test truthiness without special-casing the prefix.

Validate on submit with `isValidE164(value, country)` from
`@sirdab/one/lib/phone`. Saudi is held to the exact mobile shape
(`5XXXXXXXX`) because the OTP gateway and the customer dedupe key both
run on it; every other country is a length range, deliberately. A
per-operator regex goes stale the week a regulator opens a new prefix,
and rejecting a real number is worse than accepting a typo the SMS
gateway will bounce.

## Digits and direction

A phone number is an identifier, so the numerals rule applies twice
over: the digits are always Latin (Arabic-Indic input is converted on
the way in), and the BOX does not mirror. `dir="ltr"` sits on the whole
control, so in Arabic the country code still leads and the digits still
read left to right, which is how a Saudi reads their own number off a
card. The picker's PANEL is portalled and keeps the document direction,
so the country list reads right to left like every other menu.

## Flags

The flag is the emoji derived from the ISO alpha-2 code as a regional
indicator pair. No image assets, no icon package. It is decorative
(`aria-hidden`) and the dial code renders beside it always, so a
platform with no flag glyphs still reads `+966` and the panel still
names the country. There is no feature detection, so nothing flashes
away after hydration.

## The list

Eleven countries, Saudi first: the GCC plus the handful our merchants
actually dial from. An exhaustive dataset is a hundred kilobytes to make
someone scroll past Vanuatu on their way to Saudi. Adding one is a data
line in `src/lib/phone.ts`, not a code change.

Country NAMES come from `Intl.DisplayNames` on the caller's locale, so
the primitive stays i18n-free: it carries no copy, and the platform
already ships the names in every locale we serve.
