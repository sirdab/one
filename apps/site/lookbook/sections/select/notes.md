# Select notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/select.tsx`'s header comment.

## Doctrine

A field that discloses a menu. A form select wears the INPUT's chrome,
read from the same constants the Input, Textarea and Combobox read
(`components/ui/field-chrome.ts`): the alpha-200 border that deepens to
alpha-400 on hover, no fill or press wash ever, the ink border plus a
0.5px ring on keyboard focus and while the panel is open (never the
global offset outline), the Input's value type (16px on a phone, 400
weight), and the Input's corner per size (12px at 40 and 44, 10px at
36). The panel is the frosted popover: translucent surface over an 8px
backdrop blur, no border, shadow-popover-sm paints the hairline. The menu
drops below the trigger; the chevron never flips and turns over in 200ms
ease-out.

Field states: Triggers hug their content [global rule]; a form row
passes w-full as layout. Rest with a value, a placeholder, a long value
(one line, ellipsis at the end), and CLOSED: unavailable until a
prerequisite, and the reason IS the field, shown as its placeholder
because touch has no hover; the tooltip repeats it on a mouse. That is
the only unavailable state there is. The `disabled:` styling that
survives is a fallback for machinery (a fieldset switching the button
off) and paints the same, so the two are indistinguishable. Open one to
see the ink edge and the frosted panel.

In a form: the Input and the Select side by side share one corner, one
border, one hover and one focus, and the value reads at the same size.
The Textarea below is the same family. This is the row merchants live
in.

Field sizes: 36 (lg), 40 (xl, the default, matching the Input default),
44 (touch). On a phone the trigger keeps its 40px look and carries a
44px tap box; the open panel's rows are at least 44px tall on touch.

Variants: a field on white is the default (secondary). On the rail (gray-50,
the only tinted surface) it is outline, and only outline: its transparent
base sits IN the tint. No primary, no link.

Toolbar flavour: ghost, chip, and any variant at 32 and below are menu
triggers, not fields. They keep Button's whole machine (hover and open
washes, the optical icon pull) and Button's corner. The props pick the
flavour (`data-flavour` reports it), there is no flag to set.

Leading icon: A child before SelectValue; scales per size (16 at 36, 20
at 40 and 44, Button's ladder in the toolbar flavour).

Without the chevron: chevron={false} drops the trailing icon. Two shapes:
a ghost text select for inline chrome, and the house ghost square (icon
size).

On a phone: below md (`(width < 48rem)`, the dialog launcher's own
breakpoint) a Select opens the house tray instead of the popover. The
primitive decides inside the open event, so there is nothing to opt into
and no first-paint correction. The tray is the Sheet at the bottom, titled
with the field's label (its `aria-label`, else `aria-labelledby`, else the
label that points at it), the options as 44px rows, the chosen one marked
with a check at the end and no fill. A tap on a row picks and closes; the
scrim, a drag and Escape close it unchanged, and there is no Done. Past 12
options a search field sits under the title, folded for Arabic spellings and
never autofocused, so the keyboard stays down until she asks for it. A row's
`action` is not drawn in the tray (it is pointer-only by construction) and
`disabledReason` becomes a caption line under the label. A Select inside a
Dialog, Sheet or Popover keeps the popover, and so does one with a
caller-controlled `open`. The words come from `SelectLabelsProvider`. The
tray cannot show at 1440, since the width decides at the tap, so the page's
"On a phone" group says to open it at 390.

Long lists: A constrained panel scrolls: radix mounts the chevron scroll
strips at either end, the frosted surface keeps content ghosting
underneath, and the list caps to the viewport when space runs out.

Items with icons: A leading icon in the option is a child before the
text: 16px with a 12px gap (the standard picker row), currentColor. The
check keeps its own reserved box.

Row actions: An option can carry its own control (a pin, a settings
tap) via the action slot. It reveals on row highlight (and when it
holds keyboard focus), and its clicks stop at the slot, so pressing it
never selects the option.

Groups and separator: Group labels are quiet caption; the separator is
the hairline.

Searchable, several values: that is the Combobox, a component of its own
(see its page). Its trigger is this select's field, by construction: the
same constants, the same chevron. It is Popover + Command underneath;
items toggle without closing, and its search header goes solid so
scrolling options never read through it. A filter is not a select: the
filter family (chips + FilterTrigger) lives on the filter chip page and
keeps Button's chrome, because it narrows a view.

## Usage

Width is a call-site layout decision (the trigger hugs its value
otherwise); the panel never renders narrower than the trigger. Wire a
Label to the trigger's id. Never reach for Radix's item-aligned mode:
the menu always drops below.

```tsx
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
    SelectSeparator, SelectTrigger, SelectValue,
} from "@sirdab/one/components/ui/select";

<Select value={category} onValueChange={setCategory}>
    <SelectTrigger className="w-56">
        <Icon icon={Tag} />
        <SelectValue placeholder="اختر التصنيف" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="apparel">ملابس</SelectItem>
        <SelectItem value="beauty">عناية</SelectItem>
    </SelectContent>
</Select>

<SelectTrigger>…</SelectTrigger>                     // secondary xl (the default): a FIELD, the Input's chrome
<SelectTrigger variant="ghost">…</SelectTrigger>     // toolbars (Button's chrome)
<SelectTrigger variant="chip">…</SelectTrigger>      // filters; pair the panel with the quiet recipe:
<SelectContent tone="quiet">…</SelectContent>        // items muted, rising to ink on highlight
<SelectTrigger variant="outline">…</SelectTrigger>   // fields on tinted surfaces (the gray-50 rail) ONLY

<SelectTrigger>…</SelectTrigger>                     // xl (40px): THE default, matches the input default
<SelectTrigger size="lg">…</SelectTrigger>           // 36px field (Input md)
<SelectTrigger size="default">…</SelectTrigger>      // 32px: a toolbar trigger, Button's chrome
```

```tsx
// Width: every trigger HUGS its content. Form rows pass w-full (or a
// column width) as call-site layout; the panel never renders narrower
// than the trigger.

<SelectTrigger closed="اختر اللغة أولاً">          // designed-unavailable: the reason is the field's placeholder
    <SelectValue placeholder="اللهجة" />            // (the tooltip repeats it on hover)
</SelectTrigger>

<SelectTrigger variant="ghost" chevron={false}>…</SelectTrigger>          // ghost text select, no chevron
<SelectTrigger variant="ghost" size="icon" chevron={false} aria-label="Filter">  // icon-only: icon size,
    <Icon icon={ListFilter} />                                            // aria-label, no SelectValue
</SelectTrigger>

<SelectContent>
    <SelectGroup>
        <SelectLabel>الشحن</SelectLabel>
        <SelectItem value="standard">شحن عادي</SelectItem>
    </SelectGroup>
    <SelectSeparator />                                // the hairline between groups
    <SelectItem value="returns">المرتجعات</SelectItem>
</SelectContent>
```
