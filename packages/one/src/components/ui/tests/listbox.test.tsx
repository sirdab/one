import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Listbox,
  ListboxEmpty,
  ListboxGroup,
  ListboxInput,
  ListboxItem,
  ListboxList,
  ListboxLoading,
} from "../listbox";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

describe("Popover content", () => {
  it("is the frosted panel: translucent surface, blur, no border", () => {
    render(
      <Popover open>
        <PopoverTrigger>o</PopoverTrigger>
        <PopoverContent>x</PopoverContent>
      </Popover>,
    );
    const cls =
      document.querySelector('[data-slot="popover-content"]')?.className ?? "";
    expect(cls).toContain("bg-popover-surface");
    expect(cls).toContain("backdrop-blur-popover");
    expect(cls).not.toContain("border-border");
    expect(cls).toContain("shadow-popover-sm");
  });
});

function input(): HTMLInputElement {
  return screen.getByRole("combobox") as HTMLInputElement;
}

function options(): HTMLElement[] {
  return screen.queryAllByRole("option");
}

function active(): HTMLElement | null {
  return document.querySelector('[data-active="true"]');
}

describe("Listbox", () => {
  it("renders a solid search header above the scroller", () => {
    render(
      <Listbox>
        <ListboxInput placeholder="find" />
        <ListboxList>
          <ListboxItem value="a">Alpha</ListboxItem>
        </ListboxList>
      </Listbox>,
    );
    const wrapper = document.querySelector(
      '[data-slot="listbox-input-wrapper"]',
    );
    const cls = wrapper?.className ?? "";
    expect(cls).toContain("bg-popover");
    expect(cls).not.toContain("sticky");
    expect(cls).toContain("border-b");
  });

  it("highlights the active row with the ghost fill and sizes icons at 16px", () => {
    render(
      <Listbox>
        <ListboxList>
          <ListboxItem value="a">Alpha</ListboxItem>
        </ListboxList>
      </Listbox>,
    );
    const cls =
      document.querySelector('[data-slot="listbox-item"]')?.className ?? "";
    expect(cls).toContain("data-[active=true]:bg-btn-ghost-surface-hover");
    expect(cls).not.toContain("aria-selected:bg");
    expect(cls).not.toContain("bg-accent");
    expect(cls).toContain("[&>svg:not([class*='size-'])]:size-4");
    expect(cls).toContain("text-body-quiet");
  });

  it("shows a thin scrollbar on the list", () => {
    render(
      <Listbox>
        <ListboxList>
          <ListboxItem value="a">Alpha</ListboxItem>
        </ListboxList>
      </Listbox>,
    );
    const cls =
      document.querySelector('[data-slot="listbox-list"]')?.className ?? "";
    expect(cls).toContain("scrollbar-thin");
    expect(cls).not.toContain("no-scrollbar");
  });

  describe("search", () => {
    it("matches keywords, not the value, when keywords are given", () => {
      render(
        <Listbox>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="c-123" keywords={["Acme Freight"]}>
              Acme Freight
            </ListboxItem>
            <ListboxItem value="c-456" keywords={["Basma", "بصمة"]}>
              Basma
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      fireEvent.change(input(), { target: { value: "123" } });
      expect(options()).toHaveLength(0);
      fireEvent.change(input(), { target: { value: "acme" } });
      expect(options().map((o) => o.textContent)).toEqual(["Acme Freight"]);
      fireEvent.change(input(), { target: { value: "بصم" } });
      expect(options().map((o) => o.textContent)).toEqual(["Basma"]);
    });

    it("falls back to the value when an item has no keywords", () => {
      render(
        <Listbox>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="Alpha">Alpha</ListboxItem>
            <ListboxItem value="Beta">Beta</ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      fireEvent.change(input(), { target: { value: "alp" } });
      expect(options().map((o) => o.textContent)).toEqual(["Alpha"]);
    });

    it("does not filter locally with shouldFilter={false}", () => {
      render(
        <Listbox shouldFilter={false}>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="1" keywords={["Alpha"]}>
              Alpha
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      fireEvent.change(input(), { target: { value: "zzz" } });
      expect(options()).toHaveLength(1);
    });

    it("can be controlled", () => {
      const onSearchChange = vi.fn();
      render(
        <Listbox search="be" onSearchChange={onSearchChange}>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="a" keywords={["Alpha"]}>
              Alpha
            </ListboxItem>
            <ListboxItem value="b" keywords={["Beta"]}>
              Beta
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      expect(input().value).toBe("be");
      expect(options().map((o) => o.textContent)).toEqual(["Beta"]);
      fireEvent.change(input(), { target: { value: "bet" } });
      expect(onSearchChange).toHaveBeenCalledWith("bet");
    });
  });

  describe("duplicate labels", () => {
    it("keeps two items with the same label apart", () => {
      const onSelect = vi.fn();
      render(
        <Listbox>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="1" keywords={["Acme"]} onSelect={onSelect}>
              Acme
            </ListboxItem>
            <ListboxItem value="2" keywords={["Acme"]} onSelect={onSelect}>
              Acme
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      fireEvent.change(input(), { target: { value: "acme" } });
      expect(options()).toHaveLength(2);
      fireEvent.keyDown(input(), { key: "ArrowDown" });
      fireEvent.keyDown(input(), { key: "Enter" });
      expect(onSelect).toHaveBeenLastCalledWith("2");
    });

    it("gives every row its own DOM id", () => {
      render(
        <Listbox>
          <ListboxList>
            <ListboxItem value="a b">one</ListboxItem>
            <ListboxItem value="a-b">two</ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      const ids = options().map((o) => o.id);
      expect(new Set(ids).size).toBe(2);
    });
  });

  describe("aria", () => {
    it("marks the chosen item aria-selected and the highlight data-active", () => {
      render(
        <Listbox>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="a">Alpha</ListboxItem>
            <ListboxItem value="b" selected>
              Beta
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      const [alpha, beta] = options();
      expect(alpha?.getAttribute("data-active")).toBe("true");
      expect(alpha?.getAttribute("aria-selected")).toBe("false");
      expect(beta?.getAttribute("aria-selected")).toBe("true");
      expect(beta?.getAttribute("data-active")).toBeNull();
      expect(input().getAttribute("aria-activedescendant")).toBe(alpha?.id);
    });

    it("reports aria-expanded from whether a list is mounted", () => {
      const { rerender } = render(
        <Listbox>
          <ListboxInput />
        </Listbox>,
      );
      expect(input().getAttribute("aria-expanded")).toBe("false");
      rerender(
        <Listbox>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="a">Alpha</ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      expect(input().getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe("keyboard", () => {
    function renderList(onSelect: (value: string) => void): void {
      render(
        <Listbox>
          <ListboxInput />
          <ListboxList>
            <ListboxItem value="a" onSelect={onSelect}>
              Alpha
            </ListboxItem>
            <ListboxItem value="b" disabled onSelect={onSelect}>
              Beta
            </ListboxItem>
            <ListboxItem value="c" onSelect={onSelect}>
              Gamma
            </ListboxItem>
            <ListboxItem value="d" onSelect={onSelect}>
              Delta
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
    }

    it("moves with the arrows, skipping disabled rows, and wraps", () => {
      renderList(vi.fn());
      expect(active()?.textContent).toBe("Alpha");
      fireEvent.keyDown(input(), { key: "ArrowDown" });
      expect(active()?.textContent).toBe("Gamma");
      fireEvent.keyDown(input(), { key: "ArrowDown" });
      expect(active()?.textContent).toBe("Delta");
      fireEvent.keyDown(input(), { key: "ArrowDown" });
      expect(active()?.textContent).toBe("Alpha");
      fireEvent.keyDown(input(), { key: "ArrowUp" });
      expect(active()?.textContent).toBe("Delta");
    });

    it("jumps with Home and End and selects with Enter", () => {
      const onSelect = vi.fn();
      renderList(onSelect);
      fireEvent.keyDown(input(), { key: "End" });
      expect(active()?.textContent).toBe("Delta");
      fireEvent.keyDown(input(), { key: "Home" });
      expect(active()?.textContent).toBe("Alpha");
      fireEvent.keyDown(input(), { key: "End" });
      fireEvent.keyDown(input(), { key: "Enter" });
      expect(onSelect).toHaveBeenCalledWith("d");
    });

    it("navigates in DOM order after the list reorders", () => {
      function List({ ids }: { ids: string[] }): React.JSX.Element {
        return (
          <Listbox shouldFilter={false}>
            <ListboxInput />
            <ListboxList>
              {ids.map((id) => (
                <ListboxItem key={id} value={id}>
                  {id}
                </ListboxItem>
              ))}
            </ListboxList>
          </Listbox>
        );
      }
      const { rerender } = render(<List ids={["A", "B"]} />);
      rerender(<List ids={["C", "A"]} />);
      expect(active()?.textContent).toBe("C");
      fireEvent.keyDown(input(), { key: "ArrowDown" });
      expect(active()?.textContent).toBe("A");
    });
  });

  describe("disabled reasons", () => {
    it("shows the row but never selects it, keeping hover for the tooltip", () => {
      const onSelect = vi.fn();
      render(
        <Listbox>
          <ListboxInput />
          <ListboxList>
            <ListboxItem
              value="x"
              disabledReason="Carrier is inactive"
              onSelect={onSelect}
            >
              Inactive Co
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      const row = screen.getByRole("option", { name: /Inactive Co/ });
      expect(row.getAttribute("aria-disabled")).toBe("true");
      expect(row.className).toContain(
        "data-[disabled=true]:pointer-events-auto",
      );
      fireEvent.click(row);
      fireEvent.keyDown(input(), { key: "Enter" });
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("does not claim emptiness when only disabled rows match", () => {
      render(
        <Listbox>
          <ListboxList>
            <ListboxEmpty>nothing</ListboxEmpty>
            <ListboxItem value="x" disabled>
              Off
            </ListboxItem>
          </ListboxList>
        </Listbox>,
      );
      expect(screen.queryByText("nothing")).toBeNull();
    });
  });

  it("renders a loading slot as a polite status", () => {
    render(
      <Listbox>
        <ListboxList>
          <ListboxLoading>Searching</ListboxLoading>
        </ListboxList>
      </Listbox>,
    );
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Searching");
    expect(status.getAttribute("data-slot")).toBe("listbox-loading");
  });

  it("hides a group whose every row is filtered out", () => {
    render(
      <Listbox>
        <ListboxInput />
        <ListboxList>
          <ListboxEmpty>nothing</ListboxEmpty>
          <ListboxGroup heading="Saved">
            <ListboxItem value="a" keywords={["Home"]}>
              Home
            </ListboxItem>
          </ListboxGroup>
          <ListboxGroup heading="Customer">
            <ListboxItem value="b" keywords={["Depot"]}>
              Depot
            </ListboxItem>
          </ListboxGroup>
        </ListboxList>
      </Listbox>,
    );
    fireEvent.change(input(), { target: { value: "depot" } });
    expect(screen.getAllByRole("group").map((g) => g.textContent)).toEqual([
      "CustomerDepot",
    ]);
    fireEvent.change(input(), { target: { value: "zzz" } });
    expect(screen.queryAllByRole("group")).toHaveLength(0);
    expect(screen.getByText("nothing")).toBeTruthy();
    fireEvent.change(input(), { target: { value: "" } });
    expect(screen.getAllByRole("group")).toHaveLength(2);
  });

  it("keeps a heading on groups", () => {
    render(
      <Listbox>
        <ListboxList>
          <ListboxGroup heading="Saved">
            <ListboxItem value="a">Alpha</ListboxItem>
          </ListboxGroup>
        </ListboxList>
      </Listbox>,
    );
    expect(screen.getByRole("group").textContent).toContain("Saved");
  });
});
