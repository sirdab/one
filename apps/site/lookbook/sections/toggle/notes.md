# Toggle notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/toggle.tsx` and
`components/ui/toggle-group.tsx`.

## Doctrine

A toggle is a Button that stays pressed: it borrows `buttonVariants`, so
a chip toggle and a chip button are the same box, and "on" is the
button's existing `data-state="on"` pairing. Radix owns `aria-pressed`
and `data-state`; never wire them by hand on a Button again.

A ToggleGroup `type="single"` is a pick-one (the photo editor's ratios
and sizes): radio semantics and arrow keys for free. Pass `required` when
the choice has a default, so pressing the chosen item again keeps it.
A joined, sliding pick-one with a thumb is `Segmented`; a pick-one that
swaps content below it is `Tabs`.

`variant="filter"` is `FilterChip`'s pressed state on a button-sized chip:
the pressed item inverts to full ink on the 200ms colour tier, with no
plus glyph. Use it where a pick among a few kinds must read at a glance
on a phone (the palette's scope chips); the default `chip`'s pressed
state is an alpha-100 wash under a muted label, which is quiet by design
for tool rows. Press the pressed one again and the value clears, so
"nothing pressed" can mean everything; add `required` to keep one picked.
