"use client";

import * as React from "react";

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

  moveBy: (index: number, by: number) => void;
  dragging: number | null;
} {
  const [dragging, setDragging] = React.useState<number | null>(null);
  const [over, setOver] = React.useState<number | null>(null);
  const handles = React.useRef(new Map<number, HTMLElement>());

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
