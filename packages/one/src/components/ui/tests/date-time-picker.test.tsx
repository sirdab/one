import { fireEvent, render, screen } from "@testing-library/react";
import { Direction } from "radix-ui";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Calendar } from "../calendar";
import { DatePicker, DateTimePicker } from "../date-time-picker";

const LABELS = {
  time: "Time",
  hour: "Hour",
  minute: "Minute",
  clear: "Clear",
};

const EVENING = new Date("2026-08-13T15:30:00Z");
const MORNING = new Date("2026-08-01T06:00:00Z");

function mount(
  node: React.JSX.Element,
  dir: "ltr" | "rtl" = "ltr",
): ReturnType<typeof render> {
  return render(<Direction.Provider dir={dir}>{node}</Direction.Provider>);
}

function day(iso: string): HTMLElement {
  const cell = document.querySelector(`button[data-day="${iso}"]`);
  if (!cell) throw new Error(`no day button for ${iso}`);
  return cell as HTMLElement;
}

describe("the trigger", () => {
  it("reads the placeholder while empty and the value once set", () => {
    const { rerender } = mount(
      <DateTimePicker
        value={null}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    expect(screen.getByRole("button").textContent).toContain("Right away");

    rerender(
      <Direction.Provider dir="ltr">
        <DateTimePicker
          value={EVENING}
          onChange={vi.fn()}
          placeholder="Right away"
          labels={LABELS}
          locale="en"
        />
      </Direction.Provider>,
    );
    const label = screen.getByRole("button").textContent ?? "";
    expect(label).toContain("18:30");
    expect(label).not.toContain("Right away");
  });

  it("is never a native date input, which is the whole reason it exists", () => {
    mount(
      <DateTimePicker
        value={null}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
      />,
    );
    expect(document.querySelector('input[type="date"]')).toBeNull();
    expect(document.querySelector('input[type="time"]')).toBeNull();
  });

  it("rolls the date with the store's clock past midnight", () => {
    mount(
      <DateTimePicker
        value={new Date("2026-08-13T21:05:00Z")}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    expect(screen.getByRole("button").textContent).toBe("Aug 14, 2026 · 00:05");
  });

  it("selects the store's day on the grid, not the runner's", () => {
    mount(
      <DateTimePicker
        value={new Date("2026-08-13T21:05:00Z")}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(day("2026-08-14").dataset.selectedSingle).toBe("true");
    expect(day("2026-08-13").dataset.selectedSingle).not.toBe("true");
  });

  it("lets the caller name another zone", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
        timeZone="America/New_York"
      />,
    );
    expect(screen.getByRole("button").textContent).toBe("Aug 13, 2026 · 11:30");
  });
});

describe("picking a day", () => {
  it("hands back the instant of that day on the store's clock, not UTC's", () => {
    const onChange = vi.fn();
    mount(
      <DateTimePicker
        value={MORNING}
        onChange={onChange}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(day("2026-08-13"));
    const picked = onChange.mock.calls[0]?.[0] as Date;
    expect(picked.toISOString()).toBe("2026-08-13T06:00:00.000Z");
  });

  it("keeps the clock reading already on the value", () => {
    const onChange = vi.fn();
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={onChange}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(day("2026-08-14"));
    const picked = onChange.mock.calls[0]?.[0] as Date;
    expect(picked.toISOString()).toBe("2026-08-14T15:30:00.000Z");
  });

  describe("with a min", () => {
    const MIN = new Date("2026-08-13T15:32:00Z");

    it("disables the days before min's day", () => {
      mount(
        <DateTimePicker
          value={EVENING}
          onChange={vi.fn()}
          placeholder="Pick"
          labels={LABELS}
          locale="en"
          min={MIN}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(day("2026-08-12").hasAttribute("disabled")).toBe(true);
      expect(day("2026-08-13").hasAttribute("disabled")).toBe(false);
    });

    it("moves a pick that falls before min up to the first step after it", () => {
      const onChange = vi.fn();
      mount(
        <DateTimePicker
          value={MORNING}
          onChange={onChange}
          placeholder="Pick"
          labels={LABELS}
          locale="en"
          min={MIN}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(day("2026-08-13"));
      const picked = onChange.mock.calls[0]?.[0] as Date;
      expect(picked.toISOString()).toBe("2026-08-13T15:35:00.000Z");
    });
  });

  describe("into an empty field", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-08-13T06:00:00Z"));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("takes the default time on the store's clock", () => {
      const onChange = vi.fn();
      mount(
        <DateTimePicker
          value={null}
          onChange={onChange}
          placeholder="Never"
          labels={LABELS}
          locale="en"
          defaultTime={{ hours: 23, minutes: 59 }}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(day("2026-08-13"));
      const picked = onChange.mock.calls[0]?.[0] as Date;
      expect(picked.toISOString()).toBe("2026-08-13T20:59:00.000Z");
    });

    it("marks today on the store's calendar, not the machine's", () => {
      vi.setSystemTime(new Date("2026-08-13T22:30:00Z"));
      mount(
        <DateTimePicker
          value={null}
          onChange={vi.fn()}
          placeholder="Never"
          labels={LABELS}
          locale="en"
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(day("2026-08-14").closest("td")?.dataset.today).toBe("true");
      expect(day("2026-08-13").closest("td")?.dataset.today).toBeUndefined();
    });

    it("follows a zone whose offset changes, to the instant the wall clock names", () => {
      vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
      const onChange = vi.fn();
      mount(
        <DateTimePicker
          value={null}
          onChange={onChange}
          placeholder="Never"
          labels={LABELS}
          locale="en"
          timeZone="America/New_York"
          defaultTime={{ hours: 3, minutes: 30 }}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(day("2026-03-08"));
      const picked = onChange.mock.calls[0]?.[0] as Date;
      expect(picked.toISOString()).toBe("2026-03-08T07:30:00.000Z");
    });
  });
});

describe("the time row", () => {
  it("reads the store's clock in the hour and minute selects", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    const text = (slot: string): string | null | undefined =>
      document.querySelector(`[data-slot="${slot}"]`)?.textContent;
    expect(text("date-time-picker-hour")).toBe("18");
    expect(text("date-time-picker-minute")).toBe("30");
  });

  it("writes a new hour back as an instant on the store's clock", () => {
    const onChange = vi.fn();
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={onChange}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-time-picker-hour"]',
      ) as HTMLElement,
    );
    fireEvent.click(screen.getByRole("option", { name: "20" }));
    const picked = onChange.mock.calls[0]?.[0] as Date;
    expect(picked.toISOString()).toBe("2026-08-13T17:30:00.000Z");
  });

  it("offers hour and minute selects, never a browser time popup", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    expect(
      document.querySelector('[data-slot="date-time-picker-hour"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="date-time-picker-minute"]'),
    ).not.toBeNull();
    expect(document.querySelector('input[type="time"]')).toBeNull();
  });

  it("is absent on the date-only picker", () => {
    mount(
      <DatePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    expect(
      document.querySelector('[data-slot="date-time-picker-hour"]'),
    ).toBeNull();
  });
});

describe("Arabic and RTL", () => {
  it("mirrors the grid from the Direction provider, not a prop", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="متى يبدأ"
        labels={LABELS}
        locale="ar"
      />,
      "rtl",
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    const root = document.querySelector('[data-slot="calendar"]');
    expect(root?.getAttribute("dir")).toBe("rtl");
  });

  it("starts the Saudi week on Sunday and names the days in Arabic", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="متى يبدأ"
        labels={LABELS}
        locale="ar"
      />,
      "rtl",
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    const heads = [...document.querySelectorAll("thead th")].map(
      (th) => th.textContent ?? "",
    );
    expect(heads[0]).toBe("أحد");
    expect(heads).toHaveLength(7);
  });

  it("renders day numbers and the trigger in Western digits in Arabic too", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="متى يبدأ"
        labels={LABELS}
        locale="ar"
      />,
      "rtl",
    );
    const trigger = screen.getAllByRole("button")[0] as HTMLElement;
    expect(trigger.textContent).toMatch(/13/);
    expect(trigger.textContent).not.toMatch(/[٠-٩]/);
    fireEvent.click(trigger);
    expect(day("2026-08-13").textContent).toBe("13");
  });

  it.each(["ar", "ar-SA"])(
    "reads the Gregorian date on the store's clock for %s",
    (locale) => {
      mount(
        <DateTimePicker
          value={EVENING}
          onChange={vi.fn()}
          placeholder="متى يبدأ"
          labels={LABELS}
          locale={locale}
        />,
        "rtl",
      );
      const text = screen.getAllByRole("button")[0]?.textContent ?? "";
      expect(text).toBe("13‏/08‏/2026 · 18:30");
      expect(text).not.toContain("1448");
    },
  );

  it.each(["ar", "ar-SA", "en"])(
    "hands Intl a tag that names the Gregorian calendar for %s",
    (locale) => {
      const RealDateTimeFormat = Intl.DateTimeFormat;
      const tags: string[] = [];
      const formats = vi
        .spyOn(Intl, "DateTimeFormat")
        .mockImplementation(function (
          locales?: Intl.LocalesArgument,
          options?: Intl.DateTimeFormatOptions,
        ): Intl.DateTimeFormat {
          if (options?.dateStyle === "medium") {
            tags.push(String(locales));
          }
          return new RealDateTimeFormat(locales, options);
        } as typeof Intl.DateTimeFormat);
      try {
        mount(
          <DateTimePicker
            value={EVENING}
            onChange={vi.fn()}
            placeholder="Right away"
            labels={LABELS}
            locale={locale}
          />,
        );
        expect(tags).not.toHaveLength(0);
        for (const tag of tags) {
          expect(new Intl.Locale(tag).calendar).toBe("gregory");
        }
      } finally {
        formats.mockRestore();
      }
    },
  );

  it("is not what the Umm al-Qura calendar would print", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="متى يبدأ"
        labels={LABELS}
        locale="ar"
      />,
      "rtl",
    );
    const ummAlQura = new Intl.DateTimeFormat(
      "ar-SA-u-ca-islamic-umalqura-nu-latn",
      { dateStyle: "medium", timeZone: "Asia/Riyadh" },
    ).format(EVENING);
    expect(screen.getAllByRole("button")[0]?.textContent).not.toContain(
      ummAlQura,
    );
  });

  it("keeps Western digits in English", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="Right away"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    expect(day("2026-08-13").textContent).toBe("13");
  });

  it("flips the nav chevrons, which point the way the month moves", () => {
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={vi.fn()}
        placeholder="متى يبدأ"
        labels={LABELS}
        locale="ar"
      />,
      "rtl",
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);

    const chevron = document.querySelector('nav svg[data-slot="icon"]');
    expect(chevron?.getAttribute("class")).toContain("rtl:-scale-x-100");
  });
});

describe("clearing", () => {
  it("empties the field", () => {
    const onChange = vi.fn();
    mount(
      <DateTimePicker
        value={EVENING}
        onChange={onChange}
        placeholder="Never"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("offers nothing to clear while the field is already empty", () => {
    mount(
      <DateTimePicker
        value={null}
        onChange={vi.fn()}
        placeholder="Never"
        labels={LABELS}
        locale="en"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });
});

describe("a selected day under the pointer", () => {
  const hover = (state: string): string =>
    `data-[${state}=true]:hover:bg-primary-hover`;
  const month = new Date(2026, 7, 1);

  it("keeps the single selected day on the primary hover fill", () => {
    mount(
      <Calendar
        mode="single"
        selected={new Date(2026, 7, 13)}
        defaultMonth={month}
        locale="en"
      />,
    );
    expect(day("2026-08-13").className).toContain(hover("selected-single"));
  });

  it("does the same for the start and the end of a range", () => {
    mount(
      <Calendar
        mode="range"
        selected={{
          from: new Date(2026, 7, 10),
          to: new Date(2026, 7, 14),
        }}
        defaultMonth={month}
        locale="en"
      />,
    );
    expect(day("2026-08-10").className).toContain(hover("range-start"));
    expect(day("2026-08-14").className).toContain(hover("range-end"));
  });
});
