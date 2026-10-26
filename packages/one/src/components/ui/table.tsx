import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronUpDownIcon,
} from "../icons/general";
import { Icon } from "./icon";

/* The Sirdab table: semantically a <table>, doctrinally a LIST OF ROWS
   you can act on.

   THE BAND AND THE PILL. Each row is a 64px BAND: a 52px row (h-row, the
   --row-height rhythm) with 6px of air
   above and below, closed by a hairline at the band's edge. Hovering an
   interactive row fills the inner 52px as a 12px PILL, so the fill floats
   inside the band and never collides with the divider. Fill is
   row-surface-hover (alpha-50, the quietest in the system) and it SNAPS:
   no transition, the nav-row tier. A row the page marks `selected` holds
   row-surface-selected (alpha-100) and deepens to alpha-150 under the
   pointer, so a ticked row still answers it.

   DIVIDERS ON EVERY ROW, not one hairline under the header. Per-row
   borders sound like "a ledger" in theory, but a line under every row
   reads better at this rhythm: 52px rows of long text need the line to
   track across. The last row keeps its divider; it closes the list.

   HOW BAND + PILL SURVIVE TABLE SEMANTICS: a <tr> cannot round or clip a
   background, and preflight's border-collapse refuses border-radius
   outright. So the table resets to border-separate/spacing-0; each CELL
   carries the divider on its own box (p-0, so the line runs edge to
   edge) and renders an inner BAND div that holds the height, the gutter
   and the fill. Adjacent bands touch, so they fuse into one pill; the first
   and last cell a row SHOWS round the pill's outer corners (rounded-s /
   rounded-e: logical, so it holds in RTL) and drop the outer gutter. A
   phone hides cells (hidden, hidden sm:table-cell, max-sm:hidden), and the
   first and last CHILD are then not the ends of what it shows, so the
   corners and the gutters are read off the cells it shows (see
   BAND_GUTTER and BAND_CORNERS).

   NOTHING HANGS OFF A ROW. An out-of-flow child of a table row (a
   pseudo-element or an absolutely positioned child) is wrapped in an
   anonymous table cell (CSS 2.1, 17.2.1), which gives every body row a
   leading column the header row lacks and sets the body one column off its
   headings from 640px up. So a <tr> carries no ::before, no ::after and no
   absolutely positioned child; a pseudo-element is fine on a cell's band. A
   cell takes no opacity either (hide a row's quiet controls on
   TableRowActions instead): the band's fill is inside the cell, and a
   transparent cell punches a hole in the tint of a ticked row.

   INTERACTIVE ROWS: pass `interactive` and put a TableRowLink on the
   primary cell. The link stretches over the whole row (an inset ::after)
   so the row is one big target, while staying a real LINK: cmd-click,
   open-in-new-tab, and the screen reader's link list all keep working.
   A div[role=button] row wrapping real buttons would flatten the inner
   controls out of the accessibility tree, the same invalid nesting
   FilterChip avoids. Anything clickable BESIDE
   the link goes in TableRowActions, which lifts above the overlay.

   Numerals follow the numerals rule: format with formatPrice /
   formatValue / formatIdentifier and pass `numeric` on the head and the
   cell. That ends the column and sets tabular figures, so digits align
   down the column (add `latin` at the call site for Latin-digit islands
   in RTL).

   MULTILINE CELLS: pass `multiline` to every cell in a row containing
   stacked records or wrapping details. The band grows with its content and
   the cells align at the top. Keep these rows non-interactive and use
   explicit links: a row-wide hover pill assumes the fixed-height rhythm.

   THE FILL COLUMN. A table sizes its columns from their content, so a
   truncating name still asks for its full width and one long product
   title widens the whole table into a sideways scroll. Pass `fill` on the
   head and the cells of the one column that should take the leftover
   width: it claims all of it and gives back its min-content (w-full plus
   max-w-0), so its text truncates inside the row instead. */

/* The fill column's width rule, shared by head and cell so they agree. */
const FILL = "w-full max-w-0" as const;

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(
          // border-separate, not preflight's collapse: a
          // collapsed table refuses border-radius, and the pill
          // rounds its bands.
          "text-body w-full border-separate border-spacing-0",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableRow({
  interactive = false,
  selected,
  tone = "default",
  className,
  ...props
}: React.ComponentProps<"tr"> & {
  /** The row opens something: give it a TableRowLink. Turns on the
        hover pill and anchors the link's row-wide overlay. */
  interactive?: boolean;
  /** The page lets this row be ticked (a list with a bulk bar): true tints
        it, false only anchors the list kit's tap layer, which covers the
        row. Leave it off for a table nothing selects from. */
  selected?: boolean;
  /** Existing operations tables use a tone to flag exception rows. */
  tone?: "default" | "destructive" | "warning" | "muted";
}) {
  // The row is chrome-free on purpose: height, gutter, fill and divider all
  // live on its cells (see the header comment). It names the hover group,
  // flags interactivity and selection for the bands to read, and
  // positions itself so a TableRowLink (or the list kit's tap layer) can
  // stretch across it.
  return (
    <tr
      data-slot="table-row"
      data-interactive={interactive ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-tone={tone === "default" ? undefined : tone}
      className={cn(
        "group/row",
        tone === "muted" && "text-muted-foreground",
        (interactive || selected !== undefined) && "relative",
        interactive && "cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

/* Head and cell share the gutter so the columns line up: 16px between
   columns, 32px from md (gap-x-4 → md:gap-x-8), and the
   outer edges give it back so the row starts flush and the pill's inset
   is the only thing showing. */
const GUTTER =
  "px-2 md:px-4 first:ps-0 last:pe-0 md:first:ps-2 md:last:pe-2" as const;

/* The same gutter for a cell's band, which sits INSIDE its td: on the band
   itself first:/last: always matched (it is its cell's only child), so a
   phone row lost every inset and the columns ran together, and from md the
   cells sat 8px inside their headings. The edges are read off the td
   instead, so cell and heading line up as the comment above promises.

   On a phone the first and last CHILD are not always the first and last
   cell it SHOWS: a list hides its leading tick column or its trailing
   columns (hidden, hidden sm:table-cell, max-sm:hidden, max-md:hidden), and
   the cell next to a hidden one kept a full inset, 8px off the edge the
   other lists sit at. Below sm the first and last cell not carrying one of
   those classes take the edge instead. Above sm the DOM's first and last
   still do: a list that hides an end cell until md or lg keeps that end
   8px off the edge between 640px and that breakpoint. No list does today. */
const BAND_GUTTER =
  'px-2 md:px-4 [td:first-child>&]:ps-0 [td:last-child>&]:pe-0 md:[td:first-child>&]:ps-2 md:[td:last-child>&]:pe-2 max-sm:[td:nth-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:ps-0 max-sm:[td:nth-last-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:pe-0' as const;

/* The pill's outer corners, on the band of the first and last cell a row
   shows: the same visible-cell selectors as BAND_GUTTER, so below sm a
   hidden cell at an end never squares the pill. Above sm the DOM's ends carry
   the corners, and an end cell hidden until md or lg leaves a square end in
   that range. They are classes on the band and not on the td, whose box
   carries the divider and keeps square edges. */
const BAND_CORNERS =
  '[td:first-child>&]:rounded-s-xl [td:last-child>&]:rounded-e-xl max-sm:[td:nth-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:rounded-s-xl max-sm:[td:nth-last-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:rounded-e-xl' as const;

/* The pill's fill, read off the row's flags (data-interactive, data-selected)
   and the pointer. Three states and no two of them fight: a plain hover on an
   interactive row that is not ticked; the tint of a ticked row; and the
   deeper tint of a ticked row under the pointer. The plain hover steps aside
   on a ticked row (group-not-data-selected) instead of racing the deeper
   one on the stylesheet's order, and the deeper tint stacks one more
   condition than the tint, so it outranks it whatever the order. */
const BAND_FILL =
  "group-not-data-selected/row:group-data-[tone=destructive]/row:bg-destructive-subtle group-not-data-selected/row:group-data-[tone=warning]/row:bg-warning-subtle group-data-interactive/row:group-not-data-selected/row:group-hover/row:bg-row-surface-hover group-data-selected/row:bg-row-surface-selected group-data-selected/row:group-data-interactive/row:group-hover/row:bg-row-surface-selected-hover" as const;

/* A number column hugs the PHYSICAL right in both directions, which is
   why these flip back under rtl:. Place value is what alignment is for,
   and a number is internally left-to-right whatever the page is: its
   least significant digit is always its rightmost. Align by the logical
   end in Arabic and the decimals stagger down the column (measured: up
   to 12px apart), which is exactly the drift tabular figures exist to
   kill. So the digits stay right-flush and the header follows them. */
const NUMERIC_HEAD = "text-end rtl:text-start" as const;
const NUMERIC_BAND = "tabular justify-end rtl:justify-start" as const;

type TableSort = "ascending" | "descending" | "none";

function TableHead({
  numeric = false,
  fill = false,
  sort,
  className,
  ...props
}: React.ComponentProps<"th"> & {
  /** Number column: ends the label over its digits. */
  numeric?: boolean;
  /** The column that takes the leftover width and truncates. */
  fill?: boolean;
  /** A sortable column's state, announced as aria-sort: the active head
   *  is ascending or descending, every other sortable head "none". Leave
   *  it off a head that does not sort. */
  sort?: TableSort;
}) {
  return (
    <th
      data-slot="table-head"
      aria-sort={sort}
      className={cn(
        "h-control-xl border-row-divider text-label text-muted-foreground border-b text-start align-middle",
        GUTTER,
        numeric && NUMERIC_HEAD,
        fill && FILL,
        // The sort link's 44px tap box would overflow the 40px
        // header and be clipped by the scroller; a sortable head
        // grows to the touch rung on a coarse pointer.
        sort !== undefined && "pointer-coarse:h-control-touch",
        className,
      )}
      {...props}
    />
  );
}

function TableSortLink({
  asChild = false,
  sort,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  /** The same state the head carries, so the glyph matches aria-sort. */
  sort: TableSort;
  /** Wrap a router Link: <TableSortLink asChild sort="none"><Link …/></TableSortLink> */
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";
  const idle = sort === "none";
  // A real link, not a button: the sort is in the url, so cmd-click opens
  // the sorted table in a tab, the browser can prefetch it, and it works
  // before javascript loads. aria-sort on the th announces the state; the
  // link keeps its plain visible label as its accessible name, because an
  // aria-label describing the click ("sort by name descending") would
  // replace the column's name in a screen reader's table navigation.
  // With asChild the Slot hands its props to the child and appends its
  // other children to the child's own, so the glyph rides after the
  // link's label wherever that label came from.
  return (
    <Comp
      data-slot="table-sort-link"
      // relative touch-target: the tap area is 44px though the heading
      // is shorter. group/sort lets the glyph answer hover and focus.
      className={cn(
        "group/sort touch-target relative inline-flex max-w-full items-center gap-1 rounded-sm whitespace-nowrap hover:text-foreground",
        className,
      )}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      <Icon
        icon={
          sort === "ascending"
            ? ArrowUpIcon
            : sort === "descending"
              ? ArrowDownIcon
              : ChevronUpDownIcon
        }
        data-slot="table-sort-glyph"
        // The idle glyph holds its space so the header never reflows
        // under the pointer. Hidden until hover or focus on a fine
        // pointer; a phone has no hover, so there it is always shown.
        className={cn(
          "size-3.5 shrink-0 transition-opacity duration-100 motion-reduce:transition-none",
          idle &&
            "opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100 pointer-coarse:opacity-100",
        )}
      />
    </Comp>
  );
}

function TableCell({
  multiline = false,
  numeric = false,
  fill = false,
  className,
  children,
  ...props
}: React.ComponentProps<"td"> & {
  /** Number column: ends the value and sets tabular figures. */
  numeric?: boolean;
  /** Stacked records grow the row instead of overflowing the fixed band. */
  multiline?: boolean;
  /** The column that takes the leftover width and truncates. */
  fill?: boolean;
}) {
  return (
    <td
      data-slot="table-cell"
      // p-0: the divider must run edge to edge, so the cell keeps no
      // padding of its own: the band inside owns every inset.
      className={cn(
        "border-row-divider border-b p-0",
        multiline ? "align-top" : "align-middle",
        fill && FILL,
        className,
      )}
      {...props}
    >
      <div
        data-slot="table-cell-band"
        className={cn(
          // my-1.5: the 6px of air that keeps the pill off the
          // divider. *:min-w-0 so a truncating child actually
          // shrinks. Flex items refuse to by default.
          "my-1.5 flex min-w-0 items-center gap-2 *:min-w-0",
          multiline ? "py-3" : "h-row",
          BAND_FILL,
          BAND_CORNERS,
          BAND_GUTTER,
          numeric && NUMERIC_BAND,
        )}
      >
        {children}
      </div>
    </td>
  );
}

function TableRowLink({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  /** Wrap a router Link: <TableRowLink asChild><Link …/></TableRowLink> */
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";
  // The ::after stretches over the row (which TableRow positions), so
  // the whole row opens it while the element stays a plain link: the
  // focus ring hugs the label, which is the honest target.
  return (
    <Comp
      data-slot="table-row-link"
      className={cn("truncate after:absolute after:inset-0", className)}
      {...props}
    />
  );
}

function TableRowActions({ className, ...props }: React.ComponentProps<"div">) {
  // Lifted above the row link's overlay. Without this the stretched
  // link swallows every click meant for these controls.
  return (
    <div
      data-slot="table-row-actions"
      className={cn(
        "z-raised relative flex items-center justify-end gap-1",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Usage:
 *
 *     <Table>
 *         <TableHeader>
 *             <TableRow>
 *                 <TableHead>المنتج</TableHead>
 *                 <TableHead numeric>السعر</TableHead>
 *                 <TableHead className="w-0">
 *                     <span className="sr-only">إجراءات</span>
 *                 </TableHead>
 *             </TableRow>
 *         </TableHeader>
 *         <TableBody>
 *             <TableRow interactive>
 *                 <TableCell>
 *                     <TableRowLink asChild>
 *                         <Link href="/products/1">شنطة جلد</Link>
 *                     </TableRowLink>
 *                 </TableCell>
 *                 <TableCell numeric className="latin">
 *                     {formatPrice(24900, { locale })}
 *                 </TableCell>
 *                 <TableCell className="w-0">
 *                     <TableRowActions>…ghost icon Button…</TableRowActions>
 *                 </TableCell>
 *             </TableRow>
 *         </TableBody>
 *     </Table>
 *
 * A sortable head carries aria-sort and wraps its link in TableSortLink,
 * which adds the direction glyph (idle shows on hover, or always on touch).
 * scroll={false}: a sort re-reads the same table, and jumping a long one
 * back to the top loses the row the reader was on.
 *
 *     <TableHead sort="ascending">
 *         <TableSortLink asChild sort="ascending">
 *             <Link href="?sort=name&dir=desc" scroll={false}>الاسم</Link>
 *         </TableSortLink>
 *     </TableHead>
 *
 * `interactive` + TableRowLink is the row-opens-a-page pattern; leave
 * both off for a table that only displays (no pointer, no hover fill;
 * a highlight on a dead row is a lie). Row actions live in a trailing
 * w-0 cell whose header label is sr-only; a ghost icon Button opening a
 * DropdownMenu is the house ⋯ pattern.
 *
 * className is LAYOUT only: column width (w-0 shrinks a column to its
 * content; `fill` on the head and cells is the one column that takes the
 * rest and truncates), and `hidden md:table-cell` on BOTH the head and the cell to
 * drop a column on small screens. Heights, gutters, dividers, the hover
 * pill and number alignment all come from the component.
 */
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
  TableRowLink,
  TableSortLink,
};
export type { TableSort };
