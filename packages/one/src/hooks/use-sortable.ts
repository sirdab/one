"use client";

import * as React from "react";

/* Reordering a short list by a handle: a pointer (mouse, pen or finger)
   carried by pointer events, the arrow keys for a keyboard, and moveBy for
   visible up and down buttons (SortArrows), all moving the same rows.

   No drag library and no browser drag and drop, on purpose: a list of a few
   rows needs no collision detection, and native drag and drop does not
   start from a finger, never starts inside a <button> in Firefox and
   depends on each browser's drag rules, so it failed where the pointer path
   did not. The handle captures the pointer and claims the gesture
   (touch-action: none), so carrying it never scrolls or selects text; the
   row under the pointer is the drop target, and letting go drops.

   Only the HANDLE starts a carry, never the row: a row that carried on any
   press would swallow the mouse inside the fields it holds.

   Usage:
       const sortable = useSortable({ count: items.length, onMove });
       // sortable.moveBy(index, -1) moves a row up, for SortArrows.
       items.map((item, i) => (
           <li key={item.id} {...sortable.itemProps(i)}>
               <Button asChild variant="ghost" size="icon-xl" hint={…}>
                   <span role="button" tabIndex={0} aria-label={…}
                       {...sortable.handleProps(i)}>
                       <Icon icon={GripVertical} />
                   </span>
               </Button>
               …
           </li>
       ));

   `itemProps` sets `data-dragging` on the row being carried and
   `data-drop-target` on the row it would land on, for the caller's styling.
*/
export interface SortableItemProps {
  "data-sortable-item": "";
  "data-sortable-index": number;
  "data-dragging": true | undefined;
  "data-drop-target": true | undefined;
}

export interface SortableHandleProps {
  ref: (node: HTMLElement | null) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  style: React.CSSProperties;
}

export function useSortable({
  count,
  onMove,
}: {
  count: number;
  onMove: (from: number, to: number) => void;
}): {
  itemProps: (index: number) => SortableItemProps;
  handleProps: (index: number) => SortableHandleProps;
  /** Moves a row by a step (-1 up, 1 down); a step past an end does
        nothing. */
  moveBy: (index: number, by: number) => void;
  dragging: number | null;
} {
  const [dragging, setDragging] = React.useState<number | null>(null);
  const [over, setOver] = React.useState<number | null>(null);
  const handles = React.useRef(new Map<number, HTMLElement>());
  /* A keyed row that moves is re-inserted into the DOM, and a re-inserted
       node loses focus: the handle the merchant was steering with would drop
       them at the top of the page after one arrow press. */
  const refocus = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    if (refocus.current === null) return;
    handles.current.get(refocus.current)?.focus();
    refocus.current = null;
  });

  function end(): void {
    setDragging(null);
    setOver(null);
  }

  function itemProps(index: number): SortableItemProps {
    const carrying = dragging !== null;
    return {
      "data-sortable-item": "",
      "data-sortable-index": index,
      "data-dragging": dragging === index || undefined,
      "data-drop-target":
        (carrying && over === index && dragging !== index) || undefined,
    };
  }

  /* The row of THIS list under the pointer, by its index: rows of another
       sortable list (an option's values inside the options list) are not
       places this row can land. */
  function rowUnder(event: React.PointerEvent<HTMLElement>): number | null {
    const own = event.currentTarget.closest("[data-sortable-item]");
    const hit = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("[data-sortable-item]");
    if (!(hit instanceof HTMLElement) || !own) return null;
    if (hit.parentElement !== own.parentElement) return null;
    const at = Number(hit.dataset.sortableIndex);
    return Number.isInteger(at) ? at : null;
  }

  function handleProps(index: number): SortableHandleProps {
    return {
      ref: (node) => {
        if (node) handles.current.set(index, node);
        else handles.current.delete(index);
      },
      onPointerDown: (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        /* A mouse press would start selecting the text it moves
                   over; held off here, so the focus is given back by hand
                   for the arrow keys. */
        if (event.pointerType === "mouse") {
          event.preventDefault();
          event.currentTarget.focus();
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(index);
        setOver(index);
      },
      onPointerMove: (event) => {
        if (dragging !== index) return;
        const at = rowUnder(event);
        if (at !== null && at !== over) setOver(at);
      },
      onPointerUp: (event) => {
        if (dragging !== index) return;
        const at = rowUnder(event) ?? over;
        if (at !== null && at !== index) onMove(index, at);
        end();
      },
      /* The browser took the gesture back (a native long-press drag, a
               system swipe): nothing moves. */
      onPointerCancel: end,
      style: { touchAction: "none" },
      onKeyDown: (event) => {
        const by =
          event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
        if (by === 0) return;
        event.preventDefault();
        const to = index + by;
        if (to < 0 || to >= count) return;
        refocus.current = to;
        onMove(index, to);
      },
    };
  }

  function moveBy(index: number, by: number): void {
    const to = index + by;
    if (to < 0 || to >= count) return;
    onMove(index, to);
  }

  return { itemProps, handleProps, moveBy, dragging };
}
