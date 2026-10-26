# Label notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/label.tsx`'s header comment.

## Doctrine

The third element of every form row: 14px medium in explicit foreground,
normal leading, never selectable, always a real `<label>` wired with
htmlFor. Two postures: stacked above a field, or inline wrapping a
control.

Stacked: label above the field, 6px stack gap, the field recipe's first
line.

Inline: the control sits inside the label with the same 6px gap.
Clicking the text toggles it. This is the checkbox / radio / switch row
pattern.

Control rows start-align. When the text wraps, the control stays on the
FIRST line, centred on it (a small top offset per control and per script:
Arabic's line is taller than Latin's), never floating at the middle of the
paragraph. On a touch screen a control row is at least 44px tall with its
first line centred in the box, so no form patches pointer-coarse:min-h-11
onto its labels. The "Long label" specimen shows the wrap in a narrow
column.

Optional fields: mark the minority, never with an asterisk. Usually that
means required goes unmarked and optional carries the localized hint; in
a majority-optional form (settings pages), flip it and mark the required
ones as text. hint joins the field's accessible name. Keep it to a word
or two (marker, units); longer context is helper text under the field
with aria-describedby.

Disabled pairing: the label FOLLOWS its field here, the one position
peer-disabled fires in; in the stacked recipe (label first) the field
dims alone, by design. Rejected on purpose: cursor-pointer, gray-900
text, 8px gaps, and bare `<p>` labels.

Disabled via a group: the second disabled hook. A wrapping group
carrying data-disabled dims the label with its field. This is the one
that reaches the stacked recipe, where the label sits before the field
and peer-disabled cannot. Without the wrapper a stacked disabled field
dims alone, the intended fallback.

Usage: always htmlFor, never a bare `<p>`. Helper text under a field is
subtle caption; error text is destructive caption; neither is a Label.

## Usage

```tsx
import { Label } from "@sirdab/one/components/ui/label";

<Label htmlFor="name">Product name</Label>          // stacked, above the field
<Label htmlFor="bio" hint={t("optional")}>Bio</Label> // optional is the marked case
<Label htmlFor="live">
    <Switch id="live" /> Store is live              // inline: control inside
</Label>
```
