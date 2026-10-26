import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReceiptIcon, TagIcon } from "../../icons/general";
import {
  auroraAvatarFor,
  Palette,
  PaletteEmpty,
  PaletteGroup,
  PaletteInput,
  PaletteItem,
  PaletteItemAvatar,
  PaletteItemIcon,
  PaletteItemImage,
  PaletteList,
} from "../palette";

function renderPalette(
  props: Partial<React.ComponentProps<typeof Palette>> = {},
): {
  input: HTMLElement;
  onSelectA: ReturnType<typeof vi.fn>;
} {
  const onSelectA = vi.fn();
  render(
    <Palette openLabel="Open" {...props}>
      <PaletteInput aria-label="Search" />
      <PaletteList aria-label="Results">
        <PaletteEmpty>No results</PaletteEmpty>
        <PaletteGroup groupId="actions" heading="Actions">
          <PaletteItem
            value="action-a"
            title="Alpha action"
            subtitle="Does alpha things"
            leading={<span />}
            onSelect={onSelectA}
          />
          <PaletteItem
            value="action-b"
            title="Beta action"
            subtitle="Does beta things"
            leading={<span />}
            onSelect={vi.fn()}
          />
        </PaletteGroup>
        <PaletteGroup groupId="records" heading="Records">
          <PaletteItem
            value="record-a"
            title="Gamma record"
            subtitle="A record subtitle"
            leading={<span />}
            onSelect={vi.fn()}
          />
        </PaletteGroup>
      </PaletteList>
    </Palette>,
  );
  const input = screen.getByRole("combobox", { name: "Search" });
  return { input, onSelectA };
}

describe("Palette", () => {
  it("filters rows by a case-insensitive substring of title and subtitle", () => {
    const { input } = renderPalette();
    fireEvent.change(input, { target: { value: "beta" } });

    expect(screen.queryByText("Alpha action")).toBeNull();
    expect(screen.queryByText("Beta action")).not.toBeNull();

    fireEvent.change(input, { target: { value: "SUBTITLE" } });
    expect(screen.queryByText("Gamma record")).not.toBeNull();
    expect(screen.queryByText("Alpha action")).toBeNull();
  });

  it("hides a group's heading when none of its rows match", () => {
    const { input } = renderPalette();
    fireEvent.change(input, { target: { value: "alpha" } });

    expect(screen.queryByText("Actions")).not.toBeNull();
    expect(screen.queryByText("Records")).toBeNull();
  });

  it("shows the empty state when nothing matches", () => {
    const { input } = renderPalette();
    fireEvent.change(input, { target: { value: "nothing matches this" } });
    expect(screen.queryByText("No results")).not.toBeNull();
  });

  /* The studio's search is answered by an api, not by the rows' own
       text: a customer found by phone number carries no trace of the query
       in her title. With filtering off every mounted row stays, and the
       host decides what mounts. */
  it("keeps every row when filtering is off", () => {
    const { input } = renderPalette({ filter: false });
    fireEvent.change(input, { target: { value: "zzz" } });

    expect(screen.queryByText("Alpha action")).not.toBeNull();
    expect(screen.queryByText("Gamma record")).not.toBeNull();
    expect(screen.queryByText("No results")).toBeNull();
  });

  /* The host owns the query when it has to act on it (a debounced fetch,
       an "ask" row built from the sentence). */
  it("reads a controlled search and reports every change", () => {
    const onSearchChange = vi.fn();
    const { input } = renderPalette({
      search: "gamma",
      onSearchChange,
    });
    expect((input as HTMLInputElement).value).toBe("gamma");
    expect(screen.queryByText("Alpha action")).toBeNull();
    expect(screen.queryByText("Gamma record")).not.toBeNull();

    fireEvent.change(input, { target: { value: "alpha" } });
    expect(onSearchChange).toHaveBeenCalledWith("alpha");
    // Controlled: the host did not re-render, so the value holds.
    expect((input as HTMLInputElement).value).toBe("gamma");
  });

  it("moves the active row with the arrow keys and opens it on Enter", () => {
    const { input, onSelectA } = renderPalette();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelectA).toHaveBeenCalledTimes(1);
  });

  /* The ends are where you stop: a held key parks on the last row
       rather than cycling back to the top. */
  it("stops at the first and last rows instead of wrapping", () => {
    const { input } = renderPalette();
    const rows = screen.getAllByRole("option");
    const first = rows[0];
    const last = rows[rows.length - 1];

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(first?.getAttribute("aria-selected")).toBe("true");

    for (let i = 0; i < rows.length + 2; i += 1) {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    }
    expect(last?.getAttribute("aria-selected")).toBe("true");
  });

  /* A row the host answers late (the studio's suggestion) can mount
       above rows already on screen; it must still be where the keys and
       the default highlight find it first. */
  it("walks a row that mounts late above the others in screen order", () => {
    const onLate = vi.fn();
    function Host({ late }: { late: boolean }): React.JSX.Element {
      return (
        <Palette openLabel="Open">
          <PaletteInput aria-label="Search" />
          <PaletteList aria-label="Results">
            {late ? (
              <PaletteGroup groupId="suggested" heading="Top">
                <PaletteItem
                  value="late"
                  title="Late row"
                  subtitle="Arrived last"
                  leading={<span />}
                  onSelect={onLate}
                />
              </PaletteGroup>
            ) : null}
            <PaletteGroup groupId="actions" heading="Actions">
              <PaletteItem
                value="early"
                title="Early row"
                subtitle="Was here first"
                leading={<span />}
                onSelect={vi.fn()}
              />
            </PaletteGroup>
          </PaletteList>
        </Palette>
      );
    }
    const { rerender } = render(<Host late={false} />);
    rerender(<Host late />);
    const input = screen.getByRole("combobox", { name: "Search" });

    expect(
      screen
        .getByText("Late row")
        .closest('[role="option"]')
        ?.getAttribute("aria-selected"),
    ).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onLate).toHaveBeenCalledTimes(1);
  });

  it("shows the trailing Open affordance only on the active row", () => {
    renderPalette();
    const items = screen.getAllByRole("option");
    const active = items.find(
      (item) => item.getAttribute("aria-selected") === "true",
    );
    expect(active).toBeTruthy();
    expect(active?.textContent ?? "").toContain("Open");

    for (const item of items.filter((item) => item !== active)) {
      expect(item.textContent ?? "").not.toContain("Open");
    }
  });

  /* A screen reader lands on "Actions, group" rather than an unnamed
       cluster of options: the heading names the group, the way cmdk's own
       groups do. */
  it("names each group after its heading", () => {
    renderPalette();
    expect(screen.getByRole("group", { name: "Actions" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Records" })).toBeTruthy();
  });

  it("selects a row on click", () => {
    const { onSelectA } = renderPalette();
    fireEvent.click(screen.getByText("Alpha action"));
    expect(onSelectA).toHaveBeenCalledWith("action-a");
  });

  /* One role down from the flat text-body-lg, following Input's own
       pattern: 16px on touch widths so iOS does not zoom, stepping down
       from sm. */
  it("keeps the search row at 16px below sm", () => {
    const { input } = renderPalette();
    expect(input.className).toContain("text-body-lg");
    expect(input.className).toContain("sm:text-body");
  });

  describe("active row scrolling", () => {
    it("scrolls the newly active row into view when the keys move it", () => {
      const scrollIntoView = vi
        .spyOn(Element.prototype, "scrollIntoView")
        .mockImplementation(() => {});
      const { input } = renderPalette();
      scrollIntoView.mockClear();

      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
      scrollIntoView.mockRestore();
    });

    it("does not scroll when a hover moves the active row", () => {
      const scrollIntoView = vi
        .spyOn(Element.prototype, "scrollIntoView")
        .mockImplementation(() => {});
      renderPalette();
      const betaRow = screen
        .getByText("Beta action")
        .closest('[role="option"]');
      scrollIntoView.mockClear();

      fireEvent.mouseMove(betaRow as Element, {
        clientX: 40,
        clientY: 80,
      });

      expect(betaRow?.getAttribute("aria-selected")).toBe("true");
      expect(scrollIntoView).not.toHaveBeenCalled();
      scrollIntoView.mockRestore();
    });

    /* When an arrow key scrolls the list, a different row slides under
           a cursor that never moved and the browser fires a mouse event
           for it at the same coordinates. That must not take the highlight
           back. */
    it("ignores a row arriving under a cursor that did not move", () => {
      const { input } = renderPalette();
      const [first, second, third] = screen.getAllByRole("option");
      if (!first || !second || !third) throw new Error("need three rows");

      fireEvent.mouseMove(first, { clientX: 40, clientY: 20 });
      expect(first.getAttribute("aria-selected")).toBe("true");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(third.getAttribute("aria-selected")).toBe("true");
      fireEvent.mouseMove(second, { clientX: 40, clientY: 20 });
      expect(third.getAttribute("aria-selected")).toBe("true");

      fireEvent.mouseMove(second, { clientX: 41, clientY: 20 });
      expect(second.getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("the row", () => {
    function renderRows(): HTMLElement[] {
      render(
        <Palette openLabel="Open">
          <PaletteInput aria-label="Search" />
          <PaletteList aria-label="Results">
            <PaletteGroup groupId="rows" heading="Rows">
              <PaletteItem
                value="action"
                title="Create discount"
                subtitle="A code for checkout"
                leading={<PaletteItemIcon icon={TagIcon} />}
              />
              <PaletteItem
                value="product"
                title="Cotton tee"
                subtitle="Product"
                leading={<PaletteItemImage src="https://img.test/tee.jpg" />}
              />
              <PaletteItem
                value="order"
                title="#1042"
                subtitle="Order · Pending"
                leading={
                  <PaletteItemAvatar seed="order-1" icon={ReceiptIcon} />
                }
              />
            </PaletteGroup>
          </PaletteList>
        </Palette>,
      );
      return screen.getAllByRole("option");
    }

    /* The reference row: 52px of 14px-radius row around a 40px tile,
           lit only when active. No hover wash: the pointer already moves
           the active row, so a wash of its own left a second lit row under
           a resting cursor once the arrow keys moved on. */
    it("wears the palette row's own radius, padding and state ladder", () => {
      const [row] = renderRows();
      const classes = row?.className ?? "";
      expect(classes).toContain("rounded-palette-item");
      expect(classes).toContain("p-1.5");
      expect(classes).toContain("gap-3");
      expect(classes).not.toContain("hover:bg-");
      expect(classes).toContain("aria-selected:bg-gray-alpha-100");
    });

    it("renders the title over its subtitle, and the tile first", () => {
      const [row] = renderRows();
      const title = row?.querySelector('[data-slot="palette-item-title"]');
      const subtitle = row?.querySelector(
        '[data-slot="palette-item-subtitle"]',
      );
      expect(title?.textContent).toBe("Create discount");
      expect(title?.className).toContain("font-medium");
      expect(subtitle?.textContent).toBe("A code for checkout");
      expect(subtitle?.className).toContain("text-muted-foreground");
      expect(row?.firstElementChild?.getAttribute("data-slot")).toBe(
        "palette-item-icon",
      );
    });

    /* The icon tile lights with its row: the well one alpha rung up and
           the glyph from the secondary tone to ink. */
    it("steps the icon tile up with the active row", () => {
      const [row] = renderRows();
      const tile = row?.querySelector('[data-slot="palette-item-icon"]');
      const classes = tile?.className ?? "";
      expect(classes).toContain("size-10");
      expect(classes).toContain("rounded-lg");
      expect(classes).toContain("bg-gray-alpha-100");
      expect(classes).toContain(
        "group-aria-selected/palette-item:bg-gray-alpha-150",
      );
      expect(classes).toContain("text-muted-foreground");
      expect(classes).toContain(
        "group-aria-selected/palette-item:text-foreground",
      );
      expect(tile?.querySelector("svg")?.getAttribute("class") ?? "").toContain(
        "size-5",
      );
    });

    it("puts the Open hint on the active row only", () => {
      const [first, second] = renderRows();
      expect(first?.getAttribute("aria-selected")).toBe("true");
      expect(
        first?.querySelector('[data-slot="palette-item-open"]')?.textContent,
      ).toContain("Open");
      expect(
        second?.querySelector('[data-slot="palette-item-open"]'),
      ).toBeNull();
    });

    /* The row that loses something reads red before Enter, on the
           destructive wash rather than the gray one. */
    it("paints a destructive row red on its own wash", () => {
      render(
        <Palette openLabel="Open">
          <PaletteInput aria-label="Search" />
          <PaletteList aria-label="Results">
            <PaletteGroup groupId="page" heading="This product">
              <PaletteItem
                value="delete"
                variant="destructive"
                title="Delete product"
                subtitle="After you confirm"
                leading={
                  <PaletteItemIcon icon={TagIcon} variant="destructive" />
                }
              />
            </PaletteGroup>
          </PaletteList>
        </Palette>,
      );
      const row = screen.getByRole("option");
      expect(row.className).toContain("aria-selected:bg-btn-destructive/10");
      expect(row.className).not.toContain("bg-gray-alpha-100");
      expect(
        row.querySelector('[data-slot="palette-item-title"]')?.className,
      ).toContain("text-btn-destructive");
      expect(
        row.querySelector('[data-slot="palette-item-icon"]')?.className,
      ).toContain("text-btn-destructive");
    });

    it("shows a record's photo cropped into the tile", () => {
      const [, product] = renderRows();
      const img = product?.querySelector("img");
      expect(img?.getAttribute("src")).toBe("https://img.test/tee.jpg");
      expect(img?.getAttribute("alt")).toBe("");
      expect(img?.className).toContain("object-cover");
    });

    /* A photo-less record keeps the same face on every visit and every
           device: the pairing is a function of its id, nothing stored. */
    it("gives a photo-less record a stable aurora face off its id", () => {
      const [, , order] = renderRows();
      const tile = order?.querySelector('[data-slot="palette-item-avatar"]');
      expect(tile?.className).toContain(auroraAvatarFor("order-1"));
      expect(auroraAvatarFor("order-1")).toBe(auroraAvatarFor("order-1"));
      const faces = new Set(
        Array.from({ length: 40 }, (_, i) => auroraAvatarFor(`id-${i}`)),
      );
      expect(faces.size).toBeGreaterThan(1);
      for (const face of faces) expect(face).toMatch(/^aurora-avatar-[1-6]$/);
    });

    /* A host's own face (the studio's store orbs) replaces the aurora
           and fills the tile, and the record's glyph stays on top of it. */
    it("wears a host's face under the glyph instead of the aurora", () => {
      render(
        <Palette openLabel="Open">
          <PaletteList aria-label="Results">
            <PaletteGroup groupId="recent" heading="Recent">
              <PaletteItem
                value="order-9"
                title="#1042"
                subtitle="Order"
                leading={
                  <PaletteItemAvatar
                    seed="order-9"
                    icon={ReceiptIcon}
                    face={<img data-testid="orb" alt="" />}
                  />
                }
              />
            </PaletteGroup>
          </PaletteList>
        </Palette>,
      );
      const tile = document.querySelector('[data-slot="palette-item-avatar"]');
      expect(tile?.className).not.toMatch(/aurora-avatar-/);
      expect(tile?.contains(screen.getByTestId("orb"))).toBe(true);
      expect(tile?.lastElementChild?.getAttribute("data-icon")).toBeTruthy();
    });
  });
});

/* The studio's palette decides Enter itself (a verdict over three sources),
   so the host can say which row is active, hear when she moves it, and take
   Enter over, and each row can name its own action. */
describe("Palette driven by its host", () => {
  function Host({
    activeValue,
    onActiveValueChange,
    onEnter,
    trailing,
  }: {
    activeValue?: string | null;
    onActiveValueChange?: (value: string | null) => void;
    onEnter?: (value: string | null) => void;
    trailing?: React.ReactNode;
  }): React.JSX.Element {
    return (
      <Palette
        openLabel="Open"
        activeValue={activeValue}
        onActiveValueChange={onActiveValueChange}
        onEnter={onEnter}
      >
        <PaletteInput aria-label="Search" trailing={trailing} />
        <PaletteList aria-label="Results">
          <PaletteGroup groupId="rows" heading="Rows">
            <PaletteItem
              value="page"
              title="Orders"
              subtitle="Page"
              leading={<span />}
            />
            <PaletteItem
              value="verb"
              title="Create product"
              subtitle="Action"
              enterLabel="Create"
              leading={<span />}
            />
            <PaletteItem
              value="ask"
              title="Ask sirdab"
              subtitle="Assistant"
              enterLabel="Ask"
              leading={<span />}
            />
          </PaletteGroup>
        </PaletteList>
      </Palette>
    );
  }

  function active(): string | null {
    return (
      screen
        .getAllByRole("option")
        .find((row) => row.getAttribute("aria-selected") === "true")
        ?.querySelector('[data-slot="palette-item-title"]')?.textContent ?? null
    );
  }

  function hint(): string {
    return (
      document.querySelector('[data-slot="palette-item-open"]')?.textContent ??
      ""
    );
  }

  it("names the action of the row that is active, not one word for all", () => {
    const { rerender } = render(<Host activeValue="verb" />);
    expect(hint()).toBe("Create");
    rerender(<Host activeValue="ask" />);
    expect(hint()).toBe("Ask");
    // A row that says nothing of its own falls back to the palette's word.
    rerender(<Host activeValue="page" />);
    expect(hint()).toBe("Open");
  });

  it("lights the row the host names, and none for null", () => {
    const { rerender } = render(<Host activeValue="ask" />);
    expect(active()).toBe("Ask sirdab");
    rerender(<Host activeValue={null} />);
    expect(active()).toBeNull();
    expect(hint()).toBe("");
    expect(
      screen.getByRole("combobox").getAttribute("aria-activedescendant"),
    ).toBeNull();
  });

  it("hears the arrow keys and the pointer, and leaves the choice to the host", () => {
    const onActiveValueChange = vi.fn();
    render(
      <Host activeValue="page" onActiveValueChange={onActiveValueChange} />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onActiveValueChange).toHaveBeenLastCalledWith("verb");
    // Controlled: the host did not move it, so the highlight holds.
    expect(active()).toBe("Orders");

    fireEvent.mouseMove(
      screen.getByText("Ask sirdab").closest('[role="option"]') as Element,
      { clientX: 10, clientY: 10 },
    );
    expect(onActiveValueChange).toHaveBeenLastCalledWith("ask");
  });

  it("starts the keys from the top when nothing is lit", () => {
    const onActiveValueChange = vi.fn();
    render(
      <Host activeValue={null} onActiveValueChange={onActiveValueChange} />,
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    expect(onActiveValueChange).toHaveBeenLastCalledWith("page");
  });

  it("gives Enter to the host, with the row that was active", () => {
    const onEnter = vi.fn();
    const onSelect = vi.fn();
    render(
      <Palette openLabel="Open" activeValue="verb" onEnter={onEnter}>
        <PaletteInput aria-label="Search" />
        <PaletteList aria-label="Results">
          <PaletteGroup groupId="rows" heading="Rows">
            <PaletteItem
              value="verb"
              title="Create product"
              subtitle="Action"
              leading={<span />}
              onSelect={onSelect}
            />
          </PaletteGroup>
        </PaletteList>
      </Palette>,
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onEnter).toHaveBeenCalledWith("verb");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("hears Enter with null while nothing is lit", () => {
    const onEnter = vi.fn();
    render(<Host activeValue={null} onEnter={onEnter} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onEnter).toHaveBeenCalledWith(null);
  });

  it("scrolls a row the host lit into view, but not one the pointer lit", () => {
    const scrollIntoView = vi
      .spyOn(Element.prototype, "scrollIntoView")
      .mockImplementation(() => {});
    function Controlled({ value }: { value: string }): React.JSX.Element {
      const [picked, setPicked] = React.useState<string | null>(null);
      return (
        <Host activeValue={picked ?? value} onActiveValueChange={setPicked} />
      );
    }
    const { rerender } = render(<Controlled value="page" />);
    scrollIntoView.mockClear();
    rerender(<Controlled value="ask" />);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

    scrollIntoView.mockClear();
    fireEvent.mouseMove(
      screen.getByText("Orders").closest('[role="option"]') as Element,
      { clientX: 30, clientY: 30 },
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
    scrollIntoView.mockRestore();
  });

  it("lets the input end hold a control of the host's (a spinner, Cancel)", () => {
    render(
      <Host
        trailing={<button type="button">Cancel</button>}
        activeValue={null}
      />,
    );
    const wrapper = document.querySelector(
      '[data-slot="palette-input-wrapper"]',
    );
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(wrapper?.contains(cancel)).toBe(true);
    // After the field, at the end edge.
    expect(wrapper?.lastElementChild).toBe(cancel);
  });
});

/* The launcher is a fixed box, so the list takes what the search row leaves
   rather than sizing itself to its rows (which made the panel jump on every
   keystroke); on a phone its last row clears the bottom edge. */
describe("PaletteList", () => {
  it("fills the box instead of sizing to its rows, and clears a phone's bottom edge", () => {
    render(
      <Palette openLabel="Open">
        <PaletteInput aria-label="Search" />
        <PaletteList aria-label="Results">
          <PaletteGroup groupId="rows" heading="Rows">
            <PaletteItem value="a" title="A" subtitle="a" leading={<span />} />
          </PaletteGroup>
        </PaletteList>
      </Palette>,
    );
    const list = screen.getByRole("listbox");
    expect(list.style.maxHeight).toBe("");
    expect(list.className).toContain("flex-1");
    expect(list.className).toContain("min-h-0");
    const spacer = list.querySelector('[data-slot="palette-list-end"]');
    expect(spacer?.className).toContain("md:hidden");
    expect(spacer?.getAttribute("aria-hidden")).toBe("true");
    expect((spacer as HTMLElement).style.height).toContain(
      "env(safe-area-inset-bottom)",
    );
  });
});
