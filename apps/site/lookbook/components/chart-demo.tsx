"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { ChartConfig } from "@sirdab/one/components/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@sirdab/one/components/chart";
import { sampler } from "./samples";

/* Recharts measures the DOM, so every specimen is client-side. Series
   colours come from the config, which is the only place a chart declares
   colour: charts read as de-emphasised information, so the ink pair
   (primary, then a gray step) beats a rainbow. */
const DAYS = [
  { day: "Sun", visitors: 186, orders: 12 },
  { day: "Mon", visitors: 305, orders: 21 },
  { day: "Tue", visitors: 237, orders: 15 },
  { day: "Wed", visitors: 273, orders: 19 },
  { day: "Thu", visitors: 209, orders: 11 },
  { day: "Fri", visitors: 414, orders: 33 },
  { day: "Sat", visitors: 352, orders: 27 },
] as const;

export function ChartAreaDemo({
  locale = "en",
}: {
  locale?: string;
}): React.JSX.Element {
  const s = sampler(locale);
  const config = {
    visitors: { label: s("Visitors"), color: "var(--color-primary)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-56 w-full">
      <AreaChart data={[...DAYS]} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="visitors"
          type="natural"
          stroke="var(--color-visitors)"
          fill="var(--color-visitors)"
          fillOpacity={0.12}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function ChartBarDemo({
  locale = "en",
}: {
  locale?: string;
}): React.JSX.Element {
  const s = sampler(locale);
  const config = {
    visitors: { label: s("Visitors"), color: "var(--color-primary)" },
    orders: { label: s("Orders"), color: "var(--color-gray-400)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-56 w-full">
      <BarChart data={[...DAYS]} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
        <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
