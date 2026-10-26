# Wave loader notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/wave-loader.tsx`'s header comment.

## When to use it

The Spinner is the default: inline beside text, inside a button or an
input, anywhere small. The wave loader is for a region that is itself
waiting and has room around it, such as a panel's loading state (the
Alerts panel). Never both in one place.

## Doctrine

Ink, like the Spinner (TOKENS.md: activity, not decoration). The motion is
the foundation's `animate-wave-bar` on the loop speed (`--duration-spin`)
and `--ease-in-out`; reduced motion stills the bars in their wave shape.
After loading-ui's Wave (MIT, loading-ui.com), rebuilt rather than
installed.

## Usage

Decorative by default; the surrounding region names the activity. Pass
`aria-label` only when it stands alone.

```tsx
import { WaveLoader } from "@sirdab/one/components/ui/wave-loader";

<div role="status" aria-busy="true">
  <WaveLoader aria-label={t("loading")} />
</div>;
```
