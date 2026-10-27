import { render, screen } from "@testing-library/react";
import { Line, LineChart } from "recharts";
import { beforeAll, describe, expect, it } from "vitest";

import type { ChartConfig } from "../chart";
import { ChartContainer, ChartTooltipContent } from "../chart";

const config = {
  visitors: { label: "Visitors", color: "var(--color-primary)" },
  orders: { label: "Orders", color: "var(--color-gray-400)" },
} satisfies ChartConfig;

const STOCK_TYPE_UTILITY = `text-${"xs"}`;

type TooltipPayload = NonNullable<
  React.ComponentProps<typeof ChartTooltipContent>["payload"]
>[number];

function point(entry: Omit<TooltipPayload, "graphicalItemId">): TooltipPayload {
  return { graphicalItemId: "series-0", ...entry };
}

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
