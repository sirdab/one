# Skeleton notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/skeleton.tsx`'s header comment.

## Doctrine

The fill is `--muted`, our quiet fill for icon wells, skeletons and
chips, not stock shadcn's `--accent`. Accent is the interaction rung;
something that is loading is not something you are touching.

Radius is the default `rounded-md`; a circular avatar skeleton overrides
it at the call site with `rounded-full`, since that is geometry the
caller knows and the component does not.

## Usage

A skeleton stands in for the VALUE, never the label. Labels are already
known at render time, so painting them as bars makes a loading screen
read as more unknown than it is. Give the skeleton the geometry of the
real content: same height, roughly the same width, same position.

Do not animate a page full of them at staggered delays. One pulse, all
together, is the house treatment.

```tsx
import { Skeleton } from "@sirdab/one/components/ui/skeleton";

<Skeleton className="h-6 w-24" />;
```
