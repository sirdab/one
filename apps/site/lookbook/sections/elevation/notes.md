# Elevation notes

Not rendered. The gallery page shows; this file explains. Shadow values
stay canonical in `packages/one/TOKENS.md`.

## Doctrine

Shadow is not the primary mechanism here: on a dense screen borders
outnumber shadows by orders of magnitude. Separation is border and
surface; shadow is reserved for things that genuinely float. In dark mode depth comes from the surface stack
instead.

### The stacking rule

THREE levels deep, maximum: background, card, popover. In light they are
ALL WHITE; depth is shadow and border, never tint. The only tinted
surfaces are the rail (sidebar/navbar, solid gray-50) and the whisper
panel (#FCFCFC, the tonal card for preview/media/code wells: #FFF page,
#FCFCFC card, #FFF element). A modal REPLACES the stack behind a frosted
scrim; nothing floats on a modal except its own popover. Dark is flipped
and hand-stepped: ink page, ink cards + border, tonal panel #121212,
raised #151515, frosted popover #2E2E2E at 90% (reads ~#2B2B2B); the
modal comes back DOWN to ink, separated by its scrim and border, never
tint.

The tier-3 popover in the demo: white in light, #2E2E2E at 90% frost in
dark; the shadow is the depth. The stack ends here.

Never four: background + card + modal + popover stacked, or a select
opening over another panel. If a flow seems to need it, the middle
surface is wrong. Flatten it or promote it to a modal that replaces the
stack.

### The six shadows

Named for what floats, not for abstract height, plus the one page card.
shadow-card is the PAGE card (a form, a settings group, a detail section,
a stat tile): it sits visibly on the page and its first layer is the
hairline, so a card wearing it has no border. Anything INSIDE a card is a
hairline (`border border-border rounded-xl`) or a whisper well, never a
second shadow, and never a shadow plus a border. List rows and nested
boxes default to shadow-none plus border. raised is the CONTACT variant
(spread pulled tight): things resting that lift on hover or drag. popover-sm and the
modals are for things that float. popover-sm is the one shadow every
panel wears; shadow-modal is the six-layer contact ladder for dialogs,
modal-lg the seven-layer version for sheets and command palettes. Modal
alphas are tuned
per shadow, never recompose them from the l-layers. In dark, elevation
shadows are ZERO: elevation is the surface tones alone, and popover-sm
keeps only its hairline, swapped to a white-alpha ring.

shadow-overlay is the layer-composed build of the same popover shadow,
superseded in components by shadow-popover-sm (the flattened form); it
is not a level to reach for. In dark, both compute to none.

### Hover lift

shadow-raised is for state change only (hover lift and drag), and light
mode only: dark has no elevation shadows, so the lift is a
border-and-tone story there. Hover the card (in light).

### Z layers

Portals take a named layer; everything else is z-raised. App content
lives inside an isolated stacking context, so nothing inside it can
fight a portal.
