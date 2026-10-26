import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSortable } from "../use-sortable";

function List({ initial }: { initial: string[] }): React.JSX.Element {
  const [items, setItems] = React.useState(initial);
  const sortable = useSortable({
    count: items.length,
    onMove: (from, to) =>
      setItems((current) => {
        const next = [...current];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item!);
        return next;
      }),
  });
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item} {...sortable.itemProps(index)}>
          <span
            role="button"
            tabIndex={0}
            aria-label={`Move ${item}`}
            {...sortable.handleProps(index)}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function order(): string[] {
  return screen.getAllByRole("listitem").map((li) => li.textContent ?? "");
}

describe("useSortable", () => {
  it("moves a row with the arrow keys, and the handle keeps focus", () => {
    render(<List initial={["S", "M", "L"]} />);
    const handle = screen.getByRole("button", { name: "Move L" });
    handle.focus();
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    expect(order()).toEqual(["S", "L", "M"]);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Move L" }),
    );
  });

  it("does not move past either end", () => {
    render(<List initial={["S", "M"]} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Move S" }), {
      key: "ArrowUp",
    });
    expect(order()).toEqual(["S", "M"]);
  });

  /* The handle follows the pointer itself and drops on the row under it,
       for a mouse as much as a finger: the browser's own drag and drop
       never started for some merchants, and never starts from a finger. */
  function carry(
    handle: HTMLElement,
    target: HTMLElement,
    pointerType: "mouse" | "touch",
  ): void {
    const elementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => target;
    handle.setPointerCapture = () => {};
    try {
      const init = { pointerType, pointerId: 1, button: 0 };
      fireEvent.pointerDown(handle, init);
      fireEvent.pointerMove(handle, init);
      fireEvent.pointerUp(handle, init);
    } finally {
      document.elementFromPoint = elementFromPoint;
    }
  }

  it.each(["mouse", "touch"] as const)(
    "moves a row carried by a %s to the row it is let go over",
    (pointerType) => {
      render(<List initial={["S", "M", "L"]} />);
      carry(
        screen.getByRole("button", { name: "Move S" }),
        screen.getAllByRole("listitem")[2]!,
        pointerType,
      );
      expect(order()).toEqual(["M", "L", "S"]);
    },
  );

  it("does not carry on a right click", () => {
    render(<List initial={["S", "M"]} />);
    const handle = screen.getByRole("button", { name: "Move S" });
    const init = { pointerType: "mouse", pointerId: 1, button: 2 };
    fireEvent.pointerDown(handle, init);
    fireEvent.pointerUp(handle, init);
    expect(order()).toEqual(["S", "M"]);
  });
});
