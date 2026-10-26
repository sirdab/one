# Palette notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/palette.tsx`'s header comment.

## Doctrine

The command palette: a full-height searchable list built for the
Dialog's "launcher" position, NOT a shrink of Command. Command is the
searchable menu inside a frosted popover for comboboxes; this is a
modal that replaces the topbar's own search control, so it is opaque
(the dialog's surface-modal), the search row carries the magnifier at
full ink, and the list runs tall rather than capping at dropdown height.

From md the launcher is a fixed box after ElevenLabs' ⌘K:
`--shell-palette-width` by `--shell-launcher-height` (720 by 470), its
top at `--shell-launcher-top` (20vh). It never resizes: results swap
inside a list that scrolls, so the panel does not jump as the count
changes. While a source is out, `PaletteSkeleton` holds the place of its
rows. No close X: Esc and outside-click are how a launcher closes.

Rows are grouped, and a group whose every row is filtered out hides its
own heading. A row is 52px: a 40px tile in 6px of padding, a
medium-weight title over its REQUIRED caption subtitle, and, only on the
active row, the "Open ⏎" affordance. The row wears its own radius
(`rounded-palette-item`, 14px) and only the active row is lit
(alpha-100): the pointer moves the active row, so there is no separate
hover wash. The search can be the host's (`search` / `onSearchChange`,
`filter={false}`) when rows come back from an api rather than matching
their own text.

Three tiles, by what the row is:

- `PaletteItemIcon`: an action or a place. A gray-alpha-100 well and a
  20px glyph in the secondary tone; on the active row the well steps to
  alpha-150 and the glyph to ink.
- `PaletteItemImage`: a record with a photo (a product), cropped square.
- `PaletteItemAvatar`: a record without one (an order, a customer). One
  of six `aurora-avatar-*` gradients, picked off the record's id, with a
  white glyph. The palette's one sanctioned colour (COLORS.md row 11):
  it is what makes the Recent group scannable by face.

## A host that ranks its sources

The studio's palette is fed by three sources that answer at different
speeds (the words it knows, the store's records, the api's reading), so it
decides which row Enter will run and tells the palette:

- `activeValue` names the active row. `null` lights nothing, which is how a
  host says "not yet" so the highlight never jumps when a late answer
  arrives. Left out, the first visible row is active, as before.
- `onActiveValueChange` hears the arrow keys and the pointer; the host
  decides whether the highlight moves. A highlight the host moved is
  scrolled into view, one the pointer moved is not.
- `onEnter` takes Enter over, with the row that was active (or `null`), so
  the host can hold the key while a source answers.
- `PaletteItem enterLabel` is the row's own word on the Enter hint
  ("Create", "Publish", "Ask") over the palette's `openLabel`: a row that
  creates something must not say "Open".
- `PaletteInput trailing` holds the host's spinner or, on a phone, Cancel.

Below md the launcher dialog is the whole visible screen (it follows the
visual viewport, so the keyboard does not cover the last rows), the list
fills it, and its last row clears the bottom edge. The scope chips are a
`ToggleGroup variant="filter"`, nothing pressed meaning everything.

## Usage

```tsx
import {
    Palette,
    PaletteEmpty,
    PaletteGroup,
    PaletteInput,
    PaletteItem,
    PaletteItemAvatar,
    PaletteItemIcon,
    PaletteItemImage,
    PaletteList,
} from "@sirdab/one/components/ui/palette";

<Dialog>
    <DialogContent position="launcher" className="gap-0 overflow-hidden p-0">
        <Palette openLabel="افتح">
            <PaletteInput placeholder="ابحث في متجرك" aria-label="بحث" />
            <PaletteList aria-label="بحث">
                <PaletteEmpty>ما لقينا نتائج</PaletteEmpty>
                <PaletteGroup groupId="quick" heading="إجراءات سريعة">
                    <PaletteItem
                        value="create-product"
                        title="أضف منتج"
                        subtitle="منتج جديد ينضاف لمتجرك"
                        leading={<PaletteItemIcon icon={PackagePlus} />}
                        onSelect={() => …}
                    />
                </PaletteGroup>
            </PaletteList>
        </Palette>
    </DialogContent>
</Dialog>;
```
