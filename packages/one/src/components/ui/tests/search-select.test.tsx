import * as React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "../../../provider";
import {
  SearchSelect,
  type SearchSelectFooterContext,
  type SearchSelectLabels,
  type SearchSelectOption,
} from "../search-select";
import { Label } from "../label";
import { selectTriggerChrome } from "../select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../sheet";

const labels: SearchSelectLabels = {
  placeholder: "Pick a carrier",
  searchPlaceholder: "Search carriers",
  empty: "No carriers",
  loading: "Searching",
  keepTyping: "Keep typing to narrow",
  error: "Search failed",
  none: "No carrier",
  close: "Close",
};

const carriers: SearchSelectOption[] = [
  { value: "c1", label: "Acme Freight", keywords: ["أكمي"] },
  { value: "c2", label: "Basma Logistics", description: "CR 1010" },
  { value: "c3", label: "Najd Haulage" },
];

function trigger(): HTMLElement {
  return document.querySelector(
    '[data-slot="search-select-trigger"]',
  ) as HTMLElement;
}

function searchInput(): HTMLInputElement {
  return document.querySelector(
    '[data-slot="listbox-input"]',
  ) as HTMLInputElement;
}

function rows(): HTMLElement[] {
  return screen.queryAllByRole("option");
}

function rowLabels(): string[] {
  return rows().map(
    (row) =>
      row.querySelector('[data-slot="search-select-label"]')?.textContent ?? "",
  );
}

async function open(): Promise<void> {
  fireEvent.click(trigger());
  await waitFor(() => expect(searchInput()).not.toBeNull());
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function Single({
  initial = null,
  options = carriers,
  onValueChange,
  ...rest
}: {
  initial?: string | null;
  options?: SearchSelectOption[];
  onValueChange?: (value: string | null) => void;
  clearable?: boolean;
  searchable?: boolean;
  footer?: (ctx: { query: string; close: () => void }) => React.ReactNode;
}): React.JSX.Element {
  const [value, setValue] = React.useState<string | null>(initial);
  return (
    <SearchSelect
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
      labels={labels}
      {...rest}
    />
  );
}

function Multi({
  initial = [],
  onValueChange,
  clearable,
}: {
  initial?: string[];
  onValueChange?: (value: string[]) => void;
  clearable?: boolean;
}): React.JSX.Element {
  const [value, setValue] = React.useState<string[]>(initial);
  return (
    <SearchSelect
      multiple
      options={carriers}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
      labels={labels}
      clearable={clearable}
    />
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SearchSelect: without a search box", () => {
  it("hides the search strip but keeps the list on the keyboard", async () => {
    const onValueChange = vi.fn();
    render(<Single searchable={false} onValueChange={onValueChange} />);
    await open();

    const wrapper = document.querySelector(
      '[data-slot="listbox-input-wrapper"]',
    );
    expect(wrapper?.className).toContain("sr-only");
    expect(searchInput().readOnly).toBe(true);
    expect(rowLabels()).toEqual([
      "Acme Freight",
      "Basma Logistics",
      "Najd Haulage",
    ]);

    fireEvent.keyDown(searchInput(), { key: "ArrowDown" });
    fireEvent.keyDown(searchInput(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("c2");
  });

  it("does not seed a search from a key typed on the trigger", async () => {
    render(<Single searchable={false} />);
    fireEvent.keyDown(trigger(), { key: "n" });
    expect(searchInput()).toBeNull();

    await open();
    expect(searchInput().value).toBe("");
    expect(rows()).toHaveLength(3);
  });
});

describe("SearchSelect: static single", () => {
  it("opens on click, picks an option by id, closes and names it", async () => {
    const onValueChange = vi.fn();
    render(<Single onValueChange={onValueChange} />);
    expect(trigger().textContent).toContain("Pick a carrier");
    expect(trigger().hasAttribute("data-placeholder")).toBe(true);
    await open();
    expect(rowLabels()).toEqual([
      "Acme Freight",
      "Basma Logistics",
      "Najd Haulage",
    ]);
    fireEvent.click(rows()[1] as HTMLElement);
    expect(onValueChange).toHaveBeenCalledWith("c2");
    await waitFor(() => expect(searchInput()).toBeNull());
    expect(trigger().textContent).toContain("Basma Logistics");
    expect(trigger().hasAttribute("data-placeholder")).toBe(false);
  });

  it("filters on the label and the keywords, never the id", async () => {
    render(<Single />);
    await open();
    fireEvent.change(searchInput(), { target: { value: "أكم" } });
    expect(rowLabels()).toEqual(["Acme Freight"]);
    fireEvent.change(searchInput(), { target: { value: "haul" } });
    expect(rowLabels()).toEqual(["Najd Haulage"]);
    fireEvent.change(searchInput(), { target: { value: "c1" } });
    expect(rows()).toHaveLength(0);
    expect(screen.getByText("No carriers")).toBeTruthy();
  });

  it("checks the chosen option and marks it aria-selected", async () => {
    render(<Single initial="c3" />);
    await open();
    const chosen = rows().find((row) => row.textContent?.includes("Najd"));
    const other = rows().find((row) => row.textContent?.includes("Acme"));
    expect(chosen?.getAttribute("aria-selected")).toBe("true");
    expect(other?.getAttribute("aria-selected")).toBe("false");
    const check = (row: HTMLElement | undefined): string =>
      row
        ?.querySelector('[data-slot="search-select-check"] svg')
        ?.getAttribute("class") ?? "";
    expect(check(chosen)).toContain("opacity-100");
    expect(check(other)).toContain("opacity-0");
  });

  it("keeps two options with the same label apart", async () => {
    const onValueChange = vi.fn();
    render(
      <Single
        onValueChange={onValueChange}
        options={[
          { value: "a1", label: "Acme", description: "Riyadh" },
          { value: "a2", label: "Acme", description: "Jeddah" },
        ]}
      />,
    );
    await open();
    fireEvent.keyDown(searchInput(), { key: "ArrowDown" });
    fireEvent.keyDown(searchInput(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("a2");
  });

  it("shows the secondary line and the status badge slot", async () => {
    render(
      <Single
        options={[
          {
            value: "t1",
            label: "ABC 1234",
            description: "Flatbed, 20t",
            badge: <span data-testid="badge">Active</span>,
          },
        ]}
      />,
    );
    await open();
    const row = rows()[0] as HTMLElement;
    expect(
      row.querySelector('[data-slot="search-select-description"]')?.textContent,
    ).toBe("Flatbed, 20t");
    expect(
      row.querySelector('[data-slot="search-select-badge"]')?.textContent,
    ).toBe("Active");
  });
});

describe("SearchSelect: static multi", () => {
  it("toggles without closing and names the first pick plus a count", async () => {
    const onValueChange = vi.fn();
    render(<Multi onValueChange={onValueChange} />);
    await open();
    expect(
      screen.getByRole("listbox").getAttribute("aria-multiselectable"),
    ).toBe("true");
    fireEvent.click(rows()[0] as HTMLElement);
    expect(onValueChange).toHaveBeenLastCalledWith(["c1"]);
    fireEvent.click(rows()[2] as HTMLElement);
    expect(onValueChange).toHaveBeenLastCalledWith(["c1", "c3"]);
    expect(searchInput()).not.toBeNull();
    expect(trigger().textContent).toContain("Acme Freight");
    expect(trigger().textContent).toContain("+1");
    fireEvent.click(rows()[0] as HTMLElement);
    expect(onValueChange).toHaveBeenLastCalledWith(["c3"]);
  });

  it("leads each row with an always-reserved check", async () => {
    render(<Multi initial={["c2"]} />);
    await open();
    const row = rows()[1] as HTMLElement;
    expect(row.firstElementChild?.getAttribute("data-slot")).toBe(
      "search-select-check",
    );
    expect(row.getAttribute("aria-selected")).toBe("true");
  });
});

describe("SearchSelect: none and clear", () => {
  it("offers a none row in single mode that picks null", async () => {
    const onValueChange = vi.fn();
    render(<Single initial="c1" clearable onValueChange={onValueChange} />);
    await open();
    const none = rows()[0] as HTMLElement;
    expect(none.textContent).toContain("No carrier");
    expect(none.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(none);
    expect(onValueChange).toHaveBeenCalledWith(null);
    await waitFor(() => expect(trigger().textContent).toContain("Pick a"));
  });

  it("marks the none row chosen when there is no value", async () => {
    render(<Single clearable />);
    await open();
    expect(rows()[0]?.getAttribute("aria-selected")).toBe("true");
  });

  it("offers a clear row in multi mode once something is picked", async () => {
    const onValueChange = vi.fn();
    render(
      <Multi initial={["c1", "c2"]} clearable onValueChange={onValueChange} />,
    );
    await open();
    const clear = rows()[0] as HTMLElement;
    expect(clear.textContent).toContain("No carrier");
    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });
});

describe("SearchSelect: server search", () => {
  function Server({
    search,
    pageSize,
    idleOptions,
    selectedOptions,
    initial = null,
  }: {
    search: (
      query: string,
      signal: AbortSignal,
    ) => Promise<SearchSelectOption[]>;
    pageSize?: number;
    idleOptions?: SearchSelectOption[];
    selectedOptions?: SearchSelectOption[];
    initial?: string | null;
  }): React.JSX.Element {
    const [value, setValue] = React.useState<string | null>(initial);
    return (
      <SearchSelect
        search={search}
        pageSize={pageSize}
        idleOptions={idleOptions}
        selectedOptions={selectedOptions}
        value={value}
        onValueChange={setValue}
        labels={labels}
      />
    );
  }

  it("loads the first page on open without waiting for a keystroke", async () => {
    const page = deferred<SearchSelectOption[]>();
    const search = vi.fn<
      (query: string, signal: AbortSignal) => Promise<SearchSelectOption[]>
    >(() => page.promise);
    render(<Server search={search} />);
    expect(search).not.toHaveBeenCalled();
    await open();
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
    expect(search.mock.calls[0]?.[0]).toBe("");
    expect(screen.getByRole("status").textContent).toContain("Searching");
    await act(async () => page.resolve(carriers));
    expect(rowLabels()).toEqual([
      "Acme Freight",
      "Basma Logistics",
      "Najd Haulage",
    ]);
  });

  it("debounces typing into one request and never filters locally", async () => {
    const search = vi.fn(
      async (query: string): Promise<SearchSelectOption[]> =>
        query === "" ? [] : [{ value: "x", label: "Matched by CR" }],
    );
    render(<Server search={search} />);
    await open();
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
    const pause = (): Promise<void> =>
      act(() => new Promise<void>((resolve) => setTimeout(resolve, 50)));
    fireEvent.change(searchInput(), { target: { value: "1" } });
    await pause();
    fireEvent.change(searchInput(), { target: { value: "10" } });
    await pause();
    fireEvent.change(searchInput(), { target: { value: "101" } });
    await pause();
    expect(search).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(rowLabels()).toEqual(["Matched by CR"]));
    expect(search.mock.calls.map((call) => call[0])).toEqual(["", "101"]);
  });

  it("ignores a slower answer to an older query", async () => {
    const answers = new Map<
      string,
      ReturnType<typeof deferred<SearchSelectOption[]>>
    >();
    const search = vi.fn<
      (query: string, signal: AbortSignal) => Promise<SearchSelectOption[]>
    >((query) => {
      const answer = deferred<SearchSelectOption[]>();
      answers.set(query, answer);
      return answer.promise;
    });
    render(<Server search={search} />);
    await open();
    await waitFor(() => expect(answers.has("")).toBe(true));
    fireEvent.change(searchInput(), { target: { value: "ac" } });
    await waitFor(() => expect(answers.has("ac")).toBe(true));
    fireEvent.change(searchInput(), { target: { value: "acm" } });
    await waitFor(() => expect(answers.has("acm")).toBe(true));
    await act(async () =>
      answers.get("acm")?.resolve([{ value: "new", label: "Newer" }]),
    );
    await act(async () =>
      answers.get("ac")?.resolve([{ value: "old", label: "Older" }]),
    );
    expect(rowLabels()).toEqual(["Newer"]);
    const signal = search.mock.calls.find((call) => call[0] === "ac")?.[1];
    expect(signal?.aborted).toBe(true);
  });

  it("tells the person to keep typing when a full page comes back", async () => {
    const full = Array.from({ length: 3 }, (_, i) => ({
      value: `id-${i}`,
      label: `Carrier ${i}`,
    }));
    render(<Server search={async () => full} pageSize={3} />);
    await open();
    await waitFor(() => expect(rows()).toHaveLength(3));
    expect(screen.getByText("Keep typing to narrow")).toBeTruthy();
  });

  it("says nothing about narrowing when the page is not full", async () => {
    render(<Server search={async () => carriers} pageSize={20} />);
    await open();
    await waitFor(() => expect(rows()).toHaveLength(3));
    expect(screen.queryByText("Keep typing to narrow")).toBeNull();
  });

  it("shows idle options for a blank query without asking the server", async () => {
    const search = vi.fn(async () => carriers);
    render(
      <Server
        search={search}
        idleOptions={[{ value: "recent", label: "Recent city" }]}
      />,
    );
    await open();
    expect(rowLabels()).toEqual(["Recent city"]);
    expect(search).not.toHaveBeenCalled();
  });

  it("names a value the list has not loaded from selectedOptions", () => {
    render(
      <Server
        search={async () => []}
        initial="far"
        selectedOptions={[{ value: "far", label: "Carrier #140" }]}
      />,
    );
    expect(trigger().textContent).toContain("Carrier #140");
  });

  it("says the search failed instead of claiming no results", async () => {
    render(
      <Server
        search={async () => {
          throw new Error("boom");
        }}
      />,
    );
    await open();
    await waitFor(() => expect(screen.getByText("Search failed")).toBeTruthy());
  });

  it("handles a 100-row page end to end", async () => {
    const page = Array.from({ length: 100 }, (_, i) => ({
      value: `id-${i}`,
      label: `Carrier ${i}`,
    }));
    const onValueChange = vi.fn();
    function Big(): React.JSX.Element {
      const [value, setValue] = React.useState<string | null>(null);
      return (
        <SearchSelect
          search={async () => page}
          pageSize={100}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
          labels={labels}
        />
      );
    }
    render(<Big />);
    const started = performance.now();
    await open();
    await waitFor(() => expect(rows()).toHaveLength(100));
    fireEvent.keyDown(searchInput(), { key: "End" });
    fireEvent.keyDown(searchInput(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("id-99");
    expect(performance.now() - started).toBeLessThan(3000);
  });
});

describe("SearchSelect: disabled reasons, groups and the footer action", () => {
  it("prints the reason in the row and refuses the pick", async () => {
    const onValueChange = vi.fn();
    render(
      <Single
        onValueChange={onValueChange}
        options={[
          { value: "off", label: "Old Co", disabledReason: "Carrier inactive" },
          { value: "on", label: "New Co" },
        ]}
      />,
    );
    await open();
    const refused = rows()[0] as HTMLElement;
    expect(refused.getAttribute("aria-disabled")).toBe("true");
    expect(
      refused.querySelector('[data-slot="search-select-reason"]')?.textContent,
    ).toBe("Carrier inactive");
    fireEvent.click(refused);
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(searchInput(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("on");
  });

  it("groups options under their headings, in first-seen order", async () => {
    render(
      <Single
        options={[
          { value: "a", label: "Home", group: "Saved" },
          { value: "b", label: "Depot", group: "Customer" },
          { value: "c", label: "Office", group: "Saved" },
        ]}
      />,
    );
    await open();
    const groups = screen.getAllByRole("group");
    expect(groups.map((g) => g.getAttribute("aria-labelledby"))).toHaveLength(
      2,
    );
    expect(groups[0]?.textContent).toContain("Saved");
    expect(groups[0]?.textContent).toContain("Office");
    expect(groups[1]?.textContent).toContain("Customer");
  });

  it("renders the footer action with the query and a close handle", async () => {
    const onCreate = vi.fn();
    render(
      <Single
        footer={({ query, close }) => (
          <button
            type="button"
            onClick={() => {
              onCreate(query);
              close();
            }}
          >
            New address
          </button>
        )}
      />,
    );
    await open();
    fireEvent.change(searchInput(), { target: { value: "Dammam" } });
    fireEvent.click(screen.getByRole("button", { name: "New address" }));
    expect(onCreate).toHaveBeenCalledWith("Dammam");
    await waitFor(() => expect(searchInput()).toBeNull());
  });
});

describe("SearchSelect: keyboard", () => {
  it("opens from the trigger with ArrowDown", async () => {
    render(<Single />);
    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    await waitFor(() => expect(searchInput()).not.toBeNull());
  });

  it("opens on a typed character and searches it", async () => {
    render(<Single />);
    fireEvent.keyDown(trigger(), { key: "n" });
    await waitFor(() => expect(searchInput()).not.toBeNull());
    expect(searchInput().value).toBe("n");
    expect(rowLabels()).toEqual(["Najd Haulage"]);
  });

  it("walks the rows with arrows, Home and End and picks with Enter", async () => {
    const onValueChange = vi.fn();
    render(<Single onValueChange={onValueChange} />);
    await open();
    const active = (): string | null =>
      document.querySelector(
        '[data-active="true"] [data-slot="search-select-label"]',
      )?.textContent ?? null;
    expect(active()).toBe("Acme Freight");
    fireEvent.keyDown(searchInput(), { key: "ArrowDown" });
    expect(active()).toBe("Basma Logistics");
    fireEvent.keyDown(searchInput(), { key: "End" });
    expect(active()).toBe("Najd Haulage");
    fireEvent.keyDown(searchInput(), { key: "Home" });
    expect(active()).toBe("Acme Freight");
    fireEvent.keyDown(searchInput(), { key: "ArrowUp" });
    fireEvent.keyDown(searchInput(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("c3");
  });

  it("closes on Escape and hands focus back to the trigger", async () => {
    render(<Single />);
    await open();
    expect(document.activeElement).toBe(searchInput());
    fireEvent.keyDown(searchInput(), { key: "Escape" });
    await waitFor(() => expect(searchInput()).toBeNull());
    expect(document.activeElement).toBe(trigger());
  });
});

describe("SearchSelect: trigger", () => {
  it("is a combobox named by its Label, with aria-expanded", async () => {
    render(
      <>
        <Label htmlFor="carrier">Carrier</Label>
        <SearchSelect
          id="carrier"
          options={carriers}
          value={null}
          onValueChange={() => {}}
          labels={labels}
        />
      </>,
    );
    const button = screen.getByRole("combobox", { name: "Carrier" });
    expect(button).toBe(trigger());
    expect(button.getAttribute("aria-expanded")).toBe("false");
    await open();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    const panel = document.getElementById(
      trigger().getAttribute("aria-controls") ?? "",
    );
    expect(panel?.contains(searchInput())).toBe(true);
  });

  it("wears the select trigger chrome for every variant", () => {
    render(
      <SearchSelect
        options={carriers}
        value={null}
        onValueChange={() => {}}
        labels={labels}
        variant="ghost"
        size="default"
      />,
    );
    const expected = selectTriggerChrome({
      variant: "ghost",
      size: "default",
      chevron: true,
      closed: false,
    }).split(" ");
    const actual = trigger().className.split(" ");
    for (const cls of expected) expect(actual).toContain(cls);
  });

  it("marks itself invalid for assistive tech", () => {
    render(
      <SearchSelect
        options={carriers}
        value={null}
        onValueChange={() => {}}
        labels={labels}
        invalid
        aria-describedby="carrier-error"
      />,
    );
    expect(trigger().getAttribute("aria-invalid")).toBe("true");
    expect(trigger().getAttribute("aria-describedby")).toBe("carrier-error");
  });

  it("says it is required only when asked", () => {
    const { rerender } = render(
      <SearchSelect
        options={carriers}
        value={null}
        onValueChange={() => {}}
        labels={labels}
        aria-required
      />,
    );
    expect(trigger().getAttribute("aria-required")).toBe("true");
    rerender(
      <SearchSelect
        options={carriers}
        value={null}
        onValueChange={() => {}}
        labels={labels}
      />,
    );
    expect(trigger().hasAttribute("aria-required")).toBe(false);
  });

  it("stays shut with a closed reason, which it carries", () => {
    render(
      <SearchSelect
        options={carriers}
        value={null}
        onValueChange={() => {}}
        labels={labels}
        closed="Assign a carrier first"
        className="w-full"
      />,
    );
    expect(trigger().getAttribute("aria-disabled")).toBe("true");
    expect(trigger().className).toContain("pointer-events-none");
    const wrapper = document.querySelector(
      '[data-slot="search-select-trigger-closed"]',
    );
    expect(wrapper?.className).toContain("w-full");
    fireEvent.click(trigger());
    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    expect(searchInput()).toBeNull();
  });
});

describe("SearchSelect: layout", () => {
  it("sizes the panel from the trigger and the available room", async () => {
    render(<Single />);
    await open();
    const content = document.querySelector(
      '[data-slot="popover-content"]',
    ) as HTMLElement;
    expect(content.style.maxHeight).toContain(
      "--radix-popover-content-available-height",
    );
    expect(content.style.width).toContain("--radix-popover-trigger-width");
    expect(content.style.maxWidth).toContain(
      "--radix-popover-content-available-width",
    );
  });

  it("renders right to left with the single check at the inline end", async () => {
    render(
      <DirectionProvider dir="rtl">
        <Single initial="c1" />
      </DirectionProvider>,
    );
    await open();
    expect(
      document.querySelector('[data-slot="listbox"]')?.getAttribute("dir"),
    ).toBe("rtl");
    const row = rows()[0] as HTMLElement;
    const check = row.querySelector('[data-slot="search-select-check"]');
    expect(row.lastElementChild).toBe(check);
    expect(check?.className).toContain("ms-auto");
    expect(check?.className).not.toMatch(/\b(ml|mr|left|right)-/);
  });

  describe("below 640px", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    function narrow(): void {
      vi.stubGlobal(
        "matchMedia",
        (query: string): MediaQueryList =>
          ({
            matches: query.includes("max-width: 639px"),
            media: query,
            onchange: null,
            addEventListener: (): void => {},
            removeEventListener: (): void => {},
            addListener: (): void => {},
            removeListener: (): void => {},
            dispatchEvent: (): boolean => false,
          }) as MediaQueryList,
      );
    }

    it("opens as a full-height sheet with the search focused", async () => {
      narrow();
      const onValueChange = vi.fn();
      render(<Single onValueChange={onValueChange} />);
      await open();
      const sheet = document.querySelector(
        '[data-slot="sheet-content"]',
      ) as HTMLElement;
      expect(sheet).not.toBeNull();
      expect(sheet.style.height).toContain("100dvh");
      expect(
        document.querySelector('[data-slot="popover-content"]'),
      ).toBeNull();
      await waitFor(() => expect(document.activeElement).toBe(searchInput()));
      expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
      fireEvent.click(rows()[2] as HTMLElement);
      expect(onValueChange).toHaveBeenCalledWith("c3");
    });
  });
});

function narrowViewport(): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList =>
      ({
        matches: query.includes("max-width: 639px"),
        media: query,
        onchange: null,
        addEventListener: (): void => {},
        removeEventListener: (): void => {},
        addListener: (): void => {},
        removeListener: (): void => {},
        dispatchEvent: (): boolean => false,
      }) as MediaQueryList,
  );
}

type Search = (
  query: string,
  signal: AbortSignal,
) => Promise<SearchSelectOption[]>;

describe("SearchSelect: dependent search (searchKey)", () => {
  function Trucks({
    carrier,
    search,
    open,
    onOpenChange,
  }: {
    carrier: string;
    search: Search;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }): React.JSX.Element {
    return (
      <SearchSelect
        search={search}
        searchKey={carrier}
        value={null}
        onValueChange={() => {}}
        labels={labels}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  function scoped(): {
    search: ReturnType<typeof vi.fn<Search>>;
    answers: Map<string, ReturnType<typeof deferred<SearchSelectOption[]>>>;
    carrier: { current: string };
  } {
    const answers = new Map<
      string,
      ReturnType<typeof deferred<SearchSelectOption[]>>
    >();
    const carrier = { current: "A" };
    const search = vi.fn<Search>(() => {
      const answer = deferred<SearchSelectOption[]>();
      answers.set(carrier.current, answer);
      return answer.promise;
    });
    return { search, answers, carrier };
  }

  it("refetches and clears the old rows when the key changes while open", async () => {
    const { search, answers, carrier } = scoped();
    const { rerender } = render(<Trucks carrier="A" search={search} />);
    await open();
    await waitFor(() => expect(answers.has("A")).toBe(true));
    await act(async () =>
      answers.get("A")?.resolve([{ value: "ta", label: "Truck of A" }]),
    );
    expect(rowLabels()).toEqual(["Truck of A"]);
    carrier.current = "B";
    rerender(<Trucks carrier="B" search={search} />);
    expect(rowLabels()).toEqual([]);
    expect(screen.getByRole("status").textContent).toContain("Searching");
    await waitFor(() => expect(answers.has("B")).toBe(true));
    await act(async () =>
      answers.get("B")?.resolve([{ value: "tb", label: "Truck of B" }]),
    );
    expect(rowLabels()).toEqual(["Truck of B"]);
  });

  it("never reopens on the old key's cached answer", async () => {
    const { search, answers, carrier } = scoped();
    const { rerender } = render(<Trucks carrier="A" search={search} />);
    await open();
    await waitFor(() => expect(answers.has("A")).toBe(true));
    await act(async () =>
      answers.get("A")?.resolve([{ value: "ta", label: "Truck of A" }]),
    );
    fireEvent.keyDown(searchInput(), { key: "Escape" });
    await waitFor(() => expect(searchInput()).toBeNull());
    carrier.current = "B";
    rerender(<Trucks carrier="B" search={search} />);
    await open();
    expect(rowLabels()).toEqual([]);
    await waitFor(() => expect(answers.has("B")).toBe(true));
    await act(async () =>
      answers.get("B")?.resolve([{ value: "tb", label: "Truck of B" }]),
    );
    expect(rowLabels()).toEqual(["Truck of B"]);
  });

  it("treats a returning key's old answer as stale until it refetches", async () => {
    const { search, answers, carrier } = scoped();
    const { rerender } = render(<Trucks carrier="A" search={search} />);
    await open();
    await waitFor(() => expect(answers.has("A")).toBe(true));
    await act(async () =>
      answers.get("A")?.resolve([{ value: "ta", label: "Truck of A" }]),
    );
    carrier.current = "B";
    rerender(<Trucks carrier="B" search={search} />);
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2));
    carrier.current = "A";
    rerender(<Trucks carrier="A" search={search} />);
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("listbox").getAttribute("data-stale")).toBe("true");
    await waitFor(() => expect(search).toHaveBeenCalledTimes(3));
    await act(async () =>
      answers.get("A")?.resolve([{ value: "ta2", label: "Truck of A, now" }]),
    );
    expect(rowLabels()).toEqual(["Truck of A, now"]);
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBeNull();
  });

  it("asks again on reopen instead of trusting the last answer", async () => {
    let round = 0;
    const search = vi.fn<Search>(async () => {
      round += 1;
      return [{ value: `r${round}`, label: `Round ${round}` }];
    });
    render(<Trucks carrier="A" search={search} />);
    await open();
    await waitFor(() => expect(rowLabels()).toEqual(["Round 1"]));
    fireEvent.keyDown(searchInput(), { key: "Escape" });
    await waitFor(() => expect(searchInput()).toBeNull());
    await open();
    expect(rowLabels()).not.toContain("Round 1");
    await waitFor(() => expect(rowLabels()).toEqual(["Round 2"]));
  });

  it("clears the query when a controlled open goes false", async () => {
    function Controlled(): React.JSX.Element {
      const [isOpen, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            shut
          </button>
          <SearchSelect
            options={carriers}
            value={null}
            onValueChange={() => {}}
            labels={labels}
            open={isOpen}
            onOpenChange={setOpen}
          />
        </>
      );
    }
    render(<Controlled />);
    await open();
    fireEvent.change(searchInput(), { target: { value: "najd" } });
    fireEvent.click(screen.getByText("shut"));
    await waitFor(() => expect(searchInput()).toBeNull());
    await open();
    expect(searchInput().value).toBe("");
  });
});

describe("SearchSelect: footer context and creatable", () => {
  it("hands the footer the listed options, the values and select-all", async () => {
    const seen: SearchSelectFooterContext[] = [];
    const onValueChange = vi.fn();
    function All(): React.JSX.Element {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <SearchSelect
          multiple
          search={async () => [
            { value: "a", label: "A" },
            { value: "b", label: "B", disabledReason: "Inactive" },
            { value: "c", label: "C" },
          ]}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
          labels={labels}
          footer={(context) => {
            seen.push(context);
            return (
              <>
                <button type="button" onClick={context.selectAll}>
                  All
                </button>
                <button type="button" onClick={context.clear}>
                  None
                </button>
              </>
            );
          }}
        />
      );
    }
    render(<All />);
    await open();
    await waitFor(() => expect(rows()).toHaveLength(3));
    const last = (): SearchSelectFooterContext | undefined => seen.at(-1);
    expect(last()?.options.map((o) => o.value)).toEqual(["a", "c"]);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(last()?.values).toEqual(["a", "c"]);
    fireEvent.click(screen.getByRole("button", { name: "None" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("selects only the rows the static query shows", async () => {
    const seen: SearchSelectFooterContext[] = [];
    const onValueChange = vi.fn();
    function Filtered(): React.JSX.Element {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <SearchSelect
          multiple
          options={carriers}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
          labels={labels}
          footer={(context) => {
            seen.push(context);
            return (
              <button type="button" onClick={context.selectAll}>
                All
              </button>
            );
          }}
        />
      );
    }
    render(<Filtered />);
    await open();
    fireEvent.change(searchInput(), { target: { value: "ba" } });
    expect(seen.at(-1)?.options.map((o) => o.value)).toEqual(["c2"]);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["c2"]);
    fireEvent.change(searchInput(), { target: { value: "أكم" } });
    expect(seen.at(-1)?.options.map((o) => o.value)).toEqual(["c1"]);
  });

  it("offers a create row for an unmatched query, reachable with Enter", async () => {
    const onCreate = vi.fn();
    render(
      <SearchSelect
        options={[{ value: "fuel", label: "FUEL" }]}
        value={null}
        onValueChange={() => {}}
        labels={{ ...labels, create: (query) => `Use “${query}”` }}
        onCreate={onCreate}
      />,
    );
    await open();
    fireEvent.change(searchInput(), { target: { value: "fuel" } });
    expect(screen.queryByText(/Use “/)).toBeNull();
    fireEvent.change(searchInput(), { target: { value: "DETENTION " } });
    const create = screen.getByRole("option", { name: "Use “DETENTION”" });
    expect(create).toBeTruthy();
    fireEvent.keyDown(searchInput(), { key: "Enter" });
    expect(onCreate).toHaveBeenCalledWith("DETENTION");
    await waitFor(() => expect(searchInput()).toBeNull());
  });
});

describe("SearchSelect: minor contracts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the previous rows, dimmed, while the next query loads", async () => {
    const answers = new Map<
      string,
      ReturnType<typeof deferred<SearchSelectOption[]>>
    >();
    const search = vi.fn<Search>((query) => {
      const answer = deferred<SearchSelectOption[]>();
      answers.set(query, answer);
      return answer.promise;
    });
    render(
      <SearchSelect
        search={search}
        value={null}
        onValueChange={() => {}}
        labels={labels}
      />,
    );
    await open();
    await waitFor(() => expect(answers.has("")).toBe(true));
    await act(async () => answers.get("")?.resolve(carriers));
    fireEvent.change(searchInput(), { target: { value: "ba" } });
    expect(rowLabels()).toHaveLength(3);
    const list = screen.getByRole("listbox");
    expect(list.getAttribute("aria-busy")).toBe("true");
    expect(list.getAttribute("data-stale")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain("Searching");
    await waitFor(() => expect(answers.has("ba")).toBe(true));
    await act(async () =>
      answers.get("ba")?.resolve([{ value: "c2", label: "Basma Logistics" }]),
    );
    expect(rowLabels()).toEqual(["Basma Logistics"]);
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBeNull();
  });

  it("asks the person to type when the idle list is empty", async () => {
    render(
      <SearchSelect
        search={async () => carriers}
        idleOptions={[]}
        value={null}
        onValueChange={() => {}}
        labels={{ ...labels, typeToSearch: "Type to search" }}
      />,
    );
    await open();
    expect(screen.getByText("Type to search")).toBeTruthy();
  });

  it("shows the placeholder, never a raw id, for a value it cannot name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <SearchSelect
        search={async () => []}
        value="0b6d2c8e-uuid"
        onValueChange={() => {}}
        labels={labels}
      />,
    );
    expect(trigger().textContent).toContain("Pick a carrier");
    expect(trigger().textContent).not.toContain("0b6d2c8e-uuid");
    expect(warn).toHaveBeenCalled();
  });

  it("names the search field and the panel", async () => {
    render(
      <SearchSelect
        options={carriers}
        value={null}
        onValueChange={() => {}}
        labels={{ ...labels, title: "Carrier" }}
      />,
    );
    await open();
    expect(searchInput().getAttribute("aria-label")).toBe("Search carriers");
    expect(screen.getByRole("dialog", { name: "Carrier" })).toBeTruthy();
  });

  it("forwards a ref to the trigger", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <SearchSelect
        ref={ref}
        options={carriers}
        value={null}
        onValueChange={() => {}}
        labels={labels}
      />,
    );
    expect(ref.current).toBe(trigger());
  });

  it("leaves the outer sheet's body pin alone when its sheet closes", async () => {
    narrowViewport();
    const agent = vi.spyOn(navigator, "userAgent", "get");
    agent.mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    function InSheet(): React.JSX.Element {
      const [value, setValue] = React.useState<string | null>(null);
      return (
        <>
          <Sheet>
            <SheetTrigger>edit</SheetTrigger>
            <SheetContent aria-describedby={undefined}>
              <SheetTitle>Order</SheetTitle>
              <SearchSelect
                options={carriers}
                value={value}
                onValueChange={setValue}
                labels={labels}
              />
            </SheetContent>
          </Sheet>
        </>
      );
    }
    render(<InSheet />);
    fireEvent.click(screen.getByText("edit"));
    await waitFor(() => expect(document.body.style.position).toBe("fixed"));
    await open();
    fireEvent.click(rows()[0] as HTMLElement);
    await waitFor(() => expect(searchInput()).toBeNull());
    expect(document.body.style.position).toBe("fixed");
  });
});
