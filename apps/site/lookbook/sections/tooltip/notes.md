# Tooltip notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/tooltip.tsx`'s header comment.

## Doctrine

A hint, never a home for anything essential: an ink chip at the body
role, capped at 256px (max-w-64) with pretty wrapping, 300ms delay, 8px
off its trigger. Not stock shadcn: the arrow is removed, the delay raised
from 0, and elevation/z come from the system tokens. Ink is deliberate
and it is the one ink surface that is not an action: a hint has to read at
a glance over a photo, a table or white paper, where a frosted chip greys
out on an image and reads as a tiny menu on white. It is text only, never
a target (COLORS.md, "Ink commands"). The 8px gap keeps it off the ink
focus ring and the ink primary button beside it; at 4px it merged with
them. There is one size: the unused caption variant is gone.

Basic: Hover or focus the trigger. The canonical case: a hint on an
icon-only ghost button, naming an action the glyph alone does not. The
CLOSED select (see Select) repeats its reason here on hover, but the
reason is already in the field: touch has no hover.

Explaining a choice: this is the load-bearing use, not a garnish. Our
controls are deliberately terse, a segmented option is one word or one
glyph and a filter chip is a noun, and that only works if the
explanation is one hover away. The label NAMES it, the hint says what
it DOES. Every control that abbreviates takes a `hint`: Button,
segmented items, and the whole filter family (the toggle chip, the chip
that opens, the 40px multi-value trigger). If you meet a terse control
without a `hint`, that is a gap in the component, not permission to
skip the explanation.

Icon-only buttons are the case that catches people out, because
`aria-label` looks like it already solved it. It did not: the label is
what a screen reader announces and the hint is what everyone else gets
instead of guessing at a glyph. Set both, usually to the same words.

Refusal: an action that cannot run yet is not shown at all. Where a
control has to stay visible and cannot act (a closed select, a locked
setting), it says why, through `disabledReason` or `closed`, and the
reason lives in the control or beside it, never only here (touch has no
hover). Note what that costs. The HTML `disabled` attribute drops an
element from the tab order and kills hover, which is where the
explanation lives, so a control with a reason goes `aria-disabled`
instead and blocks activation in its handler. That is why the reason is a
prop and not something you wrap by hand: wrap a really-disabled button in
a tooltip and it will never open.

Where it stops: a tooltip may EXPLAIN, never CARRY. Touch has no hover
and we are mobile-heavy, so anything needed in order to act belongs in
the label, in helper text, or in the empty state. If deleting every
tooltip would strand someone, the design is wrong. Hints stay a phrase;
a sentence is helper text in disguise.

Why `hint` and not a hand-wired tooltip: `TooltipTrigger asChild` on a
stateful control merges Radix's own `data-state` onto it and
overwrites `data-state="checked"` or `="on"`, so the control keeps
working while silently losing its selected look. The `hint` prop puts
the trigger on a wrapper instead. Focus still bubbles, so the keyboard
path is unaffected, and guard tests pin the attribute.

Long hint: a hint longer than a phrase wraps at 256px with pretty
(not balanced) wrapping, so a two-line Arabic hint does not leave a hole
at the end of its box. Past two lines it is helper text, not a tooltip.

Placement: side and align pass through (Radix): top is the default; the
popper flips automatically when there is no room. Sides are physical:
resolve direction yourself for leading/trailing placement.

Clusters: a toolbar of icon buttons wraps in ONE TooltipProvider, so
moving between adjacent triggers reopens instantly (skipDelayDuration)
instead of re-waiting 300ms each time.

## Usage

Trigger via asChild. Content is a short phrase. If it needs a sentence,
it belongs in helper text, not a tooltip.

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sirdab/one/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="نسخ">
      <Icon icon={Copy} />
    </Button>
  </TooltipTrigger>
  <TooltipContent>انسخ الرابط</TooltipContent>
</Tooltip>;
```
