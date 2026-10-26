import * as React from "react";

const SLIDE_MS = 200;

/* The sliding mark of a group (Segmented's thumb, the underline of Tabs): it
   lives INSIDE the item that is now chosen, so it follows that item's width
   as a label opens, and it is born at the previous item's edges and eased
   home. A FLIP on `left` and `right`: the offset is written with transitions
   off, one read of layout commits it, then it is cleared and the element's own
   `transition-all duration-200` carries it to rest.

   Physical rects, so a right-to-left row slides the right way with no
   direction switch. Nothing runs on the first paint (there is no previous
   item), under reduced motion, or when the item did not move. `data-sliding`
   is on the element while it travels: styles and tests can see it, and it
   ends on the transition's own event with a timer behind it for the case
   where the browser never fires one (a hidden tab).

   Usage: put the returned ref on the mark, rendered only in the chosen item,
   and pass the group's value as `key`. */
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
    // Reading layout commits the offset as the frame the transition
    // leaves from.
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
