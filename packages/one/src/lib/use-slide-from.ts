import * as React from "react";

const SLIDE_MS = 200;

export function useSlideFrom<T extends HTMLElement>(
  key: string | undefined,
  enabled: boolean = true,
): React.RefObject<T | null> {
  const mark = React.useRef<T | null>(null);
  const lastHost = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    const element = mark.current;
    if (element === null) return;
    const host = element.parentElement;
    const from = lastHost.current;
    lastHost.current = host;
    if (!enabled || host === null || from === null) return;
    if (from === host || !from.isConnected) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const start = from.getBoundingClientRect();
    const rest = host.getBoundingClientRect();
    const left = start.left - rest.left;
    const right = rest.right - start.right;
    if (left === 0 && right === 0) return;

    element.style.transition = "none";
    element.style.left = `${left}px`;
    element.style.right = `${right}px`;

    element.getBoundingClientRect();
    element.style.transition = "";
    element.style.left = "";
    element.style.right = "";
    element.setAttribute("data-sliding", "");

    const finish = (): void => {
      element.removeAttribute("data-sliding");
      element.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
    const onEnd = (event: Event): void => {
      if (event.target === element) finish();
    };
    const timer = window.setTimeout(finish, SLIDE_MS + 100);
    element.addEventListener("transitionend", onEnd);
    return finish;
  }, [key, enabled]);

  return mark;
}
