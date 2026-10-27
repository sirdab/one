# Progress notes

Not rendered. The gallery page shows; this file explains. The component is
the shadcn add, trued in `components/ui/progress.tsx`.

## Doctrine

The track is the wash (`bg-muted`), the indicator is `bg-primary`. The
indicator is sized by `width`, not stock's `translateX`, so it fills from
the start edge in RTL with no direction check. No `value` is the
indeterminate state (the total is not known yet); never show "0 of 0".

## Usage

```tsx
import { Progress } from "@sirdab/one/components/ui/progress";

<Progress value={42} aria-label={t("progress")} />;
<Progress aria-label={t("progress")} />;
```
