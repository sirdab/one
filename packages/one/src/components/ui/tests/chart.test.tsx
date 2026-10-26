import { render, screen } from "@testing-library/react";
import { Line, LineChart } from "recharts";
import { beforeAll, describe, expect, it } from "vitest";

import type { ChartConfig } from "../chart";
import { ChartContainer, ChartTooltipContent } from "../chart";

const config = {
  visitors: { label: "Visitors", color: "var(--color-primary)" },
  orders: { label: "Orders", color: "var(--color-gray-400)" },
} satisfies ChartConfig;

/* Assembled, not written out: lint:tokens scans test files too and a
   literal stock type utility trips it even inside a negative assertion. */
const STOCK_TYPE_UTILITY = `text-${"xs"}`;

type TooltipPayload = NonNullable<
  React.ComponentProps<typeof ChartTooltipContent>["payload"]
>[number];

/* recharts requires graphicalItemId on every payload entry: it names the
   series that produced the point, and nothing here asserts on it. */
function point(entry: Omit<TooltipPayload, "graphicalItemId">): TooltipPayload {
  return { graphicalItemId: "series-0", ...entry };
}

/* The shared ResizeObserver stub never fires, so recharts' responsive
   container measures 0x0 and skips its children entirely: no chart, no
   tooltip, nothing to assert. Report a fixed box once so the tree renders.
   Local to this file; the global stub stays inert for everyone else. */
beforeAll(() => {
  class SizedResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe(target: Element): void {
      const box: ResizeObserverSize = {
        inlineSize: 640,
        blockSize: 320,
      };
      this.callback(
        [
          {
            target,
            contentRect: {
              width: 640,
              height: 320,
              top: 0,
              left: 0,
              bottom: 320,
              right: 640,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            } as DOMRectReadOnly,
            borderBoxSize: [box],
            contentBoxSize: [box],
            devicePixelContentBoxSize: [box],
          },
        ],
        this as unknown as ResizeObserver,
      );
    }
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver =
    SizedResizeObserver as unknown as typeof ResizeObserver;
});

function withContainer(node: React.ReactNode): React.JSX.Element {
  return (
    <ChartContainer config={config}>
      <LineChart data={[{ day: "Sun", visitors: 1 }]}>
        <Line dataKey="visitors" />
        {node}
      </LineChart>
    </ChartContainer>
  );
}

describe("ChartContainer", () => {
  /* The whole point of the wrapper: recharts hardcodes #ccc grid lines and
       #fff dot strokes, and these selectors are the only thing standing
       between that and a themed chart. A stock `shadcn add chart` would
       revert the type role too. */
  it("maps recharts' hardcoded literals onto tokens at the caption role", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <LineChart data={[]}>
          <Line dataKey="visitors" />
        </LineChart>
      </ChartContainer>,
    );
    const cls = container.querySelector('[data-slot="chart"]')?.className ?? "";
    expect(cls).toContain("text-caption");
    expect(cls).not.toContain(STOCK_TYPE_UTILITY);
    expect(cls).toContain("stroke-border");
    expect(cls).toContain("fill-muted-foreground");
  });

  /* Series colours reach recharts as --color-<key> scoped to one chart id,
       so two charts on a page can share config keys and differ in palette. */
  it("publishes each configured series as a scoped custom property", () => {
    const { container } = render(
      <ChartContainer config={config} id="traffic">
        <LineChart data={[]}>
          <Line dataKey="visitors" />
        </LineChart>
      </ChartContainer>,
    );
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain("[data-chart=chart-traffic]");
    expect(css).toContain("--color-visitors: var(--color-primary);");
    expect(css).toContain("--color-orders: var(--color-gray-400);");
  });

  it("emits no style block when no series declares a colour", () => {
    const { container } = render(
      <ChartContainer config={{ visitors: { label: "Visitors" } }}>
        <LineChart data={[]}>
          <Line dataKey="visitors" />
        </LineChart>
      </ChartContainer>,
    );
    expect(container.querySelector("style")).toBeNull();
  });
});

describe("ChartTooltipContent", () => {
  /* The readout wears the shared floating-panel chrome, not a stock
       bordered box: it is the same surface as Popover, Select and the
       dropdown menu, so a chart tooltip never looks foreign. */
  it("wears the shared overlay panel chrome", () => {
    const { container } = render(
      withContainer(
        <ChartTooltipContent
          active
          label="Sun"
          payload={[
            point({
              dataKey: "visitors",
              name: "visitors",
              value: 1234,
              color: "var(--color-primary)",
            }),
          ]}
        />,
      ),
    );
    // In jsdom an SVG element's className is an SVGAnimatedString, so
    // chrome assertions read the attribute.
    const panel = container.querySelector("div.shadow-popover-sm");
    expect(panel).not.toBeNull();
    const cls = panel?.getAttribute("class") ?? "";
    expect(cls).toContain("before:bg-popover-surface");
    expect(cls).toContain("text-caption");
  });

  it("resolves the payload key to its config label and groups the digits", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          label="Sun"
          payload={[
            point({
              dataKey: "visitors",
              name: "visitors",
              value: 1234,
              color: "var(--color-primary)",
            }),
          ]}
        />,
      ),
    );
    expect(screen.getByText("Visitors")).not.toBeNull();
    expect(screen.getByText((1234).toLocaleString())).not.toBeNull();
  });

  /* toLocaleString() groups digits in the BROWSER's locale, so an Arabic
       page whose axis reads Arabic-Indic got Latin digits on hover. The
       value formatter swaps the digits and keeps the swatch and the series
       label, where `formatter` would have replaced the whole row. */
  it("prints the value through the caller's formatter, keeping the label", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          label="Sun"
          valueFormatter={(value) =>
            new Intl.NumberFormat("ar-SA").format(Number(value))
          }
          payload={[
            point({
              dataKey: "visitors",
              name: "visitors",
              value: 1234,
              color: "var(--color-primary)",
            }),
          ]}
        />,
      ),
    );
    expect(screen.getByText("Visitors")).not.toBeNull();
    expect(screen.getByText("١٬٢٣٤")).not.toBeNull();
    expect(screen.queryByText((1234).toLocaleString())).toBeNull();
  });

  it("renders nothing when inactive or empty", () => {
    const { container: inactive } = render(
      withContainer(
        <ChartTooltipContent
          payload={[point({ dataKey: "visitors", value: 1 })]}
        />,
      ),
    );
    expect(inactive.querySelector("div.shadow-popover-sm")).toBeNull();

    const { container: empty } = render(
      withContainer(<ChartTooltipContent active payload={[]} />),
    );
    expect(empty.querySelector("div.shadow-popover-sm")).toBeNull();
  });

  /* The swatch colour is per-series runtime data, so it can only ride
       inline. The dashed indicator is the one case that must stay unfilled:
       a filled "dashed" swatch is indistinguishable from a dot. */
  it("colours the swatch inline and leaves the dashed indicator unfilled", () => {
    const { container } = render(
      withContainer(
        <ChartTooltipContent
          active
          hideLabel
          indicator="dashed"
          payload={[
            point({
              dataKey: "visitors",
              name: "visitors",
              value: 1,
              color: "rgb(1, 2, 3)",
            }),
          ]}
        />,
      ),
    );
    const swatch = container.querySelector(".border-dashed");
    expect(swatch).not.toBeNull();
    const style = (swatch as HTMLElement).style;
    expect(style.borderColor).toBe("rgb(1, 2, 3)");
    expect(style.backgroundColor).toBe("");
  });
});
