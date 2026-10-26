# Badge notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/badge.tsx`'s header comment.

## Doctrine

A badge says one of two things and the API makes you pick.

A **status** takes a `tone`: the tone's wash, its text step, a 6px dot at
the start of the reading direction, and the word. The colour says whose
move it is, one meaning per colour:

- neutral: nothing for you to do (done, closed, off, someone else's hands)
- attention: your move, and nothing is wrong (a draft lives here)
- warning: something is off and needs you soon
- critical: failed or refused, it will not fix itself
- success: live, on the shelf, switched on

Queues fade when done (fulfilled, paid, accepted, cancelled are neutral so
the eye goes to what is left); shelves glow when live (a product, a page,
the store, a connection is success).

A **tag** takes a `variant` and never a dot: `outline` for an attribute
(Digital, Package, Credit note, a customer's tag), `secondary` for a count
or a code, `ghost` for bare quiet text. Nothing paints a badge as ink.

Never colour alone: the word is the accessible name.

## Usage

The studio does not choose a tone at the call site. Each status union
maps to a tone in `apps/studio/app/app/_components/status/status-tones.ts`
and a test fails if a status is passed as a look.

```tsx
import { Badge, StatusNote } from "@sirdab/one/components/ui/badge";

<Badge tone="attention">Draft</Badge>;
<Badge variant="outline">Digital</Badge>;
<StatusNote tone="attention">Draft: only you can see it</StatusNote>;
```

An icon that sits on a card beside a status takes the tone's glyph step
(`text-attention-glyph`, `fill-success-glyph`), never `text-attention`.
