# Textarea notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/textarea.tsx`'s header comment.

## Doctrine

The multiline sibling of Input: same hairline border and ink-plus-ring
focus, but NO hover state: a textarea goes straight from rest to focus.
Never user-resizable; grows with content from a 64px floor. Bare mode
hands the chrome to the surrounding panel.

States: rest → focus, nothing in between. Hovering a textarea changes
nothing, deliberately. Focus is the ink border plus the half-pixel ring.
The focus row is pinned; the live row is real.

With a label: the field recipe applies unchanged (label, field, helper
in subtle caption, 6px stack gap).

Invalid is text, never a border: same rule as the input; invalid never
colours the border. The error is destructive caption text under the
field, wired with aria-describedby; the label and placeholder stay
untouched.

The composer: the editor is a BARE textarea. No border, no ring, the
panel owns the chrome. Type is 16px, resize is off, and a bottom fade
tells you the text scrolls. The toolbar underneath is nothing new: a
chip and a primary button.

Usage: className is for layout on the bordered mode, and for
padding/height on bare mode (the panel owns those). Invalid never
colours the border; errors are text.

## Usage

```tsx
import { Textarea } from "@sirdab/one/components/ui/textarea";

<Textarea rows={4} />               // bordered, grows with content, never resizable
<Textarea bare className="p-4" />   // composer mode: panel owns the chrome

// Firefox note: field-sizing isn't supported there yet; the field
// degrades to its rows height, which is acceptable.
```
