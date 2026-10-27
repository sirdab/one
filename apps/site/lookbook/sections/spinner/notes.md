# Spinner notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/spinner.tsx`'s header comment.

## Doctrine

Spinners are INK (TOKENS.md): activity is a statement that the product
is working, not an accent. LoaderCircle, `animate-spin`, and
`motion-reduce:animate-none`, always. Never hand-roll a border spinner:
a rounded border with one transparent side drifts off the icon grid and
skips the reduced-motion gate.

Button and Input keep their own internal spinners: theirs are state
machines (loading swaps content in place); this one is free-standing.

## Usage

Decorative by default; the surrounding line names the activity. Pass
`aria-label` only when the spinner stands alone.

```tsx
import { Spinner } from "@sirdab/one/components/ui/spinner";

<Spinner size="sm" />;
```
