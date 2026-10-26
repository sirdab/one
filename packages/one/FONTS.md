# Fonts we redistribute

Type stacks and the reasoning behind them live in `src/foundation/foundation.css`. This file is only about provenance: which font
files ship inside our bundles, where they came from, and what we know about
their licenses. Inter and IBM Plex Sans Arabic are redistributed through the optional
`@sirdab/one/fonts.css` entry. Loading these base fonts makes no runtime Google
Fonts request.
Hosts can omit that stylesheet and supply the same font families themselves.

MoodBoard's existing font preview is separate: user-selected typography can
load a Google Fonts stylesheet for the preview. Those remotely served preview
fonts are not redistributed by the package.

## Inter and IBM Plex Sans Arabic

- **Source**: the root-installed `@fontsource/inter` and
  `@fontsource/ibm-plex-sans-arabic` packages. The repository lockfile records
  the exact versions used for each build.
- **Files**: Inter normal weights 300, 400, 500, 600 and 700, and IBM Plex
  Sans Arabic normal weights 400, 500, 600 and 700, including all Unicode
  subsets supplied for those weights. Their WOFF2 and WOFF files are copied
  unchanged to `dist/assets/fonts/`. `dist/fonts.css` retains Fontsource's
  family names, Unicode ranges and `font-display: swap`; only URLs change.
- **License**: SIL Open Font License 1.1. Unmodified notices are copied from
  each installed package to `dist/licenses/inter-OFL.txt` and
  `dist/licenses/ibm-plex-sans-arabic-OFL.txt`, which ship in every tarball.
  Inter is by Rasmus Andersson; IBM Plex is by IBM Corp.
- **Serving**: CSS URLs are relative to the package stylesheet. Next.js and
  Vite emit the assets under the consuming site's configured base path.
  Consumers do not copy anything into a public directory.

## SaudiRiyal (`saudi-riyal.woff2` / `.woff`)

- **What**: a single-glyph face carrying U+20C1 SAUDI RIYAL SIGN, loaded
  with `unicode-range: U+20C1` so it only ever paints the riyal symbol.
- **Where it ships**: `src/assets/fonts/`, copied unchanged into `dist/assets/fonts/`.
  `styles.css` includes the face with package-relative URLs, so the host
  bundler emits both files without a manual public-directory copy.
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
  the `@font-face` comment in `src/foundation/foundation.css`. Keep the two in step
  when the declaration moves.

  > Saudi Riyal Font © Emran Alhaddad - Used under SIL Open Font License 1.1

- **Still true regardless**: if we ever replace this face, do not swap in
  U+FDFC (the Iranian rial) or a private-use codepoint. The alternatives
  remain OS glyph support alone (macOS 15.4+, iOS 18.4+, Windows 11
  24H2+, Android 16, tofu on older devices) or an SVG glyph face drawn
  from SAMA's published symbol assets.
