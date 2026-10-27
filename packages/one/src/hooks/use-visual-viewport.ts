import * as React from "react";

export interface VisualViewportBox {
  height: number;
  offsetTop: number;
}

export function useVisualViewport(
  mediaQuery: string | null,
): VisualViewportBox | null {
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
