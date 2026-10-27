# Motion notes

Not rendered. The gallery page shows; this file explains. Duration and
easing values stay canonical in `packages/one/TOKENS.md`.

## Doctrine

Transitions are response times; loops are speeds. Bare transition-colors
runs at 100ms by default, the system's dominant transition. Floating
surfaces enter at 150ms and leave at 100ms, dialogs enter at 200ms and
leave at 150ms, and size or layout changes opt up to 200/300 explicitly.
Collapsing the two scales is how you end up with a 22-value mess.
Reduced-motion collapses everything to 1ms.

### Response times

Hover each tile. The first two are colour transitions: the 100 tile
carries no duration class (the default is 100ms), the 150 tile is the
floating enters' own. The 200 and 300 tiles grow a bar: size and layout never
ride the default, they opt up.

### Loops

Loops are always ease-linear for ROTATION (a spinner that eases
stutters). A loop duration is a speed, not a response time; never reuse
one for a state change. The pulse is the stock opacity breathe: an
opacity loop may ease.

### Easings

ease-out for entrances (and the default timing function: every bare
transition rides it), ease-exit for short exits (floating panels, dialogs), ease-in for long ones (drawers), ease-in-out state to state,
ease-linear for loops, ease-spring for slight overshoot.
