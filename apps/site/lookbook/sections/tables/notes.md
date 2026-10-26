# Tables notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/table.tsx`'s header comment.

## Doctrine

Rows are DATA, not controls. Each row is a 64px BAND: a 52px row
(`h-row`, the `--row-height` rhythm) with 6px of air above and below,
closed by a hairline at the band's edge. That height contrast against
the 40px house control is the look. The header is the control tier:
40px cells (`h-control-xl`) reading `text-label` at `muted-foreground`,
quiet enough that the data outranks its labels.

Every row is divided, header included: at this
rhythm the line is what lets the eye track across a long row. The
last row keeps its divider: it closes the list.

Hover is a rounded PILL: `bg-row-surface-hover` (alpha-50, the quietest
fill in the system) filling the inner 52px at a 12px radius, so it
floats inside the band and never collides with the divider. It snaps:
no transition, the nav-row tier. Only an INTERACTIVE row lights up; a
highlight on a row that opens nothing is a lie.

In doctrine a table is not a `<table>`: it is a list of rows you can
act on. We ship the semantic element anyway: column semantics and AT
navigation come free, and a real table lays columns out better than
subgrid does.
The look survives by construction: the table resets to
`border-separate`/`border-spacing-0` (a collapsed table refuses
border-radius), the `<tr>` is a named group, and each cell carries the
divider on its own box while an inner BAND div holds the height and the
gutter, and paints the fill. The bands touch, so their fills read as one
pill, and its outer corners are the first and last cell a row SHOWS (a phone
hides cells, so they are read off the visible ones). Nothing hangs off the
`<tr>`: an out-of-flow child of a table row becomes an anonymous cell and
shifts the body off its header. A row the page ticks (`selected`) holds the
next step on the ramp, alpha-100, and alpha-150 under the pointer.

A row that opens something takes `interactive` plus a `TableRowLink` on
its primary cell: the link stretches over the whole row through an inset
`::after`, so the row is one big target while staying a real LINK
(cmd-click, open-in-new-tab, and the screen reader's link list all keep
working). A `div[role=button]` row wrapping real buttons would flatten
those controls out of the accessibility tree, the same invalid-nesting
patch FilterChip took. Anything clickable
beside the link goes in `TableRowActions`, which lifts above the
overlay; without it the stretched link swallows the clicks.

Row actions are a trailing `w-0` cell, its header cell labelled
sr-only: a ghost icon Button opening a DropdownMenu is the house ⋯
pattern. Numbers go through `numerals.ts`
(`formatPrice`/`formatValue` for values, `formatIdentifier` for anything
matched outside the app) with `numeric` on the head and the cell, and
`latin` at the call site for Latin-digit islands in RTL.

A number column hugs the PHYSICAL right in both directions [Sirdab
2026-07-28]. Alignment exists so place value stacks, and a number is
internally left-to-right whatever the page is: its least significant
digit is always its rightmost. Aligning by the logical end in Arabic
put the decimals up to 12px apart down the column (measured), which is
the exact drift tabular figures exist to kill. So `numeric` ends the
column in LTR and flips back under `rtl:`, and the header follows its
digits. Everything else in the table stays logical.

A sortable column puts `sort` on the `TableHead` (aria-sort: the active
head ascending or descending, every other sortable head `none`) and wraps
its link in `TableSortLink`, which adds the direction glyph. The idle glyph
holds its space and shows on hover or focus; on a coarse pointer it is
always shown, because a phone has no hover.

## Usage

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
  TableRowLink,
} from "@sirdab/one/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>المنتج</TableHead>
      <TableHead numeric>السعر</TableHead>
      <TableHead className="w-0">
        <span className="sr-only">إجراءات</span>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow interactive>
      <TableCell>
        <TableRowLink asChild>
          <Link href="/products/1">شنطة جلد</Link>
        </TableRowLink>
      </TableCell>
      <TableCell numeric className="latin">
        {formatPrice(24900, { locale })}
      </TableCell>
      <TableCell className="w-0">
        <TableRowActions>…</TableRowActions>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

`className` is for LAYOUT only: column width (`w-0` shrinks a column to
its content) and `hidden md:table-cell` on BOTH the head and the cell to
drop a column on small screens. Heights, gutters, dividers, the hover
pill and number alignment come from the component.

For stacked records, set `multiline` on every `TableCell` in the row. Content determines the height and aligns at the top. Keep these rows non-interactive and give each destination its own link.
