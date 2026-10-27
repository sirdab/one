# Filter chip notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/filter-chip.tsx`'s and
`components/ui/filter-trigger.tsx`'s header comments.

## Doctrine

A toggle at the smallest rung: 24px caption chip, bordered at rest,
INVERTING to full ink when pressed. The leading plus rotates into an X
as it goes. Chips run the 200ms colour tier. One real button with
aria-pressed; the icon is purely visual.

Toggle: press to apply. Border and fill invert, the plus becomes an X,
hover lightens the ink through the high alpha rungs.

States: unpressed walks the secondary wash ladder (rest, hover, active).
Pressed inverts to full ink and its hover/active lighten the ink through
the high alpha rungs 800 → 700, pinned on the gallery page so they read
without hovering (a lookbook-only exemption: product code must never
pass state colours through className).

With choices: the chip that opens, a Command list in the frosted
panel. Unselected it reads exactly like the toggle. Picking a value
inverts the chip and the selection animates in behind the divider; the
plus becomes an X that clears. Reselecting the current item also clears.
`searchPlaceholder` adds the search row; omit it for a plain list.

Filter trigger: the 40px member of the family. A FILTER narrows a
view: multi-select, searchable, clearable, which is exactly what a
Select is not (a select sets ONE form value and never clears). Its
trigger announces `aria-haspopup="dialog"` and opens the frosted
Popover + Command panel. Chrome is the chip ladder at the xl rung:
transparent with a STATIC alpha-200 border (the
border never steps; the ghost fills carry interaction: hover
alpha-100, active/open alpha-200), rounded-xl, 20px leading icon,
text-body label, trailing chevron at opacity-50 rotating 180 while
open, all on the chips' 200ms tier.

Applied, the resting chrome holds (inversion is the small tier's move):
the first pick's label animates in behind the family divider with a
tabular "+N" for the rest (8px off and in the quiet tier, so in Arabic
it reads «ملابس +2», never as the word's suffix), and the leading slot
swaps to the clear X.
Clear paths are FilterChipSelect's, one tier up: pointer on the X
(decorative to assistive tech), Delete/Backspace on the focused
trigger, or reselect an applied row to toggle just it off. Panel rows
toggle without closing, marked by a leading checkbox-style check in an
always-reserved box: checking never shifts the label.

Saying what a filter does: the chip label is what the filter is CALLED;
pass `hint` for what applying it does to the view. Filters are the
place users most often ask "what does this actually narrow?", and the
label rarely has room to answer. The same boundary applies as
everywhere: a hint explains, it never carries.

## Usage

A binary filter under a search bar: pressed means applied
(FilterChip). One value from a short list: FilterChipSelect. Several
values, long lists, search: FilterTrigger; it anchors the filter bar
while chips follow. The "+N" count localises: pass `numeralLocale`
("ar-SA" under Arabic).

```tsx
import { FilterChip } from "@sirdab/one/components/ui/filter-chip";

<FilterChip pressed={video} onPressedChange={setVideo}>فيديو</FilterChip>

<FilterChipSelect
    label="التصنيف"
    items={categories}
    value={category}
    onValueChange={setCategory}
    empty="ما فيه نتائج."
/>

<FilterTrigger
    label="التصنيف"
    icon={<Icon icon={Tag} />}
    items={categories}
    values={applied}
    onValuesChange={setApplied}
    searchPlaceholder="ابحث…"
    empty="ما فيه نتائج."
    clearLabel="مسح"
    numeralLocale="ar-SA"
/>
```
