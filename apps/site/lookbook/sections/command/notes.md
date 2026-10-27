# Command notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/command.tsx`'s header comment.

## Doctrine

The searchable menu (cmdk). Built for the frosted popover: the panel
stays translucent while the search header goes solid and sticky, so
scrolling text never reads through it. The input is a bare 40px field
with a hairline below and no search icon; items match select items:
ghost-fill highlight, 16px leading icons, 400-weight labels, quiet
caption headings; the list hides its scrollbar.

Inline: The list standing alone (bordered here for display; inside a
popover the panel owns the chrome). Type to filter; the empty state is
body text in the quiet colour. Enough rows to overflow the 280px cap:
the scrollbar is hidden, and the rows scroll BELOW the solid search
header (the list is the scroller, so nothing can pass under it). The
hairline below the months is CommandSeparator; the last row is a
disabled item, dimmed and skipped by keyboard and pointer.

Items with icons: Same row recipe as select options: 16px leading icon,
12px gap, 400-weight label, ghost-fill highlight.

## Usage

Inside a PopoverContent with p-0 this becomes the searchable select.
See the Select page's Searchable section for the full composition.

```tsx
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@sirdab/one/components/ui/command";

<Command>
    <CommandInput placeholder="ابحث…" />
    <CommandList>
        <CommandEmpty>ما فيه نتائج.</CommandEmpty>
        <CommandGroup heading="التصنيف">
            <CommandItem value="ملابس" onSelect={…}>ملابس</CommandItem>
        </CommandGroup>
    </CommandList>
</Command>
```
