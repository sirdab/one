# Selection notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in the header comments of
`components/ui/checkbox.tsx`, `radio-group.tsx`, and `switch.tsx`.

## Doctrine

Three ways to pick. A switch is a state of the thing and may save with
its form ("inventory tracked", "needs shipping", "code is active"); a
checkbox picks, includes or consents (a row in a list, an option, an
agreement); a radio group chooses one out of a visible few. Checked
states fill with primary ink: a control state is not a coloured button.
Focus is the global 2px ink outline, and Radix roving focus follows the
direction provider, so arrow keys work in RTL.

Checkbox: picks, includes or consents (selections, agreements,
options). If the word you want is a state of the thing ("tracked",
"active"), that is a Switch. A 16px box with a 4px corner on a mouse; on
a touch screen it is 20px with a 6px corner, and a 44px tap box surrounds
it either way. The border walks the form ladder (rest alpha-200, hover
one rung deeper); checked steps border and fill to primary ink with a
primary-foreground glyph drawn in a 14px box at stroke 3 (18px on touch),
so the tick reads black at 2x. It lands over 150ms by easing in from 75%,
with no overshoot, and snaps under reduced motion. Neither glyph is ever
mirrored in RTL: a check has no direction. Indeterminate is the third
state: same ink fill, a minus, never a check. Disabled dims the control
alone: peer-disabled needs the label AFTER its field, so inside the
wrapping Label the text keeps full strength, consistent with how stacked
disabled fields behave.

Select all: a list header shows the minus while some rows are picked, and
the check once all are (checked="indeterminate" on the header).

Radio group: one choice out of a visible few. Two to four options
stack, past five it is a Select. Arrow keys move the roving focus and
Radix follows the direction provider, so RTL works untouched. Same
chrome story as the checkbox: the border walks the form ladder (rest
alpha-200, hover one rung deeper), and checked is primary ink as RING +
DOT, never a fill, with the dot fading in at 100ms. The disabled item
dims while its label keeps full strength.

Switch: a state of the thing. The label names what is true when it is on,
and a switch may apply the moment it flips or save with its form; the
products page saves its switches with the rest of the product. One size,
20x36, with a 44px touch box around it. Checked is foreground ink, the
same ink a checked checkbox takes. Unchecked is the alpha-300 track, one
rung darker than the input hairline so OFF reads as a state you can turn
on and never as the dimmed disabled switch beside it (the "Off next to
disabled" specimen shows both); on a mouse the off track deepens one rung on
hover, and a checked one never shifts. Everything at 150ms ease-in-out,
and while held the thumb stretches 16 to 20px toward the track's middle.
RTL mirrors through the thumb's rtl: overrides because translate-x has no
logical variant.

Long label: a control row start-aligns, so when the text wraps the
control stays on the first line, centred on it (Label does the offset per
control and per script). The specimen is a narrow column in every locale.

Usage: labels WRAP their control. The 6px gap and the full-row click
target come from Label, so keep htmlFor and id wired even inside the
wrap. Never rebuild the row as control plus sibling Label with a
hand-rolled flex gap. className is for layout only; colour and state
come from the primitives.

## Usage

```tsx
import { Checkbox } from "@sirdab/one/components/ui/checkbox";
import { Label } from "@sirdab/one/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@sirdab/one/components/ui/radio-group";
import { Switch } from "@sirdab/one/components/ui/switch";

<Label htmlFor="gift">
    <Checkbox id="gift" defaultChecked /> Include gift wrapping  // picks, includes, consents
</Label>
<Label htmlFor="live">
    <Switch id="live" /> Store is live               // a state of the thing
</Label>
<Switch aria-label="Weekly reports" />               // unlabelled: name it for AT
```

```tsx
<RadioGroup defaultValue="standard">
  {" "}
  // one choice, all options visible
  <Label htmlFor="ship-std">
    <RadioGroupItem id="ship-std" value="standard" /> Standard shipping
  </Label>
  <Label htmlFor="ship-exp">
    <RadioGroupItem id="ship-exp" value="express" /> Express shipping
  </Label>
</RadioGroup>
```
