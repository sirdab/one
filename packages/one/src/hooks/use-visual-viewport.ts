import * as React from "react";

/* The part of the screen the person can actually see.
 *
 * On a phone that is not the layout viewport. The on-screen keyboard
 * shrinks the visual viewport and leaves the layout one alone, and iOS then
 * scrolls the page to keep the focused field in view, so a panel sized with
 * `h-dvh` keeps its bottom rows under the keys and a panel pinned to
 * `top: 0` can sit above the visible area. Sizing a full-screen panel to
 * this box (its height, and how far down it starts) keeps the last row of a
 * list and a field's own keyboard action in view.
 *
 * Only while `mediaQuery` holds, because from md up the same dialog is a
 * panel that sizes itself and must not be stretched. `null` where there is
 * no visual viewport, where the query does not hold, and on the server. */
export interface VisualViewportBox {
  height: number;
  offsetTop: number;
}

export function useVisualViewport(
  mediaQuery: string | null,
): VisualViewportBox | null {
  // One object per distinct reading: useSyncExternalStore compares
  // snapshots with Object.is, and a new object on every read would
  // re-render forever.
  const last = React.useRef<VisualViewportBox | null>(null);

  const subscribe = React.useCallback(
    (onChange: () => void): (() => void) => {
      if (mediaQuery === null) return () => {};
      const viewport = window.visualViewport;
      const media = window.matchMedia(mediaQuery);
      viewport?.addEventListener("resize", onChange);
      viewport?.addEventListener("scroll", onChange);
      media.addEventListener("change", onChange);
      return () => {
        viewport?.removeEventListener("resize", onChange);
        viewport?.removeEventListener("scroll", onChange);
        media.removeEventListener("change", onChange);
      };
    },
    [mediaQuery],
  );

  const getSnapshot = React.useCallback((): VisualViewportBox | null => {
    const viewport = window.visualViewport;
    if (
      mediaQuery === null ||
      viewport == null ||
      !window.matchMedia(mediaQuery).matches
    ) {
      last.current = null;
      return null;
    }
    const { height, offsetTop } = viewport;
    const held = last.current;
    if (
      held !== null &&
      held.height === height &&
      held.offsetTop === offsetTop
    ) {
      return held;
    }
    last.current = { height, offsetTop };
    return last.current;
  }, [mediaQuery]);

  return React.useSyncExternalStore(subscribe, getSnapshot, () => null);
}
