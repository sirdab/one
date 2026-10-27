# Segmented notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/segmented.tsx`'s header comment.

## Doctrine

A radio group wearing a track: a 4% wash (bg-muted) 40 high, 44 on a
touch screen, at 12px, holding 32px options (36 on touch) one radius step
in (8px: the 12px track minus the 4px pad, the nesting math). The checked
option carries a floating white thumb with the soft contact shadow that
slides between choices, its label expanding into view while the others
stay icon-only; icons rise from muted to ink over 200ms, and a mouse
hovering an unchosen option brings it to ink too. Arrow keys, roving
focus, and RTL come from the radio semantics.

One recipe: the track, item and thumb are three constants exported from
`segmented.tsx` (SEGMENTED_TRACK, SEGMENTED_ITEM, SEGMENTED_THUMB), and
Tabs with `variant="segmented"` reads the same three, so the two cannot
drift into two finishes of one shape (a solid gray track with a bordered
tab is exactly that drift). The "One recipe with Tabs" specimen puts them
side by side.

Modes: click between options and the thumb slides, the label of the
newly checked option expands in, the old one collapses. Icon-only at
rest keeps the track compact.

Marked: `mark` on an item adds the page tabs' 6px dot after the label with
its words as sr-only text, for an option that wants a look (a language with
texts missing). A dot, never a count.

Text only: omit the icon and labels are always visible (unchecked muted
rising to ink, thumb still sliding). Constant track width: the
no-layout-shift mode (the icon variant's expanding label resizes its
hugging track by design).

Static: `animated={false}` means no motion, and every option shows its
full label (hiding labels is only worth it as the expand animation's
payoff). Unchecked labels sit muted, the checked one at ink. For dense
chrome or reduced-motion surfaces.

Glyph only: `iconOnly` items are a 32px square, and 44 wide on a touch
screen so the 44px tap boxes of neighbours stop overlapping.

Long labels: never truncated. Items keep their width and the track
(max-w-full) scrolls in place as a last resort; labels as long as a
phrase, or more than four options, belong in a Select.

Concealed: `concealed` on the group keeps a toggle that has nothing to
act on yet laid out but invisible, inert and out of the accessibility
tree, then springs it in from 75% when it can (Button's `concealed`, the
same recipe, so a toolbar's width never moves). Reach for it instead of
`disabledReason` on every item: a phone has no hover to read the reason
on, and a control that cannot run is not offered.

Explaining the modes: two options side by side look interchangeable
until something says how they differ, so pass `hint` on each item and
the difference rides a tooltip that opens below the item, clear of any
action sitting beside the control. The label names the mode, the hint says
what it does. See the tooltip page for where that stops (a hint may
explain, never carry: there is no hover on touch).

## Usage

One checked value always (radio semantics). Use it for modes, not
filters. The static text segmented control (panels of content, tab
semantics) is the Tabs variant of the same recipe. Label strings come
localized from the caller.

```tsx
import { Icon } from "@sirdab/one/components/ui/icon";
import { Segmented, SegmentedItem } from "@sirdab/one/components/ui/segmented";

<Segmented value={mode} onValueChange={setMode} aria-label="وضع الإنشاء">
  <SegmentedItem
    value="generate"
    icon={<Icon icon={AudioLines} />}
    label="توليد"
  />
  <SegmentedItem value="video" icon={<Icon icon={Video} />} label="فيديو" />
</Segmented>;
```
