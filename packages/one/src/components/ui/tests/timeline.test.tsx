import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrdersIcon } from "../../icons/shell";
import { Timeline, TimelineDay, TimelineItem } from "../timeline";

function board(): React.JSX.Element {
  return (
    <Timeline>
      <TimelineDay heading="Today">
        <TimelineItem
          icon={OrdersIcon}
          title="Order 1042 placed"
          time="09:40"
        />
        <TimelineItem
          icon={OrdersIcon}
          title="Order 1041 shipped"
          time="08:15"
        />
      </TimelineDay>
      <TimelineDay heading="Yesterday">
        <TimelineItem title="Order 1039 paid" time="17:05" />
      </TimelineDay>
    </Timeline>
  );
}

describe("Timeline", () => {
  it("renders days and rows in the order given, in an ordered list", () => {
    const { container } = render(board());
    expect(container.querySelector("ol[data-slot='timeline']")).not.toBe(null);
    const days = container.querySelectorAll("li[data-slot='timeline-day']");
    expect(days).toHaveLength(2);
    expect(days[0]?.textContent).toMatch(/^Today/);
    expect(days[1]?.textContent).toMatch(/^Yesterday/);
    const titles = [
      ...container.querySelectorAll("[data-slot='item-title']"),
    ].map((n) => n.textContent);
    expect(titles).toEqual([
      "Order 1042 placed",
      "Order 1041 shipped",
      "Order 1039 paid",
    ]);
  });

  it("puts one card in each day, rows divided by the group's hairlines", () => {
    const { container } = render(board());
    const days = container.querySelectorAll("li[data-slot='timeline-day']");
    const first = days[0] as HTMLElement;
    expect(first.querySelectorAll("[data-slot='card']")).toHaveLength(1);
    const group = first.querySelector("[data-slot='item-group']");
    expect(group?.className).toContain("divide-y");
    expect(group?.className).toContain("divide-border");
  });

  it("sets the time at the row's end in an LTR isolate", () => {
    render(board());
    const time = screen.getByText("09:40");
    expect(time.getAttribute("dir")).toBe("ltr");
    expect(time.closest("[data-slot='item-actions']")).not.toBe(null);
  });

  it("colours the glyph by tone, critical only when asked", () => {
    const { container } = render(
      <Timeline>
        <TimelineDay heading="Today">
          <TimelineItem
            icon={OrdersIcon}
            tone="critical"
            title="Refund not confirmed"
            time="10:00"
          />
          <TimelineItem icon={OrdersIcon} title="Order placed" time="09:00" />
        </TimelineDay>
      </Timeline>,
    );
    const media = container.querySelectorAll("[data-slot='item-media']");
    expect(media[0]?.className).toContain("text-destructive-glyph");
    expect(media[1]?.className).not.toContain("text-destructive-glyph");
    expect(media[1]?.className).toContain("text-neutral-glyph");
  });

  it("renders the detail well only when children are given", () => {
    const { container } = render(
      <Timeline>
        <TimelineDay heading="Today">
          <TimelineItem title="With" time="10:00">
            Where is my order?
          </TimelineItem>
          <TimelineItem title="Without" time="09:00" />
        </TimelineDay>
      </Timeline>,
    );
    const wells = container.querySelectorAll(
      "[data-slot='timeline-item-detail']",
    );
    expect(wells).toHaveLength(1);
    expect(wells[0]?.textContent).toBe("Where is my order?");
    expect(wells[0]?.className).toContain("bg-surface-whisper");
  });

  it("makes the row the child anchor with asChild, well via detail", () => {
    const { container } = render(
      <Timeline>
        <TimelineDay heading="Today">
          <TimelineItem asChild title="Order 7" time="10:00" detail="Note body">
            <a href="/orders/7" />
          </TimelineItem>
        </TimelineDay>
      </Timeline>,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/orders/7");
    expect(link.getAttribute("data-slot")).toBe("item");
    expect(link.textContent).toContain("Order 7");
    expect(
      link.querySelector("[data-slot='timeline-item-detail']")?.textContent,
    ).toBe("Note body");
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("keeps the glyph slot when a row has no icon", () => {
    const { container } = render(
      <Timeline>
        <TimelineDay heading="Today">
          <TimelineItem title="No glyph yet" time="10:00" />
        </TimelineDay>
      </Timeline>,
    );
    expect(container.querySelectorAll("[data-slot='item-media']")).toHaveLength(
      1,
    );
  });
});
