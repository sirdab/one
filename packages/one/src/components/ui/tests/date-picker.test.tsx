import "@testing-library/jest-dom/vitest";

import * as React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "../../../provider";
import {
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  type DatePickerLabels,
  type DateRange,
} from "../date-picker";

const labels: DatePickerLabels = {
  placeholder: "Pick a date",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  close: "Close",
  clear: "Clear",
};

const dateTimeLabels = {
  ...labels,
  done: "Done",
  hour: "Hour",
  minute: "Minute",
};

function trigger(): HTMLElement {
  return document.querySelector(
    '[data-slot="date-picker-trigger"]',
  ) as HTMLElement;
}

async function open(): Promise<HTMLElement> {
  fireEvent.click(trigger());
  return screen.findByRole("grid");
}

function day(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function Single({
  initial = "",
  onChange,
  ...props
}: {
  initial?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  clearable?: boolean;
  numeralLocale?: "ar-SA" | "en-US";
}): React.JSX.Element {
  const [value, setValue] = React.useState(initial);
  return (
    <DatePicker
      labels={labels}
      timeZone="Asia/Riyadh"
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-03-15T09:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DatePicker", () => {
  it("shows the placeholder, then the picked day in the trigger", async () => {
    render(<Single />);
    expect(trigger()).toHaveTextContent("Pick a date");
    expect(trigger()).toHaveAttribute("data-placeholder");

    await open();
    fireEvent.click(day("Friday, March 20, 2026"));

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent("Mar 20, 2026");
  });

  it("hands back the day as YYYY-MM-DD", async () => {
    const onChange = vi.fn();
    render(<Single onChange={onChange} />);

    await open();
    fireEvent.click(day("Monday, March 2, 2026"));

    expect(onChange).toHaveBeenCalledWith("2026-03-02");
  });

  it("opens on the picked month with the pick selected and today marked", async () => {
    render(<Single initial="2026-03-04" />);
    await open();

    expect(screen.getByText("March 2026")).toBeInTheDocument();
    const picked = day("Wednesday, March 4, 2026");
    expect(picked.closest("td")).toHaveAttribute("aria-selected", "true");
    expect(picked).toHaveFocus();
    expect(day("Sunday, March 15, 2026")).toHaveAttribute(
      "aria-current",
      "date",
    );
  });

  it("starts the week on Sunday", async () => {
    render(<Single />);
    const grid = await open();

    const heads = within(grid).getAllByRole("columnheader");
    expect(heads[0]).toHaveAttribute("abbr", "Sunday");
    expect(heads[6]).toHaveAttribute("abbr", "Saturday");
  });

  it("turns the month with the arrows", async () => {
    render(<Single initial="2026-03-04" />);
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("April 2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("February 2026")).toBeInTheDocument();
  });

  describe("min and max", () => {
    it("refuses the days outside them", async () => {
      const onChange = vi.fn();
      render(
        <Single
          initial="2026-03-10"
          min="2026-03-05"
          max="2026-03-20"
          onChange={onChange}
        />,
      );
      await open();

      const early = day("Wednesday, March 4, 2026");
      const late = day("Saturday, March 21, 2026");
      expect(early).toHaveAttribute("aria-disabled", "true");
      expect(late).toHaveAttribute("aria-disabled", "true");
      expect(day("Thursday, March 5, 2026")).not.toHaveAttribute(
        "aria-disabled",
      );

      fireEvent.click(early);
      fireEvent.click(late);
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("will not turn to a month wholly outside them", async () => {
      render(<Single initial="2026-03-10" min="2026-03-01" max="2026-03-31" />);
      await open();

      expect(
        screen.getByRole("button", { name: "Previous month" }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    });
  });

  describe("keyboard", () => {
    it("moves a day with the side arrows and a week with up and down", async () => {
      render(<Single initial="2026-03-10" />);
      await open();
      const start = day("Tuesday, March 10, 2026");
      expect(start).toHaveFocus();

      fireEvent.keyDown(start, { key: "ArrowRight" });
      expect(day("Wednesday, March 11, 2026")).toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
      expect(day("Wednesday, March 18, 2026")).toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
      expect(day("Tuesday, March 17, 2026")).toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
      expect(day("Tuesday, March 10, 2026")).toHaveFocus();
    });

    it("goes to the week's ends and across months", async () => {
      render(<Single initial="2026-03-10" />);
      await open();

      fireEvent.keyDown(document.activeElement!, { key: "Home" });
      expect(day("Sunday, March 8, 2026")).toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: "End" });
      expect(day("Saturday, March 14, 2026")).toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: "PageDown" });
      expect(screen.getByText("April 2026")).toBeInTheDocument();
      expect(day("Tuesday, April 14, 2026")).toHaveFocus();
    });

    it("picks with Enter", async () => {
      const onChange = vi.fn();
      render(<Single initial="2026-03-10" onChange={onChange} />);
      await open();

      fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
      fireEvent.click(document.activeElement!);
      expect(onChange).toHaveBeenCalledWith("2026-03-11");
    });

    it("closes on Escape and gives focus back to the trigger", async () => {
      render(<Single initial="2026-03-10" />);
      await open();

      fireEvent.keyDown(document.activeElement!, { key: "Escape" });

      await waitFor(() =>
        expect(screen.queryByRole("grid")).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(trigger()).toHaveFocus());
    });

    it("opens from the trigger with ArrowDown", async () => {
      render(<Single />);
      fireEvent.keyDown(trigger(), { key: "ArrowDown" });
      expect(await screen.findByRole("grid")).toBeInTheDocument();
    });
  });

  it("clears an optional date", async () => {
    const onChange = vi.fn();
    render(<Single initial="2026-03-10" clearable onChange={onChange} />);
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(trigger()).toHaveTextContent("Pick a date");
  });

  it("offers no clear on a required date", async () => {
    render(<Single initial="2026-03-10" />);
    await open();
    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
  });

  describe("right to left", () => {
    function renderArabic(): void {
      render(
        <DirectionProvider dir="rtl">
          <Single initial="2026-03-10" numeralLocale="ar-SA" />
        </DirectionProvider>,
      );
    }

    it("mirrors the grid and flips the month arrows", async () => {
      renderArabic();
      const grid = await open();

      expect(grid).toHaveAttribute("dir", "rtl");
      const previous = screen.getByRole("button", { name: "Previous month" });
      expect(previous.querySelector("svg")?.getAttribute("class")).toContain(
        "rtl:-scale-x-100",
      );
    });

    it("names the month and days in Arabic with Arabic-Indic digits", async () => {
      renderArabic();
      const grid = await open();

      expect(screen.getByText("مارس ٢٠٢٦")).toBeInTheDocument();
      expect(within(grid).getAllByRole("columnheader")[0]).toHaveAttribute(
        "abbr",
        "الأحد",
      );
      expect(
        within(grid).getByRole("button", { name: "الثلاثاء، ١٠ مارس ٢٠٢٦" }),
      ).toHaveTextContent("١٠");
      expect(trigger()).toHaveTextContent("١٠ مارس ٢٠٢٦");
    });

    it("swaps left and right, so the next day is to the left", async () => {
      renderArabic();
      await open();
      const start = document.activeElement!;
      expect(start).toHaveAttribute("data-date", "2026-03-10");

      fireEvent.keyDown(start, { key: "ArrowLeft" });
      expect(document.activeElement).toHaveAttribute("data-date", "2026-03-11");
      fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
      fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
      expect(document.activeElement).toHaveAttribute("data-date", "2026-03-09");
    });
  });
});

describe("DateTimePicker", () => {
  function Timed({
    initial = "",
    onChange,
  }: {
    initial?: string;
    onChange?: (value: string) => void;
  }): React.JSX.Element {
    const [value, setValue] = React.useState(initial);
    return (
      <DateTimePicker
        labels={dateTimeLabels}
        timeZone="Asia/Riyadh"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
    );
  }

  it("hands back the datetime-local string, day first then time", async () => {
    const onChange = vi.fn();
    render(<Timed onChange={onChange} />);
    await open();

    fireEvent.click(day("Friday, March 20, 2026"));
    expect(onChange).toHaveBeenLastCalledWith("2026-03-20T09:00");

    fireEvent.click(
      within(screen.getByRole("listbox", { name: "Hour" })).getByRole(
        "option",
        { name: "14" },
      ),
    );
    fireEvent.click(
      within(screen.getByRole("listbox", { name: "Minute" })).getByRole(
        "option",
        { name: "45" },
      ),
    );
    expect(onChange).toHaveBeenLastCalledWith("2026-03-20T14:45");

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent("Mar 20, 2026, 14:45");
  });

  it("keeps a saved minute that is off the step", async () => {
    render(<Timed initial="2026-03-20T08:07" />);
    await open();

    const minute = within(screen.getByRole("listbox", { name: "Minute" }))
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(minute).toEqual(["00", "07", "15", "30", "45"]);
    expect(
      within(screen.getByRole("listbox", { name: "Minute" })).getByRole(
        "option",
        { name: "07" },
      ),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("puts a time picked first on today", async () => {
    const onChange = vi.fn();
    render(<Timed onChange={onChange} />);
    await open();

    fireEvent.click(
      within(screen.getByRole("listbox", { name: "Hour" })).getByRole(
        "option",
        { name: "07" },
      ),
    );
    expect(onChange).toHaveBeenLastCalledWith("2026-03-15T07:00");
  });
});

describe("DateRangePicker", () => {
  function Range({
    onChange,
  }: {
    onChange: (value: DateRange) => void;
  }): React.JSX.Element {
    const [value, setValue] = React.useState<DateRange>({
      from: "2026-03-01",
      to: "2026-03-07",
    });
    return (
      <DateRangePicker
        labels={labels}
        timeZone="Asia/Riyadh"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    );
  }

  it("shows the range, and takes a new one in two clicks", async () => {
    const onChange = vi.fn();
    render(<Range onChange={onChange} />);
    expect(trigger()).toHaveTextContent("Mar 1 – 7, 2026");

    await open();
    expect(day("Wednesday, March 4, 2026")).toHaveAttribute("data-in-range");

    fireEvent.click(day("Tuesday, March 24, 2026"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("grid")).toBeInTheDocument();

    fireEvent.click(day("Tuesday, March 10, 2026"));
    expect(onChange).toHaveBeenCalledWith({
      from: "2026-03-10",
      to: "2026-03-24",
    });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("keeps the old range when closed halfway", async () => {
    const onChange = vi.fn();
    render(<Range onChange={onChange} />);
    await open();

    fireEvent.click(day("Tuesday, March 24, 2026"));
    await act(async () => {
      fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(trigger()).toHaveTextContent("Mar 1 – 7, 2026");
  });
});

describe("date picker focus", () => {
  it.each([
    ["single", () => <Single />],
    [
      "range",
      () => (
        <DateRangePicker
          labels={labels}
          value={{ from: "", to: "" }}
          onValueChange={() => {}}
        />
      ),
    ],
  ])(
    "draws the field focus ring on the %s trigger, like Select",
    (_kind, make) => {
      render(make());
      const button = trigger();
      expect(button.tagName).toBe("BUTTON");
      expect(button.className).toContain("focus-visible:ring-input-focus");
      button.focus();
      expect(document.activeElement).toBe(button);
    },
  );
});
