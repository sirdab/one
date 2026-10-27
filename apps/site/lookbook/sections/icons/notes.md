# Icons notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/icon.tsx`'s header comment.

## Doctrine

One component, one decision: does the glyph mirror in RTL? That is
semantic, not automatic: flip is opt-in per icon. Switch the locale
toggle to Arabic and the flip grid mirrors while the fixed grid holds
still.

Flip (reading direction): arrows that mean forward/back, external
links, send, reply, drill-in chevrons, undo/redo. In Arabic these must
point the other way or they read backwards.

Never flip: symmetric glyphs, checkmarks, vertical chevrons, clocks.
And media playback: play stays ► in every language, a global
convention. Anything containing text, numbers, or a logo is also fixed.

Tone: quiet icons use the `icon-quiet` utility (SOLID ink plus a group
opacity, never an alpha colour), because lucide glyphs are overlapping
strokes and alpha ink double-paints at every intersection.

## Usage

Renders the svg directly, so Button and Input sizing rules keep
working. Inside those, pass no size. Decorative by default; aria-label
makes it meaningful. Convention: EVERY icon at a call site goes through
Icon, even non-flipping ones, so flip decisions have one home;
component-internal anatomy (select chevrons, the loading spinner) is
exempt.

```tsx
import { Icon } from "@sirdab/one/components/ui/icon";

<Icon icon={Search} />                           // never flips
<Icon icon={ArrowUpRight} flip />                // mirrors in RTL
<Icon icon={Bell} aria-label="Notifications" />  // announced to screen readers

<Button variant="ghost">
    Docs <Icon icon={ArrowUpRight} flip />       // sized by the button (16px)
</Button>
<Icon icon={Clock} className="size-4" />         // standalone: size it yourself
```
