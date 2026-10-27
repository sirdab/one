import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Combobox } from "../combobox";
import { Command, CommandInput, CommandItem, CommandList } from "../command";
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

  it("never grows wider than the viewport less a 16px gutter each side", () => {
    render(
      <Popover open>
        <PopoverTrigger>o</PopoverTrigger>
        <PopoverContent className="w-96" style={{ minHeight: 10 }}>
          x
        </PopoverContent>
      </Popover>,
    );
    const content = document.querySelector<HTMLElement>(
      '[data-slot="popover-content"]',
    );
    expect(content?.style.maxWidth).toBe("calc(100vw - 32px)");
    expect(content?.style.minHeight).toBe("10px");
  });
});

describe("Command", () => {
  it("renders a solid search header above the scroller", () => {
    render(
      <Command>
        <CommandInput placeholder="find" />
        <CommandList>
          <CommandItem value="a">Alpha</CommandItem>
        </CommandList>
      </Command>,
    );
    const wrapper = document.querySelector(
      '[data-slot="command-input-wrapper"]',
    );
    const cls = wrapper?.className ?? "";
    expect(cls).toContain("bg-popover");
    expect(cls).not.toContain("sticky");
    expect(cls).toContain("border-b");
  });

  it("highlights items with the ghost fill and sizes icons at 16px", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem value="a">Alpha</CommandItem>
        </CommandList>
      </Command>,
    );
    const cls =
      document.querySelector('[data-slot="command-item"]')?.className ?? "";
    expect(cls).toContain("aria-selected:bg-btn-ghost-surface-hover");
    expect(cls).not.toContain("bg-accent");
    expect(cls).toContain("[&>svg:not([class*='size-'])]:size-4");

    expect(cls).toContain("text-body-quiet");
  });
});

describe("Combobox", () => {
  const OPTIONS = [
    { value: "gifts", label: "Gift boxes" },
    { value: "summer", label: "Summer" },
  ];

  function Harness({
    onCreate,
    addLabel,
    options = OPTIONS,
  }: {
    onCreate?: (query: string) => Promise<void>;
    addLabel?: string;
    options?: { value: string; label: string }[];
  }): React.JSX.Element {
    const [value, setValue] = React.useState<string[]>([]);
    return (
      <Combobox
        aria-label="Sections"
        options={options}
        value={value}
        onValueChange={setValue}
        placeholder="No section"
        searchPlaceholder="Search"
        emptyLabel="Nothing here"
        createLabel={(query) => `Add “${query}”`}
        addLabel={addLabel}
        onCreate={onCreate}
      />
    );
  }

  const MANY = Array.from({ length: 13 }, (_, i) => ({
    value: `s${i}`,
    label: `Section ${i}`,
  }));

  function open(): void {
    fireEvent.click(screen.getByRole("button", { name: "Sections" }));
  }

  function search(text: string): void {
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: text },
    });
  }

  it("wears the select's field chrome and chevron", () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Sections" });
    expect(trigger.className).toContain("border-input");
    expect(trigger.className).toContain("rounded-xl");
    expect(trigger.className).toContain("focus-visible:ring-input-focus");
    expect(trigger.className).toContain("data-[state=open]:border-ring");
    expect(trigger.className).not.toContain("btn-surface");
    expect(trigger.className).not.toContain("border-btn-border");
    expect(trigger.innerHTML).toContain("duration-200");
    expect(trigger.innerHTML).toContain("ease-out");
    expect(trigger.innerHTML).toContain("rotate-180");
    expect(trigger.className).toContain("focus-visible:outline-hidden");
  });

  it("draws the chevron at 16px inside its 16px box", () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Sections" });
    expect(trigger.querySelector("svg")?.getAttribute("class") ?? "").toContain(
      "size-4",
    );
    expect(trigger.className).toContain("[&_svg:not([class*='size-'])]:size-4");
  });

  it("toggles several picks and names them on the trigger", () => {
    render(<Harness />);
    open();
    fireEvent.click(screen.getByRole("option", { name: "Gift boxes" }));
    fireEvent.click(screen.getByRole("option", { name: "Summer" }));
    expect(
      screen.getByRole("button", { name: "Sections" }).textContent,
    ).toContain("Gift boxes, Summer");

    fireEvent.click(screen.getByRole("option", { name: "Gift boxes" }));
    expect(
      screen.getByRole("button", { name: "Sections" }).textContent,
    ).not.toContain("Gift boxes");
  });

  it("offers to create any name that is not already an option", async () => {
    const onCreate = vi.fn(async () => {});
    render(<Harness onCreate={onCreate} />);
    open();

    search("gift boxes");
    expect(screen.queryByRole("option", { name: /Add/ })).toBeNull();

    search("  Eid  ");
    await act(async () => {
      fireEvent.click(screen.getByRole("option", { name: "Add “Eid”" }));
    });
    expect(onCreate).toHaveBeenCalledWith("Eid");
  });

  it("keeps an add row that sends an empty search to the field", () => {
    render(
      <Harness onCreate={vi.fn(async () => {})} addLabel="Add a section" />,
    );
    open();
    fireEvent.click(screen.getByRole("option", { name: "Add a section" }));
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Search"));
  });

  it("marks picked rows as checked", () => {
    render(<Harness />);
    open();
    fireEvent.click(screen.getByRole("option", { name: "Summer" }));
    expect(
      screen
        .getByRole("option", { name: "Summer" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("says it is empty, and offers nothing, without onCreate", () => {
    render(<Harness options={MANY} />);
    open();
    search("Eid");
    expect(screen.getByText("Nothing here")).not.toBeNull();
    expect(screen.queryByRole("option", { name: /Add/ })).toBeNull();
  });

  describe("search", () => {
    it("is hidden up to twelve options", () => {
      render(
        <Harness
          options={Array.from({ length: 12 }, (_, i) => ({
            value: `s${i}`,
            label: `Section ${i}`,
          }))}
        />,
      );
      open();
      expect(screen.queryByPlaceholderText("Search")).toBeNull();
    });

    it("shows past twelve options", () => {
      render(<Harness options={MANY} />);
      open();
      expect(screen.getByPlaceholderText("Search")).not.toBeNull();
    });

    it("shows whenever a record can be created", () => {
      render(<Harness onCreate={vi.fn(async () => {})} />);
      open();
      expect(screen.getByPlaceholderText("Search")).not.toBeNull();
    });
  });

  describe("groups", () => {
    function Grouped(): React.JSX.Element {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <Combobox
          aria-label="Countries"
          options={[
            { value: "AE", label: "Emirates" },
            { value: "KW", label: "Kuwait" },
            { value: "US", label: "United States" },
            { value: "XX", label: "Elsewhere" },
          ]}
          groups={[
            { label: "Gulf", values: ["AE", "KW"] },
            { label: "Others", values: ["US"] },
          ]}
          value={value}
          onValueChange={setValue}
          placeholder="Pick"
          searchPlaceholder="Search"
          emptyLabel="Nothing"
        />
      );
    }

    it("heads each set and leaves options in no group last, unheaded", () => {
      render(<Grouped />);
      fireEvent.click(screen.getByRole("button", { name: "Countries" }));
      const headings = Array.from(
        document.querySelectorAll("[cmdk-group-heading]"),
      ).map((el) => el.textContent);
      expect(headings).toEqual(["Gulf", "Others"]);
      const rows = screen.getAllByRole("option").map((el) => el.textContent);
      expect(rows).toEqual([
        "Emirates",
        "Kuwait",
        "United States",
        "Elsewhere",
      ]);
    });
  });

  describe("fixed values", () => {
    function Pinned(): React.JSX.Element {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <Combobox
          aria-label="Countries"
          options={[
            { value: "SA", label: "Saudi Arabia" },
            { value: "AE", label: "Emirates" },
          ]}
          fixed={["SA"]}
          value={value}
          onValueChange={setValue}
          placeholder="Pick"
          searchPlaceholder="Search"
          emptyLabel="Nothing"
        />
      );
    }

    it("lead the summary and are never rows", () => {
      render(<Pinned />);
      const trigger = screen.getByRole("button", { name: "Countries" });
      expect(trigger.textContent).toContain("Saudi Arabia");
      fireEvent.click(trigger);
      expect(screen.queryByRole("option", { name: "Saudi Arabia" })).toBeNull();
      fireEvent.click(screen.getByRole("option", { name: "Emirates" }));
      expect(trigger.textContent).toContain("Saudi Arabia, Emirates");
      fireEvent.click(screen.getByRole("option", { name: "Emirates" }));
      expect(trigger.textContent).toContain("Saudi Arabia");
      expect(trigger.textContent).not.toContain("Emirates");
    });
  });

  describe("the phone tray", () => {
    function mockPhone(matches: boolean): void {
      vi.stubGlobal(
        "matchMedia",
        vi.fn((query: string) => ({
          matches: matches && query === "(width < 48rem)",
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        })),
      );
      window.matchMedia = globalThis.matchMedia;
    }

    afterEach(() => {
      vi.unstubAllGlobals();
      // @ts-expect-error jsdom has no matchMedia: put it back as it was.
      delete window.matchMedia;
    });

    it("opens a titled bottom tray below md, not a popover", () => {
      mockPhone(true);
      render(<Harness />);
      open();
      expect(
        document.querySelector('[data-slot="sheet-content"]'),
      ).not.toBeNull();
      expect(
        document.querySelector('[data-slot="popover-content"]'),
      ).toBeNull();
      expect(screen.getByRole("heading", { name: "Sections" })).not.toBeNull();
      expect(screen.queryByRole("button", { name: "Done" })).toBeNull();
      expect(screen.getByRole("option", { name: "Summer" })).not.toBeNull();
    });

    it("reports the trigger expanded while the tray is open, and keeps it open across picks", () => {
      mockPhone(true);
      render(<Harness />);
      const trigger = screen.getByRole("button", { name: "Sections" });
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      open();
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      fireEvent.click(screen.getByRole("option", { name: "Summer" }));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(
        document.querySelector('[data-slot="sheet-content"]'),
      ).not.toBeNull();
    });

    it("keeps the popover from md up", () => {
      mockPhone(false);
      render(<Harness />);
      open();
      expect(
        document.querySelector('[data-slot="popover-content"]'),
      ).not.toBeNull();
      expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
    });
  });
});
