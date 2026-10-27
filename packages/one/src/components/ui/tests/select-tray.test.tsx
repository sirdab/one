import * as React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Label } from "../label";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectLabelsProvider,
  SelectTrigger,
  SelectValue,
} from "../select";

const realMatchMedia = window.matchMedia;

function stubViewport(belowMd: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: belowMd && query === "(width < 48rem)",
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => stubViewport(true));

afterEach(() => {
  window.matchMedia = realMatchMedia;
  cleanup();
});

function Options({ count }: { count: number }): React.JSX.Element {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <SelectItem key={index} value={`v${String(index)}`}>
          {`Option ${String(index)}`}
        </SelectItem>
      ))}
    </>
  );
}

function Basic({
  onValueChange,
  defaultValue,
  triggerProps,
  selectProps,
}: {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  triggerProps?: React.ComponentProps<typeof SelectTrigger>;
  selectProps?: Partial<React.ComponentProps<typeof Select>>;
}): React.JSX.Element {
  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      {...selectProps}
    >
      <SelectTrigger aria-label="Status" {...triggerProps}>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="archived">Archived</SelectItem>
      </SelectContent>
    </Select>
  );
}

function trigger(): HTMLElement {
  const node = document.querySelector('[data-slot="select-trigger"]');
  if (!(node instanceof HTMLElement)) throw new Error("no trigger");
  return node;
}

function tap(): void {
  fireEvent.click(trigger());
}

describe("the tray below md", () => {
  it("opens a dialog titled by the trigger's aria-label", () => {
    render(<Basic />);
    tap();
    expect(screen.getByRole("dialog", { name: "Status" })).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(document.querySelector('[data-slot="select-content"]')).toBeNull();
  });

  it("is titled by aria-labelledby when that is the name", () => {
    render(
      <>
        <span id="lbl">Discount type</span>
        <Select>
          <SelectTrigger aria-labelledby="lbl">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </>,
    );
    tap();
    expect(screen.getByRole("dialog", { name: "Discount type" })).toBeTruthy();
  });

  it("is titled by the label that points at the trigger", () => {
    render(
      <>
        <Label htmlFor="kind">Business type</Label>
        <Select>
          <SelectTrigger id="kind">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </>,
    );
    tap();
    expect(screen.getByRole("dialog", { name: "Business type" })).toBeTruthy();
  });

  it("marks the trigger open while the tray is", () => {
    render(<Basic />);
    tap();
    expect(trigger().getAttribute("data-state")).toBe("open");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    const listbox = screen.getByRole("listbox");
    expect(trigger().getAttribute("aria-controls")).toBe(listbox.id);
  });

  it("picks on a tap, tells the caller, closes, and the field shows it", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);
    tap();
    fireEvent.click(screen.getByRole("option", { name: "Active" }));
    expect(onValueChange).toHaveBeenCalledWith("active");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger().textContent).toContain("Active");
  });

  it("leaves the value alone when it is dismissed", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} defaultValue="draft" />);
    tap();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger().textContent).toContain("Draft");
  });

  it("starts on its defaultValue and marks that row with the check", () => {
    render(<Basic defaultValue="active" />);
    expect(trigger().textContent).toContain("Active");
    tap();
    const chosen = screen.getByRole("option", { name: "Active" });
    expect(chosen.getAttribute("aria-selected")).toBe("true");
    expect(chosen.querySelector("svg")).not.toBeNull();
    const other = screen.getByRole("option", { name: "Draft" });
    expect(other.getAttribute("aria-selected")).toBe("false");
    expect(other.querySelector("svg")).toBeNull();
  });

  it("focuses the chosen row on open", () => {
    render(<Basic defaultValue="active" />);
    tap();
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: "Active" }),
    );
  });

  it("hands focus back to the trigger on Escape", async () => {
    render(<Basic />);
    tap();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger());
  });

  it("never opens a select that is closed", () => {
    render(<Basic triggerProps={{ closed: "Pick a language first" }} />);
    tap();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the popover when the caller controls open", () => {
    render(<Basic selectProps={{ open: true }} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      document.querySelector('[data-slot="select-content"]'),
    ).not.toBeNull();
  });

  it("keeps the popover inside a dialog, so there is never a panel over a panel", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>open</PopoverTrigger>
        <PopoverContent>
          <Basic />
        </PopoverContent>
      </Popover>,
    );
    tap();
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
    expect(
      document.querySelector('[data-slot="select-content"]'),
    ).not.toBeNull();
  });

  it("keeps the popover for a hand-set role=dialog ancestor", () => {
    render(
      <div role="dialog" aria-label="Preview">
        <Basic />
      </div>,
    );
    tap();
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
  });

  it("keeps the popover on a wide screen", () => {
    stubViewport(false);
    render(<Basic />);
    tap();
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
    expect(
      document.querySelector('[data-slot="select-content"]'),
    ).not.toBeNull();
  });

  it("renders no tray on the server", () => {
    const html = renderToString(<Basic defaultValue="draft" />);
    expect(html).not.toContain("sheet-content");
    expect(html).not.toContain('role="dialog"');
  });

  it("shows a caption for a row that says why it is unavailable, and never picks it", () => {
    const onValueChange = vi.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Plan">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a" disabledReason="Needs the Pro plan">
            Alpha
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    tap();
    expect(screen.getByText("Needs the Pro plan")).toBeTruthy();
    fireEvent.click(screen.getByRole("option", { name: /Alpha/ }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps group headings", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Region">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Gulf</SelectLabel>
            <SelectItem value="sa">Saudi Arabia</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    tap();
    expect(within(screen.getByRole("group")).getByText("Gulf")).toBeTruthy();
  });
});

describe("the tray's search", () => {
  function Long({ count }: { count: number }): React.JSX.Element {
    return (
      <Select>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <Options count={count} />
        </SelectContent>
      </Select>
    );
  }

  it("shows past 12 options, counted through a wrapper component", () => {
    render(<Long count={13} />);
    tap();
    expect(screen.getByRole("searchbox")).toBeTruthy();
  });

  it("does not show at 12", () => {
    render(<Long count={12} />);
    tap();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("does not take focus on open, so the keyboard stays down", () => {
    render(<Long count={13} />);
    tap();
    expect(document.activeElement).not.toBe(screen.getByRole("searchbox"));
  });

  it("narrows the rows as she types", () => {
    render(<Long count={13} />);
    tap();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Option 12" },
    });
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("finds an Arabic spelling written the other way", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Name">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <Options count={12} />
          <SelectItem value="sara">ساره</SelectItem>
        </SelectContent>
      </Select>,
    );
    tap();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "سارة" },
    });
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("says so, in a pill, when nothing matches", () => {
    render(
      <SelectLabelsProvider
        labels={{
          search: "Search",
          noMatches: "Nothing by that name.",
          clear: "Clear",
          close: "Close",
        }}
      >
        <Long count={13} />
      </SelectLabelsProvider>,
    );
    tap();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zzz" },
    });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Nothing by that name.")).toBeTruthy();
  });

  it("starts empty each time it opens", async () => {
    render(<Long count={13} />);
    tap();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Option 1" },
    });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    act(() => tap());
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("option")).toHaveLength(13);
  });

  it("names the sr-only close and the search from the app's strings", () => {
    render(
      <SelectLabelsProvider
        labels={{
          search: "ابحث",
          noMatches: "ما فيه شي بهالاسم.",
          clear: "امسح البحث",
          close: "إغلاق",
        }}
      >
        <Long count={13} />
      </SelectLabelsProvider>,
    );
    tap();
    expect(screen.getByRole("searchbox", { name: "ابحث" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "إغلاق" })).toBeTruthy();
  });

  it("pins the wrapper to the scroller's visible height, not the wrapper's own", () => {
    const client = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "clientHeight",
    );
    const offset = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "offsetHeight",
    );
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get(this: HTMLElement): number {
        return this.dataset.slot === "select-tray-scroller" ? 400 : 0;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get(this: HTMLElement): number {
        return this.dataset.slot === "select-tray-pinned" ? 900 : 0;
      },
    });
    try {
      render(<Long count={13} />);
      tap();
      const scroller = document.querySelector<HTMLElement>(
        '[data-slot="select-tray-scroller"]',
      );
      const pinned = document.querySelector<HTMLElement>(
        '[data-slot="select-tray-pinned"]',
      );
      expect(pinned?.style.minHeight).toBe("400px");
      expect(scroller?.style.minHeight).toBe("");
      expect(scroller?.contains(pinned ?? null)).toBe(true);
    } finally {
      for (const [key, descriptor] of [
        ["clientHeight", client],
        ["offsetHeight", offset],
      ] as const) {
        if (descriptor)
          Object.defineProperty(HTMLElement.prototype, key, descriptor);
        else Reflect.deleteProperty(HTMLElement.prototype, key);
      }
    }
  });

  it("scrolls back to the top when a query narrows the rows", () => {
    render(<Long count={13} />);
    tap();
    const scroller = document.querySelector<HTMLElement>(
      '[data-slot="select-tray-scroller"]',
    );
    if (!scroller) throw new Error("no scroller");
    scroller.scrollTop = 300;
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Option 12" },
    });
    expect(scroller.scrollTop).toBe(0);
    const match = screen.getByRole("option", { name: "Option 12" });
    expect(match.hasAttribute("hidden")).toBe(false);
  });

  it("re-rendered children leave the scroll position alone; only a new query scrolls to the top", () => {
    const view = render(<Long count={13} />);
    tap();
    const scroller = document.querySelector<HTMLElement>(
      '[data-slot="select-tray-scroller"]',
    );
    if (!scroller) throw new Error("no scroller");
    scroller.scrollTop = 300;
    expect(scroller.scrollTop).toBe(300);
    view.rerender(<Long count={13} />);
    expect(scroller.scrollTop).toBe(300);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Option 12" },
    });
    expect(scroller.scrollTop).toBe(0);
  });

  it("keeps its filtered rows while closing, and empties only on the next open", async () => {
    const realStyle = globalThis.getComputedStyle.bind(globalThis);
    vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
      (element: Element, pseudo?: string | null) => {
        const style = realStyle(element, pseudo);
        return new Proxy(style, {
          get: (target, key) => {
            if (key === "animationName")
              return element.getAttribute("data-state") === "closed"
                ? "slide-out"
                : "none";
            const value: unknown = Reflect.get(target, key);
            return typeof value === "function"
              ? (value as (...args: unknown[]) => unknown).bind(target)
              : value;
          },
        });
      },
    );
    try {
      render(<Long count={13} />);
      tap();
      const input = screen.getByRole("searchbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Option 12" } });
      expect(screen.getAllByRole("option")).toHaveLength(1);
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      const held = document.querySelector<HTMLInputElement>(
        'input[type="search"]',
      );
      expect(held?.value).toBe("Option 12");
      expect(document.querySelectorAll('[role="option"][hidden]')).toHaveLength(
        12,
      );
      vi.stubGlobal("CSS", { escape: (value: string): string => value });
      const exit = new Event("animationend", { bubbles: true });
      Object.defineProperty(exit, "animationName", {
        value: "slide-out",
      });
      act(() => {
        screen.getByRole("dialog", { hidden: true }).dispatchEvent(exit);
      });
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      act(() => tap());
      expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe(
        "",
      );
      expect(screen.getAllByRole("option")).toHaveLength(13);
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });
});

describe("a named select in a form", () => {
  it("submits the row picked in the tray when the select was uncontrolled", async () => {
    render(
      <form data-testid="form">
        <Select name="status" defaultValue="draft">
          <SelectTrigger aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("status")).toBe("draft");
    tap();
    fireEvent.click(screen.getByRole("option", { name: "Active" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(new FormData(form).get("status")).toBe("active");
  });
});
