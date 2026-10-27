# Spacing & radius notes

Not rendered. The gallery page shows; this file explains. The scale
values stay canonical in `packages/one/TOKENS.md`.

## Doctrine

A 2px grid, not 4px: 10px and 6px are load-bearing in dense UI. Twelve
steps total; app surfaces live in 2–16, marketing in 24–96. Anything off
this list is a lint failure, arbitrary or not.

### Radius scale

10px is the default; usage concentrates on six radii.

### Control heights

40px (xl) is the house control: secondary buttons, inputs, select
triggers all live there. 32px is reserved for THE primary action. Table
ROWS are the exception: data sits on 52px rows (h-row). Rows are
content, not controls; 44px is the touch floor for anything shipping to
mobile.
