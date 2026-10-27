# Card notes

Not rendered. The gallery page shows; this file explains. Component usage
stays canonical in `components/ui/card.tsx`'s header comment, and the whole
page recipe (card, form, Save) is `docs/patterns/form-page.md`.

## Doctrine

One raised plane for every page-level group: a form, a settings group, a
detail section, a stat tile. It wears `--shadow-card`, whose first layer is
the hairline, so the card has no border. 16px corner (`rounded-2xl`), white,
and no padding of its own: the parts own it, 24px from sm and 16px on a
phone, so a card of rows and a card of fields share one inset.

Depth is shown once. Anything inside a card is a hairline (`border
border-border rounded-xl`, 12px, `px-4 py-3`) or a whisper well
(`bg-surface-whisper`, 12px) for a recessed preview or photo. A card never
stacks two shadows, and never a shadow and a border. List pages are the list
kit, not cards. `variant="outline"` is the hairline card for the few places a
card sits on a whisper well or carries its own depth; `raised` stays an alias
of the default.

## Anatomy

- Header: title (`h2`, heading-xs, no ink bar) and a description 4px under
  it in the quiet muted body; `CardAction` in the second column, on the end
  edge, top-aligned with the title: one secondary button, a ghost icon button
  or a link, never the Save. A header that is the last thing in the card
  closes it with its own bottom padding.
- Content: `p-6` (16px on a phone), 16px under a header, fields inside at
  `gap-4`. Sections are CardContent blocks divided by a full-width
  `Separator`, each opening with a `FieldLegend`; past five fields, split into
  sections or into cards.
- Footer: a hairline above, help at the start, secondary actions at the end,
  destructive last. Rare, and never the Save.
- Rows: an `ItemGroup` straight inside the card is its whole body, with an
  `ItemSeparator` between rows and none after the last. The action stays on
  the row at 390.
- Between cards: 12px below sm, 16px from sm. The last card clears the bottom
  of the page by 32px on a phone.

## Save

A page has one Save, in the topbar tail, shown only once it would save. See
`docs/patterns/form-page.md` and the Forms section.
