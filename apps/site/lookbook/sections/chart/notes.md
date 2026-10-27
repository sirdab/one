# Chart notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/chart.tsx`'s header comment.

## What this is

A thin recharts wrapper, the first chart primitive in the system. It does
three things and nothing else:

1. Maps recharts' hardcoded literals (`#ccc` grid lines, `#fff` dot
   strokes) onto foundation tokens, so a chart is themed without a single
   call-site class.
2. Publishes the caller's series colours as `--color-<key>` scoped to one
   chart id, so several charts on one page can carry different palettes
   under the same config keys.
3. Gives the hover readout the house floating-panel treatment
   (`overlayPanelChrome`), the same frosted surface as Popover, Select and
   the dropdown menu.

Everything else stays recharts: you compose `AreaChart`, `Bar`, `XAxis`
and friends yourself, imported straight from `recharts`.

## Colour

Chart series are de-emphasised information, not status. Point them at the
ink pair first (`--color-primary`, then a gray step); reach for the status
ramps only when the data IS a status. Never a rainbow, and never a raw
ramp step: the config takes any CSS colour, which means it also takes any
mistake.

The config is the only place a chart declares colour. If a series colour
is wrong everywhere, fix the config; if it is wrong in every chart, the
token is wrong.

## Numbers

The tooltip prints values through `valueFormatter` when the caller passes
one, and through `toLocaleString()` with the ambient (browser) locale
otherwise; the value span carries `tabular-nums` so columns of digits do
not shimmer on hover. An app with a numerals rule passes its own formatter,
or an Arabic page reads Arabic-Indic on the axis and Latin on hover.
`valueFormatter` swaps the digits only; `formatter` (recharts' own) replaces
the whole row, swatch and label included. Axis ticks are the caller's:
format them with the same numeral rules the rest of the app uses
(`numerals.ts`).

## Usage

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import type { ChartConfig } from "@sirdab/one/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@sirdab/one/components/ui/chart";

const config = {
  visitors: { label: "الزوار", color: "var(--color-primary)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-56 w-full">
  <AreaChart data={rows}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area
      dataKey="visitors"
      stroke="var(--color-visitors)"
      fill="var(--color-visitors)"
      fillOpacity={0.12}
    />
  </AreaChart>
</ChartContainer>;
```

`ChartContainer` sizes itself `aspect-video` by default. Give it a height
class when the chart sits in a fixed-height tile; `className` on the
container is layout only, as everywhere else.
