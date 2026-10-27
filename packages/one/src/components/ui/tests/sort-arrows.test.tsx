import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSortable } from "../../../hooks/use-sortable";
import { SortArrows } from "../sort-arrows";

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
        <li key={item}>
          <SortArrows
            index={index}
            count={items.length}
            onMove={sortable.moveBy}
            upLabel={`Up ${item}`}
            downLabel={`Down ${item}`}
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

function button(name: string): HTMLButtonElement {
  return screen.getByRole<HTMLButtonElement>("button", { name });
}

describe("SortArrows", () => {
  it("moves a row one step either way", () => {
    render(<List initial={["S", "M", "L"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Down S" }));
    expect(order()).toEqual(["M", "S", "L"]);
    fireEvent.click(screen.getByRole("button", { name: "Up L" }));
    expect(order()).toEqual(["M", "L", "S"]);
  });

  it("stacks the default pair for a mouse and spaces the phone pair", () => {
    render(
      <>
        <SortArrows
          index={1}
          count={3}
          onMove={() => {}}
          upLabel="Up stacked"
          downLabel="Down stacked"
        />
        <SortArrows
          phone
          index={1}
          count={3}
          onMove={() => {}}
          upLabel="Up phone"
          downLabel="Down phone"
        />
      </>,
    );
    const pair = (name: string): Element | null =>
      button(name).closest('[data-slot="sort-arrows"]');
    expect(pair("Up stacked")?.className).toContain("flex-col");
    expect(pair("Up stacked")?.className).toContain("pointer-coarse:hidden");
    expect(pair("Up phone")?.className).toContain("gap-3");
    expect(pair("Up phone")?.className).not.toContain("flex-col");
    expect(pair("Up phone")?.className).not.toContain("pointer-coarse:hidden");
  });

  it("disables the way off each end", () => {
    render(<List initial={["S", "M"]} />);
    expect(button("Up S").disabled).toBe(true);
    expect(button("Down M").disabled).toBe(true);
    expect(button("Down S").disabled).toBe(false);
  });

  it("paints a disabled arrow in the disabled glyph tone and a live one not", () => {
    render(<List initial={["S", "M"]} />);
    const tone = "disabled:[&_svg]:icon-quiet-disabled";
    expect(button("Up S").classList.contains(tone)).toBe(true);
    expect(button("Down M").classList.contains(tone)).toBe(true);
    expect(button("Down S").classList.contains(tone)).toBe(false);
    expect(button("Up M").classList.contains(tone)).toBe(false);
  });
});
