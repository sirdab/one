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

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
};

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

function gridDay(wall: ZonedParts): Date {
  return new Date(wall.year, wall.month - 1, wall.day);
}

function gregorianTag(locale: string | undefined): string {
  return new Intl.Locale(westernLocale(locale ?? "en"), {
    calendar: "gregory",
  }).toString();
}

export type DateTimePickerLabels = {
  time: string;

  hour: string;

  minute: string;

  clear: string;
};

const MINUTE_STEP = 5;
const HOURS: number[] = Array.from({ length: 24 }, (_, index) => index);

type TimeOfDay = { hours: number; minutes: number };

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

function firstStepFrom(min: Date): Date {
  const step = MINUTE_STEP * 60_000;
  return new Date(Math.ceil(min.getTime() / step) * step);
}

function notBefore(instant: Date, min: Date | undefined): Date {
  return min && instant.getTime() < min.getTime()
    ? firstStepFrom(min)
    : instant;
}

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

  locale?: string;

  placeholder: string;
  labels: DateTimePickerLabels;

  defaultTime?: TimeOfDay;

  timeZone?: string;

  min?: Date;

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

function DatePicker(props: PickerProps): React.JSX.Element {
  return <Picker {...props} showTime={false} />;
}

function DateTimePicker(props: PickerProps): React.JSX.Element {
  return <Picker {...props} showTime />;
}

export { DatePicker, DateTimePicker };
