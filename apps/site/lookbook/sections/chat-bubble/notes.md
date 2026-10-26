# Chat bubble notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/chat-bubble.tsx`'s header
comment.

## Doctrine

A transcript REPORTS, it never commands, so no bubble ever takes the ink
primary. The merchant's turn is the quiet `--muted` fill, end-aligned
(the chat convention); the assistant's turn is start-aligned and follows
the backing surface: `--surface-whisper` on a white rail, back to
`bg-background` on the shell's sunken backdrop (the whisper sandwich,
inverted one level).

The merchant fill is a blessed COLORS.md exception:
`--muted` is an alpha wash and doctrine says washes are never surfaces,
but no solid step exists at that lightness and bubbles never stack over
tints, so the wash cannot compound into a false tone.

## Usage

`className` stays layout-only (max-width, margins); `asChild` renders
the bubble as the caller's element for a semantic `<ol>`/`<li>`
transcript. The `role` prop is the SPEAKER, not the ARIA role.

```tsx
import { ChatBubble } from "@sirdab/one/components/ui/chat-bubble";

<ChatBubble role="merchant">Make the hero photo bigger</ChatBubble>
<ChatBubble surface="sunken">Done.</ChatBubble>
```
