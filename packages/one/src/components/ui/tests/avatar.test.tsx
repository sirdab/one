import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

/* Radix shows the fallback until the image has loaded, and with delayMs it
   holds the fallback back for that long. jsdom never loads an image, so the
   delay is the whole story here. */
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("Avatar", () => {
  it("shows the initial at once when there is no picture", () => {
    render(
      <Avatar>
        <AvatarFallback>S</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("S")).toBeTruthy();
  });

  it("holds the initial back while a picture may still load, then shows it", () => {
    render(
      <Avatar>
        <AvatarImage src="https://cdn/me.webp" alt="" />
        <AvatarFallback delayMs={600}>S</AvatarFallback>
      </Avatar>,
    );
    expect(screen.queryByText("S")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText("S")).toBeTruthy();
  });

  it("sizes by token and draws one hairline ring over the picture", () => {
    const { container } = render(
      <Avatar size="xl">
        <AvatarFallback>S</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]');
    expect(root?.getAttribute("data-size")).toBe("xl");
    expect(root?.className).toContain("size-14");
    expect(root?.className).toContain("after:ring-1");
    expect(root?.className).not.toContain("shadow");
  });
});
