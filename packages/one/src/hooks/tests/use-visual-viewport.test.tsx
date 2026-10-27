import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useVisualViewport } from "../use-visual-viewport";

class FakeViewport extends EventTarget {
  height = 800;
  offsetTop = 0;

  resize(height: number, offsetTop = 0): void {
    this.height = height;
    this.offsetTop = offsetTop;
    this.dispatchEvent(new Event("resize"));
  }
}

const PHONE = "(width < 48rem)";

function stubMedia(matches: boolean): void {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === PHONE ? matches : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

let viewport: FakeViewport;

beforeEach(() => {
  viewport = new FakeViewport();
  Object.defineProperty(window, "visualViewport", {
    value: viewport,
    configurable: true,
  });
  stubMedia(true);
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "visualViewport");
});

describe("useVisualViewport", () => {
  it("reads the visible height and how far down it sits", () => {
    const { result } = renderHook(() => useVisualViewport(PHONE));
    expect(result.current).toEqual({ height: 800, offsetTop: 0 });
  });

  it("follows the keyboard coming up, and the page it scrolls", () => {
    const { result } = renderHook(() => useVisualViewport(PHONE));
    act(() => viewport.resize(480, 0));
    expect(result.current).toEqual({ height: 480, offsetTop: 0 });
    act(() => viewport.resize(480, 36));
    expect(result.current).toEqual({ height: 480, offsetTop: 36 });
  });

  it("holds one object while nothing changed, so it never re-renders on its own", () => {
    const { result } = renderHook(() => useVisualViewport(PHONE));
    const first = result.current;
    act(() => viewport.resize(800, 0));
    expect(result.current).toBe(first);
  });

  it("answers null where the media query does not hold", () => {
    stubMedia(false);
    const { result } = renderHook(() => useVisualViewport(PHONE));
    expect(result.current).toBeNull();
  });

  it("answers null where there is no visual viewport, or no query asked", () => {
    Reflect.deleteProperty(window, "visualViewport");
    expect(renderHook(() => useVisualViewport(PHONE)).result.current).toBe(
      null,
    );
    Object.defineProperty(window, "visualViewport", {
      value: viewport,
      configurable: true,
    });
    expect(renderHook(() => useVisualViewport(null)).result.current).toBe(null);
  });
});
