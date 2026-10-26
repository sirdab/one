# Choosing colors: read this before painting anything

The color system has neutral surfaces, alpha washes, ink and a brand accent.

- **Solid steps** (the ramp, `--gray-*` and the surface tokens): for
  SURFACES. Pages, cards, rails, wells, popovers, modals. Text is also
  SOLID (`--secondary`/`--subtle` are ramp steps): translucent text
  double-paints where Arabic glyphs join, so alpha never touches type.
  The ramp is chroma-zero: every step is a plain neutral, lightness only,
  no hue on either axis, white-anchored in light and ink-anchored in dark;
  see "The ground" below.
- **Alpha washes** (`--gray-alpha-*`): for what happens INSIDE or ON a
  surface. Borders, hover fills, tracks. They point at black in light
  and white in dark, so one declaration works in both themes.
- **Ink** (`--primary`, and `--ring` which follows it): the ACTION. One
  per view. The primary button is the foreground inverted, not a step on
  the ramp: ink (`#0F0F0F`) on white in light, white on ink in dark.
  This is the default action fill; a product can adopt a brand primary
  only with an explicit ruling.
- **Brand** (`--brand-*`, the Sirdab teal ramp): identity and accents.
  Use `--brand` for text, and `--brand-subtle` with
  `--brand-subtle-foreground` for a tinted brand block. It is not a status.

Two rules, and between them they answer most questions:

- **Washes are never surfaces, surfaces are never washes.** A fill that
  covers an area bigger than a control is a surface; a fill that
  responds to the pointer is a wash.
- **Ink commands, status reports.** The one solid ink fill invites a
  click and never means anything. Red, amber, yellow and green mean
  something and are never clickable. If a color is doing the other one's
  job, it is wrong. One ink surface is not an action: the tooltip chip. It
  is text only, never a target, and it is ink because a hint has to read at
  a glance over a photo, a table or white paper, where a frosted chip
  greys out; it invites nothing, so it commands nothing.

A status colour answers one question: **whose move is it?** Grey, nothing
for you to do (done, closed, off, in someone else's hands). Yellow, your
move, and nothing is wrong (a draft lives here). Amber, something is off and
needs you soon. Red, failed or refused; it will not fix itself. Green, live,
on the shelf, switched on. Queues (orders, payments, invoices, imports) fade
when done, so the eye goes to what is left; shelves (products, pages, the
store, a connection) glow when live, because that is what she scans them
for. One exception: the tick on a setup checklist step ("Done") stays green,
because it is progress toward something, not a record that finished.

## The ground

The page is WHITE (`--background: oklch(100% 0 0)`) and `--surface-flat`
sits at the same white; the recessed whisper is a half-step below it
(`#FCFCFC`) and the rail is `--gray-50` (`#FAFAFA`). In dark the page is
INK (`#0F0F0F`) and the surfaces climb away from it (whisper `#121212`).
Both grounds are chroma-zero: no hue on either axis, so the two themes
differ in lightness only.

Ink sits BEYOND the ramp on purpose: 16.8% lightness against a ramp floor
of 20.5% (`--gray-950`, `#171717`). Text and the primary button get a
depth no surface ever reaches, which is why an ink button reads black
while a gray-900 button reads gray. The same pair serves dark verbatim:
the page goes to ink and `--ink` goes to white, so the page is always
darker or lighter than anything on it, in both themes.

The thing to unlearn: in light, a card is NOT brighter than the page. Card
and page share the same white, so the hairline does the separating (the ring
that leads `--shadow-card`, or `--border` on an inner box) and tone only steps
DOWN from there (whisper, rail, sunken). Painting `bg-background` on a card is
therefore not wrong, it is just `bg-card` by another name; what is wrong is
reaching for a tint to make the card "pop". There is no tint. Use the card
shadow, and the border inside it.

## The decision order

Ask these in sequence. The first yes wins.

| #   | Question                                                      | Use                                                                                                                                                                                                                                                            | Never                                                                                                                            |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Is it the page itself?                                        | `--background` (white in light, ink in dark)                                                                                                                                                                                                                   | a ramp step; the page sits beyond the ramp so nothing can match it                                                               |
| 2   | Is it a surface (card, section, rail, well, panel)?           | the surface tokens: `--card`/flat, `--surface-whisper`, `--surface-rail`, `--surface-sunken` (backdrop under a lifted card only)                                                                                                                               | an alpha wash as a surface, an arbitrary hex                                                                                     |
| 3   | Is it separating two surfaces?                                | `--border` (a hairline). A page card's hairline is the first layer of `--shadow-card`, so it wears no border of its own; the boxes inside it take `--border`                                                                                                   | a border that decorates, a border beside the card shadow, any other shadow doing a border's job                                  |
| 4   | Is it an interactive outline (input, select, checkbox, chip)? | `--input` / `--border-interactive`, hover one rung (`--input-border-hover-form` or the 400 jump)                                                                                                                                                               | `--border` (too quiet for a control edge)                                                                                        |
| 5   | Is it a fill that reacts (hover, active, selected, dragged)?  | the alpha ladders: `--btn-*`, `--btn-ghost-*`, `gray-alpha-50/100/200` for rows, menus, nav                                                                                                                                                                    | a solid step, a status color                                                                                                     |
| 6   | Is it text?                                                   | `--foreground`, `text-muted-foreground`, `text-subtle`                                                                                                                                                                                                         | an alpha token (Arabic joins double-paint), `--ink` directly                                                                     |
| 7   | Does it float (menu, popover, combobox)?                      | `--popover` + frost (90% over 8px blur) + `--shadow-popover-sm`, no border. A tooltip is the one exception: the ink chip (`--primary`, text only), see Ink commands                                                                                            | a solid panel in light, a border                                                                                                 |
| 8   | Does it block (dialog, sheet)?                                | `--surface-modal` + `--shadow-modal`/`--shadow-modal-lg`, ring in dark                                                                                                                                                                                         | stacking it over a popover over a card over a page (never 4 deep)                                                                |
| 9   | Is it THE action?                                             | `--primary` (ink, the foreground inverted), one per view                                                                                                                                                                                                       | any status color as a button fill, a gray step (it reads gray, not black)                                                        |
| 10  | Does it report a status?                                      | the five tones. A WORD: the tone's text step on its `-subtle` status fill (`Badge tone`, `StatusNote`; 4.5:1 on the fill). An ICON: the tone's `-glyph` step (3:1 on a card). `--destructive`/`--warning`/`--success`/`--attention` text and `-subtle` banners | a status fill as an action or a surface; ink on a chip                                                                           |
| 11  | Does it just want to look on-brand?                           | `--brand` for text and icons (600 clears AA on white), `--brand-subtle` + `--brand-subtle-foreground` for a tint, sparingly: one brand moment per view                                                                                                         | a teal fill doing a status colour's job, teal text on the 500 step, `bg-brand` on a button that is not the ruled primary (row 9) |

## The stack recipes

These composites cover 95% of screens. If your case matches one, copy it.

- **Dashboard card on the page**: `bg-card` + `shadow-card`, which is the
  hairline plus the soft lift in one string, so there is no border and no
  second shadow. Text inside walks the three text tiers; boxes, tiles and
  rows inside are `border-border` hairlines at 12px, a recessed block is the
  whisper well. Card and page are the same white, so the ring is the whole
  edge; that is why it may never be dropped "because the card already
  reads". `variant="outline"` (`border-border`, `shadow-none`) is the same
  card for a whisper well or a surface that carries its own depth.
- **Recessed well (preview, media, code)**: `bg-surface-whisper`, no
  border needed; elements on it return to `bg-card`. The sandwich is
  card, whisper, card, and it reads as recessed because the whisper is
  the one surface a half-step below white.
- **Sidebar / navbar**: `bg-surface-rail`, gray-50, the one tinted plane
  in the system and the only thing that sits between the page and a
  card. That in-between position is what keeps a docked sidebar reading
  as structure rather than as one very wide card.
- **Status chip**: `Badge tone`, which is the tone's `-subtle` fill, its text
  step (700 in light, 400 in a `.dark` scope) and a 6px dot at the start of
  the reading direction in `currentColor`. Neutral is the exception that
  proves the rule: `--muted` fill, `--foreground` word, and a `--subtle` dot,
  so a done chip fades while its word stays ink. Always a word, never colour
  alone; one chip per row at the inline end; not interactive; never ink. A
  tag (Digital, Package, a customer's tag) is a hairline `outline` and has
  no dot, so a status can never be mistaken for one.
- **Status note**: `StatusNote tone`, the same fill as a centred sentence
  about a record ("Draft: only you can see it"), no dot, wrapping.
- **Status icon**: the tone's `-glyph` step (`text-warning-glyph`,
  `fill-success-glyph`, `text-neutral-glyph`), 500 in light and 400 in a
  `.dark` scope. The 700 text step at icon size reads as a dull brown, and
  `icon-quiet` composites to 2.96:1 on the rail grey; neither is a status
  icon. A glyph is a text or fill-of-an-icon colour, never a `bg-*`.
- **Table row hover**: `bg-row-surface-hover` (alpha-50, the quietest
  wash), desktop only, interactive rows only. A divider under every row,
  the header included.
- **Table row selected**: `bg-row-surface-selected` (alpha-100) on a ticked
  row, `bg-row-surface-selected-hover` (alpha-150) under the pointer. It is
  the hover's next step on the alpha ramp, so a ticked row never looks like
  a hovered one, and it is `TableRow selected`'s to paint, not a class at
  the call site. Never a wash or a status colour: a tick is an interaction,
  not a state of the record. `--secondary` text on a ticked row under the
  pointer reads at 3.9:1 (4.2:1 on the tint alone), so a column a merchant
  must read uses ink on that row.
- **Nav item**: rest `text-muted-foreground`, hover/active the same
  `gray-alpha-100` fill with text lighting to `--foreground`. No louder
  active state.
- **Menu/panel item hover**: the ghost ladder, alpha-100 hover,
  alpha-200 active.
- **Floating panel over anything**: frosted popover. Content behind it
  ghosts through; that is the depth cue, not a heavier shadow.
- **Destructive confirmation**: inside a modal, the confirm button is
  `--primary`. The red outline variant exists for catastrophic actions
  only: border AND text both take `--btn-destructive` (the `#DD4949`
  tier, never written as a hex).

## The never list

Every one of these has bitten someone:

- Never a literal hex or rgb in a component. The lint catches it, and so
  will review.
- Never `--ramp-*`, `--darken-*`, `--lighten-*`, `--ink` directly. They
  are plumbing; `--darken`/`--lighten` do not flip with the theme, and
  `--ramp-*` is the raw ladder both themes are mapped from.
- Never a wash as a surface (a gray-alpha card) or a solid step as a
  hover fill.
- Never a status color as a button fill. Red button, green button, amber
  button: none of them exist here.
- Never a teal button on your own initiative. The action is ink unless
  the product has ruled otherwise; see "A brand-filled primary" below.
  `bg-brand` outside that ruling is for the rare solid brand block (a
  hero chip, a selected tile), and a brand-coloured action nobody ruled
  on is a second primary wearing a costume.
- Never `--brand-500` as small text on white (about 3.6:1). `--brand` is
  the 600 step for exactly this reason; 500 is the mark's fill.
- Never a second primary in one view. Two ink buttons on white do not
  compete the way two coloured ones would, which is exactly why the
  second one goes unnoticed in review and then confuses the user.
- Never a fourth level: background + card + popover is the deepest stack;
  a modal replaces the stack behind its scrim.
- Never invent a surface tone. If the ladder above genuinely lacks the
  step you need, that is a design-system conversation, not a new line in
  a component.

## A brand-filled primary

The system used to forbid a teal action outright. On 2026-09-17 Iliyas
ruled that the TMS primary action is teal, the `--brand-600` step
(`#027787`), with white on it. The rule now reads: ink is the default
action fill; a product may point `--primary` at the brand fill instead,
and that is a product-level ruling, not a call made in a component. Only
the TMS has made it. The marketing site and everything else keep
the ink action.

**Why 600 and not 500.** White on `--brand-500` lands around 3:1, which
fails AA for a 13px label. 600 is the floor at which a white label on a
teal fill is legible, which is why the token is `--brand-600` and not
simply "the brand colour". A brand-filled primary that reaches for 500
because it looks friendlier is the same bug as teal text on 500.

**What the old rule was guarding, still live.** A teal action sitting
next to a green status dot stops reading as THE action and starts
reading as decoration: the eye no longer has one unambiguous "this is
the thing to click" signal, because two hues are now competing for it.
That risk did not go away with the ruling, it was accepted. So in a
product with a brand-filled primary, keep status colour quiet around the
action: tints and small dots rather than saturated blocks, and one
primary per view held to harder than ever. If a screen there ever starts
feeling like the button has gone missing, this trade is the first thing
to check, not the last.

## Dark themes and local scopes

Sirdab supports optional light, dark and system selection. The provider sets
`.dark` on the root when dark is active. The same class can mark a subtree;
`.light` restores light tokens inside it. Every alias re-resolves in its scope,
so components use the same semantic tokens in both themes. Portals inherit
their container's theme, normally the document body. The `dark:` variant
follows `.dark` and excludes `.light` islands.

Inside a `.dark` scope, the flips:

- The ground is INK (`#0F0F0F`, 16.8% lightness), deeper than the ramp's
  own floor, and the surfaces are hand-tuned solid tones a whisper apart
  rather than ramp steps: the tonal card `#121212`, the rail on dark
  gray-50 (`#171717`), the frosted popover at gray-100 (`#2E2E2E`) painted at 90% so it lands
  around `#2B2B2B` over the card, and the modal back at INK, the page
  tone, separated by the scrim behind it and its border, never by tint.
  The sunken plane is off-ramp too (`#191919`): above the rail, below
  gray-75's flip (`#212121`), because nothing on the ramp lands between
  them.
- Washes become white-alpha automatically. `--border` stays alpha-150
  in both themes with a single declaration; the only dark-specific ring
  is the popover's, which swaps its 6% black hairline (invisible on ink)
  for the alpha-150 white one.
- **The action flips WITH the ground.** `--primary` is the foreground,
  and the foreground goes to white in dark, so the primary button is
  white on ink. Ink-on-paper becomes paper-on-ink, the same two values
  serving both blocks verbatim.
- There are no shadows. Elevation is the surface tones plus the hairline
  ring on panels. If a dark screen needs a shadow to read, the surface
  tones are wrong, not the shadow.

App-specific landing treatments stay with their app. Foundation owns Sirdab's
teal ramp; the default action is ink. `--surface-raised` is retained for
existing consumers at gray-50 in light and #151515 in dark.

## Impersonation safety strip

[Sirdab, 2026-10-23] The support impersonation banner deliberately uses the
saturated `--impersonation` fill and `--impersonation-foreground` ink in both
scopes. It must remain conspicuous while staff act inside a merchant account.
This exception belongs only to that warning strip, never buttons or general
status surfaces.
