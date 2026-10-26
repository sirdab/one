import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Callout } from "../callout";

const rect = { top: 10, left: 20, width: 100, height: 40 } as DOMRect;

function card(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="callout"]');
  if (el === null) throw new Error("no callout rendered");
  return el;
}

describe("Callout", () => {
  it("shows its title and body", () => {
    render(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real, at your address."
      />,
    );

    expect(screen.getByText("Publish")).toBeTruthy();
    expect(screen.getByText("Makes it real, at your address.")).toBeTruthy();
  });

  it("renders an action only when given one", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real."
      />,
    );
    expect(screen.queryByRole("button")).toBeNull();

    rerender(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real."
        action={{ label: "Got it", onClick }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("shows an eyebrow only when given one", () => {
    const { rerender } = render(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real."
      />,
    );
    expect(screen.queryByText("2 of 5")).toBeNull();

    rerender(
      <Callout
        rect={rect}
        side="bottom"
        meta="2 of 5"
        title="Publish"
        body="Makes it real."
      />,
    );
    expect(screen.getByText("2 of 5")).toBeTruthy();
  });

  it("stays inside the viewport for a control at the far edge", () => {
    const edge = { top: 10, left: 980, width: 40, height: 40 } as DOMRect;
    const { container } = render(
      <Callout
        rect={edge}
        side="bottom"
        title="Publish"
        body="Makes it real."
      />,
    );

    // jsdom's viewport is 1024 wide; a 224px box pinned at 980 would sit
    // mostly off screen, which is exactly what mirrors in RTL.
    expect(card(container).style.left).toBe("788px");
  });

  it("wears a real surface rather than bare text", () => {
    const { container } = render(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real."
      />,
    );
    const el = card(container);

    expect(el.className).toContain("bg-surface-modal");
    expect(el.className).toContain("shadow-modal");
  });

  it("sits clear of its own spotlight below the anchor", () => {
    const { container } = render(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real."
      />,
    );
    const el = card(container);

    // Padded hole bottom is 10 + 40 + 8 = 58; the card clears it by the
    // connector's elbow room rather than butting against it.
    expect(el.style.top).toBe("82px");
    expect(el.style.transform).toBe("");
  });

  it("flips above the anchor when there is no room below", () => {
    const low = { top: 700, left: 20, width: 100, height: 40 } as DOMRect;
    const { container } = render(
      <Callout
        rect={low}
        side="bottom"
        title="Publish"
        body="Makes it real."
      />,
    );
    const el = card(container);

    // jsdom's viewport is 768 tall. The padded hole starts at 692, so the
    // card hangs upward off that edge instead of running off screen.
    expect(el.style.top).toBe("668px");
    expect(el.style.transform).toBe("translateY(-100%)");
  });

  it("stays below when the requested side is the one that fits", () => {
    const high = { top: 4, left: 20, width: 100, height: 40 } as DOMRect;
    const { container } = render(
      <Callout rect={high} side="top" title="Publish" body="Makes it real." />,
    );

    // Asked for top, but there is nothing above the anchor to hang from.
    expect(card(container).style.transform).toBe("");
  });

  /* A studio panel is as tall as the window, so neither above nor below
       exists. The card has to go BESIDE it or it hangs off the top edge,
       which is what the first build of the studio walk actually did. */
  it("sits beside an anchor that is too tall for either side", () => {
    const panel = {
      top: 60,
      left: 340,
      width: 660,
      height: 690,
    } as DOMRect;
    const { container } = render(
      <Callout
        rect={panel}
        side="top"
        title="Preview"
        body="Your store, live as you build."
      />,
    );
    const el = card(container);

    // Padded hole starts at 332, so a 224px card plus its elbow room fits
    // between the viewport edge and the panel.
    expect(el.style.left).toBe("84px");
    expect(el.style.transform).toBe("");
    // Vertically centred on the hole: 52 + 706 / 2 - 148 / 2.
    expect(el.style.top).toBe("331px");
  });

  it("goes to the roomier side of a tall anchor", () => {
    const panel = { top: 60, left: 8, width: 320, height: 690 } as DOMRect;
    const { container } = render(
      <Callout
        rect={panel}
        side="top"
        title="Builder"
        body="Describe what you want."
      />,
    );

    // Nothing fits before a panel pinned to the start edge, so the card
    // takes the open ground after it: hole ends at 336, plus the elbow.
    expect(card(container).style.left).toBe("360px");
  });

  it("keeps a tall anchor's card on screen when neither side has room", () => {
    const wide = { top: 60, left: 8, width: 1008, height: 690 } as DOMRect;
    const { container } = render(
      <Callout rect={wide} side="top" title="Preview" body="Your store." />,
    );
    const el = card(container);

    expect(Number.parseInt(el.style.left, 10)).toBeGreaterThanOrEqual(12);
    expect(Number.parseInt(el.style.left, 10)).toBeLessThanOrEqual(
      1024 - 224 - 12,
    );
  });

  it("draws a connector to its anchor, and drops it on request", () => {
    const { container, rerender } = render(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real."
      />,
    );
    expect(
      container.querySelector('[data-slot="spotlight-connector"]'),
    ).not.toBeNull();

    rerender(
      <Callout
        rect={rect}
        side="bottom"
        title="Publish"
        body="Makes it real."
        connector={false}
      />,
    );
    expect(
      container.querySelector('[data-slot="spotlight-connector"]'),
    ).toBeNull();
  });
});
