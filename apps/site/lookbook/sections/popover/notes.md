# Popover notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/popover.tsx`'s header comment.

## Doctrine

The frosted floating panel: popover surface at 90% over an 8px backdrop
blur (painted on a non-scrolling layer so lists inside scroll smoothly),
no border, shadow-popover-sm paints the hairline. Two tiers: panel
(10px, no inset, compositions own it: the Command combobox, menus) and
dialog (20px, p-4, the filter dialogs).

Panel: The 10px tier with a caller-owned inset (p-4 here as layout).
This is the surface the select menu and the Command combobox stand on.

Frost: The panel is translucent (popover at 90% over an 8px blur),
invisible over a white page, unmistakable over content. Open this one:
the ink tile ghosts through the list.

Dialog: kind='dialog': the 20px tier at p-4. The filter-dialog recipe:
label rows with segmented controls, stacked at gap-4. Never a third
surface inside the panel; rows use the segmented track.

## Usage

Trigger via asChild on a Button. className on the content is for
layout: width and (on the panel tier) padding; never colour or radius.
Radius comes from kind. For a searchable list inside, see Command; for
the applied-filter trigger, see the filter chip page.

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@sirdab/one/components/ui/popover";

<Popover>
    <PopoverTrigger asChild>
        <Button variant="secondary">خيارات</Button>
    </PopoverTrigger>
    <PopoverContent className="w-72 p-4">…</PopoverContent>
</Popover>

<PopoverContent kind="dialog" className="w-96">…</PopoverContent> // filter dialog, 20px + p-4
```
