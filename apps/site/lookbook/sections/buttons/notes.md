# Buttons notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/button.tsx`'s header comment.

## Doctrine

The Sirdab button: one component, every action in the product. Primary is
ink and there is one per view; secondary is the workhorse; ghost carries
icon-only actions; chips filter; destructive is a red outline reserved
for catastrophic confirmations. Every cell in the matrix is a live
button. Hover, press, and tab through it.

State matrix: the outline row sits on its home surface (the rail
gray-50, the only tinted region in the product). Rest → hover steps one
alpha rung → active/press one more. Open (menus, toggles) shows the
hover pair on bordered variants and the active fill on primary and
ghost; link has no open state. Disabled primary is a solid fill;
bordered variants keep their rest border and dim the text. Loading swaps
the label for the spinner. The hover/active columns are pinned via
className to make the matrix readable. That is a lookbook-only
exemption; product code must never pass state colours through className.

Sizes × variants: radius rides the size (8px at 24px, 10px through
28–36px, 12px at 40px). Type: caption / label / body. Same grid for
every variant.

Icon-only × variants: squares at every control size. Ghost is our
canonical icon-button variant (toolbars, the trailing button inside an
input); it never gets a border. Secondary icon squares are the bordered
top-bar kind (notifications, settings).

Leading & trailing icons: leading icons take the 2px optical pull toward
the start edge with the 6px gap to text; the pull is logical, so it
flips in RTL. Trailing icons (chevrons, external-link arrows) sit flush.

In practice: compositions the studio will actually ship. The prompt-bar
generate action, collection creation, the top-bar squares, a category
filter chip, and a live loading state.

Usage: pick a variant by role. A button sharing a row with an input is
size xl (40px, matching the input default). Both on their defaults is
8px misaligned. className is for layout only: w-full, margins, grid
placement are fine; colour, radius, and size are not, those come from
the variant and size props. If no variant covers a need, that is a
design-system conversation, not a className override.

## On a phone

- **Touch targets come with the button.** Every `Button` (and `Toggle`)
  carries `touch-target`: on a touch screen an invisible box at least 44px
  square takes the tap, so a 28px icon button meets the platform floor
  without growing. Nothing to add at the call site; a scrolling container
  that clips it needs `pointer-coarse:py-1` (and the matching negative
  margin) to make room.
- **`phone="icon"` folds a labelled button to its glyph below sm**, centred,
  with the label kept for screen readers (New and Import on the products
  page).

## Usage

```tsx
import { Button } from "@sirdab/one/components/ui/button";

<Button>حفظ التغييرات</Button>                              // THE action, one per view
<Button variant="secondary">Preview</Button>               // the default choice for everything else
<Button variant="ghost" size="icon" aria-label="Settings"> // icon-only: ghost + aria-label
    <Icon icon={Settings}  />
</Button>
<Button variant="chip"><Icon icon={ListFilter}  /> Apparel</Button>     // filters & toggles
<Button variant="outline">Duplicate</Button>               // secondary for TINTED surfaces
                                                           // (transparent base: secondary
                                                           // on colour reads as a white box)
<Button variant="destructive">Delete store</Button>        // catastrophic confirmations ONLY
<Button variant="link">{s("View storefront")}</Button>            // inline text action, no box
```

```tsx
<Button size="xs">…</Button>        // 24px: chips, tag rows
<Button size="sm">…</Button>        // 28px: dense rows
<Button>…</Button>                  // 32px: THE primary action; also toolbars/dense chrome
<Button size="lg">…</Button>        // 36px: pairs Input size="md"
<Button size="xl">…</Button>        // 40px: the HOUSE default row (secondary next to fields)

<Button loading>Generating…</Button>          // spinner overlay, label hidden
<Button asChild>                              // renders as the child element;
    <Link href="/signup">Start selling</Link> // disabled works via aria-disabled
</Button>

<Button><Icon icon={PlusIcon}  /> Add product</Button>         // leading icon: auto optical pull
<Button variant="secondary">                  // trailing icon: sits flush
    Options <Icon icon={ChevronDownIcon}  />
</Button>
```
