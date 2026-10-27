import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlertsIcon } from "../../icons/shell";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("wells the icon in the quiet fill and keeps it decorative", () => {
    const { container } = render(
      <EmptyState icon={AlertsIcon} title="You are all caught up" />,
    );
    const well = container.querySelector(".bg-muted") as HTMLElement;
    expect(well).not.toBeNull();
    expect(well.className).toContain("size-10");
    expect(well.className).toContain("rounded-full");

    const svg = well.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders the caption and action only when given", () => {
    const { rerender } = render(
      <EmptyState icon={AlertsIcon} title="Nothing yet" />,
    );
    expect(screen.queryByText("Alerts land here.")).toBeNull();

    rerender(
      <EmptyState
        icon={AlertsIcon}
        title="Nothing yet"
        caption="Alerts land here."
        action={<button type="button">Refresh</button>}
      />,
    );
    expect(screen.getByText("Alerts land here.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeDefined();
  });

  it("speaks up at lg and keeps the whisper by default", () => {
    const { rerender } = render(
      <EmptyState icon={AlertsIcon} title="No store yet" />,
    );
    const quiet = screen.getByText("No store yet");
    expect(quiet.className).toContain("text-body-quiet");
    expect(quiet.className).toContain("text-muted-foreground");

    rerender(<EmptyState icon={AlertsIcon} title="No store yet" size="lg" />);
    const loud = screen.getByText("No store yet");
    expect(loud.className).toContain("text-heading-xs");
    expect(loud.className).toContain("text-foreground");
    expect(loud.className).not.toContain("text-body-quiet");
  });
});
