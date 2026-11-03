"use client";

import * as React from "react";

import {
  addDays,
  addMonths,
  clampDate,
  dateFormatter,
  formatTime,
  monthGrid,
  parseTime,
  startOfMonth,
  startOfWeek,
  toUtc,
  type CalendarDate,
  type ClockTime,
} from "../../lib/calendar-date";
import { cn } from "../../lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/catalogue";
import { Button } from "./button";
import { Icon } from "./icon";

export type DatePickerPanelLabels = {
  previousMonth: string;
  nextMonth: string;
};

export type DatePickerPanelSelection =
  | { kind: "single"; value: CalendarDate | null }
  | { kind: "range"; from: CalendarDate | null; to: CalendarDate | null };

export type DatePickerPanelProps = {
  selection: DatePickerPanelSelection;
  min?: CalendarDate;
  max?: CalendarDate;
  today: CalendarDate;
  locale: string;
  dir: "ltr" | "rtl";
  weekStartsOn: number;
  labels: DatePickerPanelLabels;
  onPick: (date: CalendarDate) => void;
  time?: {
    value: ClockTime | null;
    onChange: (time: ClockTime) => void;
    minuteStep: number;
    labels: { hour: string; minute: string };
  };
  footer?: React.ReactNode;
};

function inBounds(
  date: CalendarDate,
  min: CalendarDate | undefined,
  max: CalendarDate | undefined,
): boolean {
  return (min == null || date >= min) && (max == null || date <= max);
}

function useFocusWhen(
  ref: React.RefObject<HTMLElement | null>,
  key: string,
  enabled: boolean,
): void {
  React.useEffect(() => {
    if (enabled) ref.current?.focus();
  }, [ref, key, enabled]);
}

function Calendar({
  selection,
  min,
  max,
  today,
  locale,
  dir,
  weekStartsOn,
  labels,
  onPick,
}: Omit<DatePickerPanelProps, "time" | "footer">): React.JSX.Element {
  const captionId = React.useId();
  const anchor =
    selection.kind === "single"
      ? selection.value
      : (selection.from ?? selection.to);
  const [focused, setFocused] = React.useState<CalendarDate>(() =>
    clampDate(anchor ?? today, min, max),
  );
  const [month, setMonth] = React.useState<CalendarDate>(() =>
    startOfMonth(focused),
  );
  const activeRef = React.useRef<HTMLButtonElement>(null);
  const [focusDay, setFocusDay] = React.useState(true);
  useFocusWhen(activeRef, focused, focusDay);

  const shown = startOfMonth(focused) === month ? focused : null;
  const tabStop = shown ?? clampDate(month, min, max);

  const moveTo = (next: CalendarDate): void => {
    setFocused(next);
    setMonth(startOfMonth(next));
    setFocusDay(true);
  };
  const turnMonth = (step: number): void => {
    const next = addMonths(month, step);
    setMonth(next);
    setFocused(clampDate(addMonths(focused, step), min, max));
    setFocusDay(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    const ahead = dir === "rtl" ? -1 : 1;
    let next: CalendarDate | null = null;
    switch (event.key) {
      case "ArrowRight":
        next = addDays(tabStop, ahead);
        break;
      case "ArrowLeft":
        next = addDays(tabStop, -ahead);
        break;
      case "ArrowDown":
        next = addDays(tabStop, 7);
        break;
      case "ArrowUp":
        next = addDays(tabStop, -7);
        break;
      case "Home":
        next = startOfWeek(tabStop, weekStartsOn);
        break;
      case "End":
        next = addDays(startOfWeek(tabStop, weekStartsOn), 6);
        break;
      case "PageUp":
        next = addMonths(tabStop, event.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        next = addMonths(tabStop, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    moveTo(next);
  };

  const monthName = dateFormatter(locale, {
    month: "long",
    year: "numeric",
  }).format(toUtc(month) ?? new Date());
  const dayNumber = dateFormatter(locale, { day: "numeric" });
  const dayName = dateFormatter(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const weekdayShort = dateFormatter(locale, { weekday: "narrow" });
  const weekdayLong = dateFormatter(locale, { weekday: "long" });
  const weeks = monthGrid(month, weekStartsOn);

  const isSelected = (date: CalendarDate): boolean =>
    selection.kind === "single"
      ? selection.value === date
      : selection.from === date || selection.to === date;
  const isBetween = (date: CalendarDate): boolean =>
    selection.kind === "range" &&
    selection.from != null &&
    selection.to != null &&
    date > selection.from &&
    date < selection.to;

  const prevDisabled = min != null && addDays(month, -1) < min;
  const nextDisabled = max != null && addMonths(month, 1) > max;

  return (
    <div data-slot="calendar" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.previousMonth}
          disabled={prevDisabled}
          onClick={() => turnMonth(-1)}
        >
          <Icon icon={ChevronLeftIcon} flip />
        </Button>
        <span
          id={captionId}
          aria-live="polite"
          data-slot="calendar-caption"
          className="text-label"
        >
          {monthName}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.nextMonth}
          disabled={nextDisabled}
          onClick={() => turnMonth(1)}
        >
          <Icon icon={ChevronRightIcon} flip />
        </Button>
      </div>
      <table
        role="grid"
        aria-labelledby={captionId}
        dir={dir}
        className="border-collapse"
      >
        <thead>
          <tr>
            {weeks[0]!.map((date) => {
              const at = toUtc(date) ?? new Date();
              return (
                <th
                  key={date}
                  scope="col"
                  abbr={weekdayLong.format(at)}
                  className="h-6 text-caption-quiet text-subtle"
                >
                  {weekdayShort.format(at)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((date) => {
                const outside = startOfMonth(date) !== month;
                const disabled = !inBounds(date, min, max);
                const selected = isSelected(date);
                const between = isBetween(date);
                const at = toUtc(date) ?? new Date();
                return (
                  <td
                    key={date}
                    role="gridcell"
                    aria-selected={selected}
                    className="p-0"
                  >
                    <button
                      ref={date === tabStop ? activeRef : undefined}
                      type="button"
                      data-slot="calendar-day"
                      data-date={date}
                      data-outside={outside ? "" : undefined}
                      data-in-range={between ? "" : undefined}
                      tabIndex={date === tabStop ? 0 : -1}
                      aria-label={dayName.format(at)}
                      aria-current={date === today ? "date" : undefined}
                      aria-disabled={disabled ? true : undefined}
                      onKeyDown={onKeyDown}
                      onFocus={() => {
                        if (date !== focused) setFocused(date);
                      }}
                      onClick={() => {
                        if (disabled) return;
                        moveTo(date);
                        onPick(date);
                      }}
                      className={cn(
                        "tabular flex size-8 items-center justify-center rounded-lg text-body transition-colors duration-75 sm:size-9",
                        "hover:bg-btn-ghost-surface-hover active:bg-btn-ghost-surface-active",
                        outside && "text-subtle",
                        date === today && "font-medium text-brand",
                        between &&
                          "bg-brand-subtle text-brand-subtle-foreground",
                        selected &&
                          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
                        disabled &&
                          "cursor-not-allowed text-subtle opacity-50 hover:bg-transparent active:bg-transparent",
                      )}
                    >
                      {dayNumber.format(at)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimeList({
  label,
  options,
  value,
  format,
  onPick,
}: {
  label: string;
  options: number[];
  value: number | null;
  format: (n: number) => string;
  onPick: (n: number) => void;
}): React.JSX.Element {
  const listRef = React.useRef<HTMLDivElement>(null);
  const active = value ?? options[0]!;

  React.useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    if (row != null && typeof row.scrollIntoView === "function") {
      row.scrollIntoView({ block: "center" });
    }
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    const index = options.indexOf(active);
    let next: number | undefined;
    if (event.key === "ArrowDown") next = options[index + 1];
    else if (event.key === "ArrowUp") next = options[index - 1];
    else if (event.key === "Home") next = options[0];
    else if (event.key === "End") next = options[options.length - 1];
    else return;
    event.preventDefault();
    if (next === undefined) return;
    onPick(next);
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-value="${next}"]`,
    );
    row?.focus();
  };

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      data-slot="time-list"
      className="flex h-54 w-12 flex-col gap-0.5 overflow-y-auto sm:h-60"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="option"
          data-value={option}
          aria-selected={option === value}
          tabIndex={option === active ? 0 : -1}
          onKeyDown={onKeyDown}
          onClick={() => onPick(option)}
          className={cn(
            "tabular flex h-8 shrink-0 items-center justify-center rounded-lg text-body transition-colors duration-75",
            "hover:bg-btn-ghost-surface-hover active:bg-btn-ghost-surface-active",
            option === value &&
              "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
          )}
        >
          {format(option)}
        </button>
      ))}
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function TimeLists({
  value,
  onChange,
  minuteStep,
  labels,
  locale,
}: NonNullable<DatePickerPanelProps["time"]> & {
  locale: string;
}): React.JSX.Element {
  const parsed = parseTime(value);
  const minutes = Array.from(
    new Set([
      ...Array.from(
        { length: Math.ceil(60 / minuteStep) },
        (_, index) => index * minuteStep,
      ),
      ...(parsed != null ? [parsed.minute] : []),
    ]),
  ).sort((a, b) => a - b);
  const two = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return (
    <div
      data-slot="time-lists"
      dir="ltr"
      className="flex gap-1 border-s border-border ps-2"
    >
      <TimeList
        label={labels.hour}
        options={HOURS}
        value={parsed?.hour ?? null}
        format={(hour) => two.format(hour)}
        onPick={(hour) => onChange(formatTime(hour, parsed?.minute ?? 0))}
      />
      <TimeList
        label={labels.minute}
        options={minutes}
        value={parsed?.minute ?? null}
        format={(minute) => two.format(minute)}
        onPick={(minute) => onChange(formatTime(parsed?.hour ?? 0, minute))}
      />
    </div>
  );
}

function DatePickerPanel({
  time,
  footer,
  ...calendar
}: DatePickerPanelProps): React.JSX.Element {
  return (
    <div data-slot="date-picker-panel" className="flex flex-col gap-2 p-3">
      <div className="flex justify-center gap-2">
        <Calendar {...calendar} />
        {time != null ? <TimeLists {...time} locale={calendar.locale} /> : null}
      </div>
      {footer}
    </div>
  );
}

export { DatePickerPanel };
export default DatePickerPanel;
