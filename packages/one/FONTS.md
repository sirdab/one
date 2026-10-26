# Fonts we redistribute

Type stacks and the reasoning behind them live in `src/foundation.css` and
`packages/ui/src/fonts.ts`. This file is only about provenance: which font
files ship inside our bundles, where they came from, and what we know about
their licenses. Google-hosted families (Inter, IBM Plex Sans Arabic) are fetched from
fonts.googleapis.com at runtime and are not redistributed by us, so they are
not listed here.

## SaudiRiyal (`saudi-riyal.woff2` / `.woff`)

- **What**: a single-glyph face carrying U+20C1 SAUDI RIYAL SIGN, loaded
  with `unicode-range: U+20C1` so it only ever paints the riyal symbol.
- **Where it ships**: `packages/ui/public/fonts/`; each consuming app
  copies the two files into its own `public/fonts/` so the `@font-face` in
  `foundation.css` resolves (`/fonts/saudi-riyal.woff2`).
- **Origin**: the font's own name table says family `saudi_riyal`, style
  `regular`, copyright and designer "Emran Alhaddad", vendor URL
  `github.com/emran-alhaddad`. That matches the public Saudi-Riyal-Font
  repository under that account.
- **License**: the author's own rewrite of the SIL Open Font License 1.1
  (OFL preamble and intent, seven renumbered conditions, an added
  attribution requirement, no reserved-name mechanism), confirmed
  2026-09-08 against the upstream repository
  (`github.com/emran-alhaddad/Saudi-Riyal-Font`, `LICENSE.txt`, npm
  `@emran-alhaddad/saudi-riyal-font` 1.1.0). The exact text we accepted
  is vendored at `licenses/saudi-riyal-font-LICENSE.txt` next to this
  file, so a later upstream edit cannot change what we agreed to. Our `saudi-riyal.woff2` is
  byte-identical to upstream `fonts/regular/saudi_riyal.woff2` (sha256
  `c15a031a5a2fdee1…`, font version 2), so we ship the Original Version,
  not a Modified Version; the `SaudiRiyal` family name is a CSS alias in
  our `@font-face`, the file's own name table is untouched. Upstream also
  publishes a bold weight we do not ship; the file's name table still
  carries no license fields, the terms live in the repository.
- **What the license lets us do**: the OFL allows the font to be bundled,
  embedded and redistributed with software, including sold software, as
  long as the font is never sold on its own and stays under the OFL. The
  author's added condition is credit: every use, modification or
  distribution "must include a clear and visible attribution to the
  original creator, Emran Alhaddad", in the project files or a visible
  credits section. Nothing in it restricts commercial use or the number
  of sites the font is served from.
- **How we comply**: the attribution line below sits in this file and in
  the `@font-face` comment in `src/foundation.css`. Keep the two in step
  when the declaration moves.

  > Saudi Riyal Font © Emran Alhaddad - Used under SIL Open Font License 1.1

- **Still true regardless**: if we ever replace this face, do not swap in
  U+FDFC (the Iranian rial) or a private-use codepoint. The alternatives
  remain OS glyph support alone (macOS 15.4+, iOS 18.4+, Windows 11
  24H2+, Android 16, tofu on older devices) or an SVG glyph face drawn
  from SAMA's published symbol assets.
