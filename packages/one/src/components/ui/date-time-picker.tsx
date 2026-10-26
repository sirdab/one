"use client";

import * as React from "react";

import { STORE_TIME_ZONE, westernLocale } from "@sirdab/one/foundation";

import { cn } from "../../lib/utils";
import { CalendarIcon } from "../icons/system";
import { Button } from "./button";
import { Calendar, type CalendarProps } from "./calendar";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

/* The Sirdab date picker, and the date-and-time picker built on it.

   Shape: a secondary Button trigger that reads the formatted value, a
   Popover holding the Calendar, and (for DateTimePicker) an hour and a
   minute Select under the grid. Nothing here is a native control, which is
   the point: <input type="date"> and <input type="time"> both summon the
   browser's own popup, and that popup is unstylable, wears system fonts,
   and paints a blue selection chip that belongs to no design system.

   WHY TWO SELECTS FOR THE TIME, and not a masked text field: a Select is
   already ours, already keyboard-operable (type-ahead, arrows, Home/End,
   Escape), already announced correctly, and cannot be typed into wrongly,
   so there is no parse error to design a message for. A masked field would
   need its own digit normalization (Saudi keyboards emit Arabic-Indic),
   its own caret choreography, and its own invalid state, to buy a merchant
   nothing they cannot get in two keystrokes here.

   `min` keeps a pick from the past (a scheduled publish): days before its
   day are disabled in the grid, hours and minutes before it on that day
   are disabled in the selects, and a day picked with a clock reading that
   falls before it moves up to the first step at or after it.

   Minutes step by five, which is the granularity a promo is ever set at.
   A value already stored off that grid (23:59, the last minute of a day)
   is injected as its own option rather than rounded away, so a stored
   value round-trips through this control unchanged.

   Dates are ZONED. The merchant picks on a calendar and a clock in the
   store's timezone, so the Date handed back is the instant that wall-clock
   reading names there, and the trigger, the grid's day and the hour and
   minute selects all read it back on the same zone. Not UTC, which opened a
   Riyadh discount three hours late (SAI-778), and not the browser's or the
   server's either: the server renders the trigger first and runs on UTC, so
   a trigger in the machine's zone hydrates with a different hour. The zone
   is a prop, the foundation's STORE_TIME_ZONE by default (FMT-01).
   The zone math is ours: react-day-picker's `timeZone` prop is experimental.

   The calendar is always Gregorian. The grid is, and Chromium resolves a
   bare ar-SA to Umm al-Qura, so the trigger carries `ca-gregory` in its tag
   or an Arabic trigger would say "30 صفر 1448 هـ" above a Gregorian month.

   i18n-free, like every primitive: the caller passes `labels` and
   `placeholder`. `locale` is a BCP-47 tag and drives formatting and
   numerals only; direction comes from the Radix Direction provider. */

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
};

/** `instant` on `timeZone`'s wall clock. */
function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((candidate) => candidate.type === type)?.value);
  return {
    year: part("year"),
    month: part("month"),
    day: part("day"),
    hours: part("hour"),
    minutes: part("minute"),
  };
}

function offsetMs(instant: Date, timeZone: string): number {
  const wall = zonedParts(instant, timeZone);
  const minute = Math.floor(instant.getTime() / 60_000) * 60_000;
  return (
    Date.UTC(wall.year, wall.month - 1, wall.day, wall.hours, wall.minutes) -
    minute
  );
}

/** The instant at which `timeZone`'s wall clock reads `wall`. The offset is
    only known at an instant, so it is read at the wall time taken as UTC and
    again at the first answer: one pass lands wrong in the hour a zone's
    offset changes, two do not. */
function zonedInstant(wall: ZonedParts, timeZone: string): Date {
  const asUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hours,
    wall.minutes,
  );
  const first = asUtc - offsetMs(new Date(asUtc), timeZone);
  return new Date(asUtc - offsetMs(new Date(first), timeZone));
}

/** react-day-picker reads and hands back the browser's local midnight of a
    cell; its date parts are the only thing it means. */
function gridDay(wall: ZonedParts): Date {
  return new Date(wall.year, wall.month - 1, wall.day);
}

function gregorianTag(locale: string | undefined): string {
  return new Intl.Locale(westernLocale(locale ?? "en"), {
    calendar: "gregory",
  }).toString();
}

/** Labels the picker cannot invent for itself. */
export type DateTimePickerLabels = {
  /** Heads the time row, e.g. "Time". */
  time: string;
  /** Accessible name of the hour Select. */
  hour: string;
  /** Accessible name of the minute Select. */
  minute: string;
  /** The button that empties the field, e.g. "Clear". */
  clear: string;
};

const MINUTE_STEP = 5;
const HOURS: number[] = Array.from({ length: 24 }, (_, index) => index);

type TimeOfDay = { hours: number; minutes: number };

/* Two-digit, Western in every locale (foundation/numerals.ts). Intl with
   westernLocale() rather than formatValue(), because this package speaks
   BCP-47 tags while foundation's Locale is a three-locale union. */
function twoDigit(value: number, locale: string | undefined): string {
  return new Intl.NumberFormat(westernLocale(locale ?? "en"), {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}

function minuteOptions(current: number): number[] {
  const grid: number[] = [];
  for (let minute = 0; minute < 60; minute += MINUTE_STEP) grid.push(minute);
  return grid.includes(current)
    ? grid
    : [...grid, current].sort((a, b) => a - b);
}

/** The first instant on the minute grid at or after `min`. */
function firstStepFrom(min: Date): Date {
  const step = MINUTE_STEP * 60_000;
  return new Date(Math.ceil(min.getTime() / step) * step);
}

/** `instant`, or the first step at or after `min` when it falls before it. */
function notBefore(instant: Date, min: Date | undefined): Date {
  return min && instant.getTime() < min.getTime()
    ? firstStepFrom(min)
    : instant;
}

/** The instant `time` names on the store's calendar day `day`, a grid cell. */
function onGridDay(day: Date, time: TimeOfDay, timeZone: string): Date {
  return zonedInstant(
    {
      year: day.getFullYear(),
      month: day.getMonth() + 1,
      day: day.getDate(),
      ...time,
    },
    timeZone,
  );
}

function TimeRow({
  value,
  onChange,
  locale,
  timeZone,
  labels,
  disabled,
  min,
}: {
  value: Date;
  onChange: (next: Date) => void;
  locale: string | undefined;
  timeZone: string;
  labels: DateTimePickerLabels;
  disabled: boolean | undefined;
  min: Date | undefined;
}): React.JSX.Element {
  const wall = zonedParts(value, timeZone);
  const { hours, minutes } = wall;
  /* On min's own day, the hours and minutes before it cannot be picked. */
  const floor = min ? zonedParts(min, timeZone) : null;
  const sameDay =
    floor !== null &&
    floor.year === wall.year &&
    floor.month === wall.month &&
    floor.day === wall.day;
  const hourBefore = (hour: number): boolean =>
    sameDay && floor !== null && hour < floor.hours;
  const minuteBefore = (minute: number): boolean =>
    sameDay &&
    floor !== null &&
    (hours < floor.hours || (hours === floor.hours && minute < floor.minutes));

  return (
    <div className="border-border flex items-center gap-2 border-t px-3 py-2.5">
      <span className="text-body-quiet text-muted-foreground">
        {labels.time}
      </span>
      {/* The clock reads hour:minute in both directions. Latin digits
                or Arabic-Indic, a time is never mirrored, so the row is
                pinned LTR while the page around it stays RTL. */}
      <div className="ms-auto flex items-center gap-1.5" dir="ltr">
        <Select
          value={String(hours)}
          disabled={disabled}
          onValueChange={(next) =>
            onChange(
              notBefore(
                zonedInstant({ ...wall, hours: Number(next) }, timeZone),
                min,
              ),
            )
          }
        >
          <SelectTrigger
            size="sm"
            aria-label={labels.hour}
            data-slot="date-time-picker-hour"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOURS.map((hour) => (
              <SelectItem
                key={hour}
                value={String(hour)}
                disabled={hourBefore(hour)}
              >
                {twoDigit(hour, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span aria-hidden className="text-body text-muted-foreground">
          :
        </span>
        <Select
          value={String(minutes)}
          disabled={disabled}
          onValueChange={(next) =>
            onChange(zonedInstant({ ...wall, minutes: Number(next) }, timeZone))
          }
        >
          <SelectTrigger
            size="sm"
            aria-label={labels.minute}
            data-slot="date-time-picker-minute"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions(minutes).map((minute) => (
              <SelectItem
                key={minute}
                value={String(minute)}
                disabled={minuteBefore(minute)}
              >
                {twoDigit(minute, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

type PickerProps = {
  value: Date | null;
  onChange: (next: Date | null) => void;
  /** BCP-47 tag; drives month names, weekday order and numerals. */
  locale?: string;
  /** What the trigger reads while the field is empty. */
  placeholder: string;
  labels: DateTimePickerLabels;
  /** Clock reading given to a date picked into an empty field. A window's
        start defaults to 00:00 and its end to 23:59, so a merchant who only
        cares about days never has to think about the time at all. */
  defaultTime?: TimeOfDay;
  /** IANA zone the value is read and written in: its wall clock is what
        the trigger, the grid's day and the hour and minute selects show, and
        what a pick means. Defaults to Riyadh. */
  timeZone?: string;
  /** The earliest instant a pick may name (a scheduled publish passes
        now): earlier days, hours and minutes are disabled. */
  min?: Date;
  /** Month and year dropdowns make distant dates such as birthdays reachable. */
  captionLayout?: CalendarProps["captionLayout"];
  id?: string;
  className?: string;
  disabled?: boolean;
  "aria-labelledby"?: string;
};

function Picker({
  value,
  onChange,
  locale,
  placeholder,
  labels,
  defaultTime = { hours: 0, minutes: 0 },
  timeZone = STORE_TIME_ZONE,
  min,
  captionLayout,
  id,
  className,
  disabled,
  showTime,
  "aria-labelledby": ariaLabelledBy,
}: PickerProps & { showTime: boolean }): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  const formatted = React.useMemo(() => {
    if (!value) return null;
    const tag = gregorianTag(locale);
    const date = new Intl.DateTimeFormat(tag, {
      dateStyle: "medium",
      timeZone,
    }).format(value);
    if (!showTime) return date;
    /* hourCycle: "h23" names the cycle the hour select uses (00 to 23),
           in Arabic and English alike. */
    const time = new Intl.DateTimeFormat(tag, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(value);
    return `${date} · ${time}`;
  }, [value, locale, showTime, timeZone]);

  const wall = value ? zonedParts(value, timeZone) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="secondary"
          size="xl"
          disabled={disabled}
          aria-labelledby={ariaLabelledBy}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span
            className={cn(
              "truncate",
              formatted === null && "text-muted-foreground",
            )}
          >
            {formatted ?? placeholder}
          </span>
          <Icon icon={CalendarIcon} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout={captionLayout}
          locale={locale}
          selected={wall ? gridDay(wall) : undefined}
          defaultMonth={wall ? gridDay(wall) : undefined}
          today={gridDay(zonedParts(new Date(), timeZone))}
          disabled={
            min ? { before: gridDay(zonedParts(min, timeZone)) } : undefined
          }
          autoFocus
          onSelect={(day) => {
            if (!day) {
              onChange(null);
              return;
            }
            /* A day click must not move the clock: keep the time
                           already on the value, and only fall back to the
                           default when the field was empty. */
            onChange(
              notBefore(
                onGridDay(
                  day,
                  wall
                    ? {
                        hours: wall.hours,
                        minutes: wall.minutes,
                      }
                    : defaultTime,
                  timeZone,
                ),
                min,
              ),
            );
            if (!showTime) setOpen(false);
          }}
        />
        {showTime && value ? (
          <TimeRow
            value={value}
            onChange={onChange}
            locale={locale}
            timeZone={timeZone}
            labels={labels}
            disabled={disabled}
            min={min}
          />
        ) : null}
        {value ? (
          <div className="border-border flex justify-end border-t px-3 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {labels.clear}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

/** Date only. The popover closes on the pick, because the pick is the
    whole interaction. */
function DatePicker(props: PickerProps): React.JSX.Element {
  return <Picker {...props} showTime={false} />;
}

/** Date and clock reading. The popover STAYS open after a day is picked:
    the time row below it is the second half of the answer, and closing
    would hide it the moment it became reachable. */
function DateTimePicker(props: PickerProps): React.JSX.Element {
  return <Picker {...props} showTime />;
}

export { DatePicker, DateTimePicker };
