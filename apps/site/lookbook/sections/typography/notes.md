# Typography notes

Not rendered. The gallery page shows; this file explains. The role
values stay canonical in `packages/foundation/TOKENS.md`.

## Doctrine

Nine app roles plus a marketing display tier. Arabic runs 5% larger with
extra leading and zero tracking: connected scripts must never be
letter-spaced.

### The Arabic leading floor

Arabic leading is a floor, not just a nudge. Once a line-height falls
under what the ink needs, the half-leading goes negative and the line
box crops the glyphs. Descenders go first: ي and ع run past the bottom
and get sliced by any clipped or height-capped container, which is how
this surfaced under Noto, as heading-sm and up clipping in the weight
ladder.

The failure is about the RATIO, not the size, and the ratio Arabic needs
is near-constant. An additive nudge cannot hold that, because the base
ratios tighten as type grows (1.33 at caption down to 1.08 at
display-lg), which is correct for Latin and wrong for Arabic. So
`--script-leading-floor` is 1.6 under Arabic and 0 under Latin, and
every role computes `max(calc(base + add), floor)`. Roles already above
the floor keep their tuned leading; heading-sm and up get lifted onto
it. Latin is untouched, its font box sits close to the em and the tight
display ratios are what Inter was drawn for.

The 1.6 is IBM Plex Sans Arabic's number [2026-08-05]: Plex declares a
1.5x-em font box but its deep descenders overflow it, and shaped-run
measurement over representative UI copy puts the ink-safe ratio at
1.55-1.57 across the loaded weights. (Noto needed 1.56 by the same
method.)

If you swap the Arabic face, re-measure the floor. It is a property of
that face's metrics, not a taste value.

### Weight ladder

Size, leading and tracking are single script scalars, but WEIGHT is set
per role, because "one rung heavier" is right for some roles and wrong
for others. The dial is the `[lang="ar"], [dir="rtl"]` block in
`foundation.css`: one line per role, the Latin value in the comment,
edit the numbers and nothing else.

Under Noto every role ran a numeric rung above Latin. IBM Plex Sans
Arabic cuts each weight markedly heavier (its 500 ink-matches Noto's
600), so the dial now reads as numeric parity with Latin: 500 where
Latin is 500, 400 where Latin is 400, while the OPTICAL intent (Arabic
a step heavier than its Latin peer) is unchanged. The display tier
keeps a real rung: 400 against Latin's 300, holding the light
marketing voice without the underset that pushed Noto two rungs to 500.

The ladder on the gallery page MEASURES rather than states: each row
renders the role twice, once in a Latin island and once in an Arabic
subtree, and prints what the browser computed, so a number here can
never drift from the CSS. ✳ marks a divergence.

Three things bound how far the dial can go. A rung up costs a few
percent of line width and compounds with the 5% size scale, so Arabic
runs wider than Latin overall and truncation bites earlier in fixed
boxes (the rail, table columns). Plex ships static weights and
fonts.ts loads only 400/500/700, so a rung outside that list is a
synthesized smear, never dial one. And number columns are not
free: Plex's Arabic-Indic digits are proportional and their advance
shifts per weight (Noto held a 0.000 spread at every weight), so a
weight change reflows prices; the digit-gate status and escape hatch
live in fonts.ts.

Anything added to the Arabic dial must also be restated in the
Latin-island block below it, or a `.latin` span inside Arabic renders
Inter at the Arabic weight. A guard test holds the two lists in sync.

### App roles

heading-xs (18/26 · 500) covers section titles and stat values; this
page's own Section headings are the live example.

### Display tier

Marketing surfaces only: large and light is the whole display voice.
App pages stop at heading-md. The tiers are MUTUALLY EXCLUSIVE per
surface: heading-md (35px) vs display-sm/md (32/36px) are three jobs
within 4px and collide visibly if mixed on one page. Arabic leading-add
is the display knob (+0.1, not body's +0.22).

### Metrics probe

Trust nothing: this measures the rendered page. The Arabic row must
compute larger than the Latin row (the lang selector working). The
digit spread is expected NON-zero for now: IBM Plex Sans Arabic's
Arabic-Indic digits are proportional, a known open gate accepted with
the face swap (escape hatch in fonts.ts); the probe keeps showing the
live number so a future digit fix is visible here.

### Diacritics

Saudi ecommerce copy is realistically undiacriticised, which means the
+0.22 body leading-add is rarely stress-tested. This line is fully
vocalized so clipping shows immediately if the accommodation ever
shrinks. If real copy stays harakat-free, that number could come down.

### Latin islands

SKUs and brand names inside Arabic prose opt back into the Latin metrics
via .latin. Prices do not; they stay Arabic-Indic with the rest of the
UI.
