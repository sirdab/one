# Colors notes

Not rendered. The gallery page shows; this file explains. Values and the
decision order stay canonical in `packages/one/COLORS.md`.

## Doctrine

A pure neutral system: one ramp with a mirrored dark mapping, an alpha
ramp for text and washes, and the semantic layer on top. Status colours
exist but only report: destructive, warning, and success paint error
text, badges, and banners, never a button fill (TOKENS.md rule 1).
Components may only touch the semantic layer. The decision order for
picking the right one lives in packages/one/COLORS.md:
surfaces come from the solid steps, interaction fills from the alpha
ramp, and a wash is never a surface.

### Neutral ramp

The only place these values exist. Light mode reads it as-is; dark mode
reads it mirrored (step N becomes 1000−N), so the two themes cannot
drift. Flip the theme toggle and watch it reverse. Half-steps (75, 150,
…, 925) are what dense UI needs between Tailwind's rungs.

### Ink & background

Foreground is 16.8% lightness (#0F0F0F, pure neutral by choice),
deeper than ramp-950 (20.5%). Text and the primary button get a floor
the surface stack never reaches. The pair swaps verbatim in dark.

### Alpha ramp

Hand-tuned, deliberately uneven. Don't smooth it. Points at black in
light and white in dark, so a wash works on any surface. This is where
the FILLS resolve (--muted, --border, the button ladders); the text
tones --secondary/--subtle moved to SOLID ramp steps (alpha text
double-paints Arabic joins).

### Surfaces

The page sits beyond the ramp (ink-on-paper flips to paper-on-ink), so
it is always lighter or darker than any surface on it. Light is white
with two deliberate exceptions (rail, whisper); dark is hand-stepped a
whisper apart: panel #121212, raised #151515, frosted popover #2E2E2E at
90%. And the modal comes back DOWN to ink, separated by its scrim and
border. Depth is surface + border, not shadows.

Token detail trimmed from the table:

- card: white in light, ink in dark; the border does the separating.
- surface-whisper: the tonal panel, #FCFCFC light / #121212 dark;
  recessed group surfaces (preview, media, code), elements on it return
  to the page tone.
- surface-overlay: white in light, #2E2E2E in dark, painted at 90%
  frost.
- surface-modal: white in light, INK in dark; the scrim behind it does
  the separating.
- surface-rail: the ONE tinted surface, gray-50 both themes (#FAFAFA /
  #171717); as a mobile drawer it returns to background.
- scrim-surface: the veil behind a modal, gray-150 at 30% +
  backdrop-blur-scrim (2.5px), a light frost that brightens, never a
  black dim.

### Text

Three tiers. Task-critical text never drops below muted-foreground;
subtle is the placeholder / timestamp tier at 3.2:1 by design. The var
is --secondary, but the utility is text-muted-foreground: the shadcn
collision gave bg-secondary to the muted fill.

Token detail trimmed from the table:

- muted-foreground: de-emphasised text a user must still read, e.g. chip
  labels, SelectLabel, Command headings.

### Actions & fills

Primary is the foreground inverted: ink, deeper than ramp-950, which is
why it reads black and a gray-900 button reads gray. One primary per
view.

Token detail trimmed from the table:

- accent: shadcn-compat ONLY (lives in the bridge for unported shadcn
  components). NEVER paint hovers with bg-accent; use muted or the
  alpha ramp.

### Status (report only)

Status colours report; they never command. Error text, failed badges,
and banners only, and the destructive button stays a red outline via
--btn-destructive. There are no hover rungs: nothing here is a button,
and a status colour is never a fill (TOKENS.md rule 1).

### Borders & focus

border separates; input borders are a hairline (alpha-200) that deepens
on hover. Tuned by eye, not by WCAG (several text tokens sit below AA
on purpose).

### Component ladders

Interaction steps: secondary buttons walk border and fill one alpha rung
together; ghost fills run one rung deeper; rows use the quietest fill in
the system.

Token detail trimmed from the table:

- icon-quiet: quiet icons are solid ink at fixed opacity, never an alpha
  colour; crossing strokes would double-paint.
- icon-quiet-disabled: half of rest, relative: an absolute fade could
  brighten a disabled icon.
