"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Direction } from "radix-ui";

import { type Locale as NumeralLocale } from "@sirdab/one/foundation";
import { CalendarIcon } from "../icons/system";

import {
  dateFormatter,
  formatDay,
  formatDayRange,
  parseTime,
  splitDateTime,
  todayIn,
  toUtc,
  type CalendarDate,
  type ClockTime,
} from "../../lib/calendar-date";
import {
  restoreTriggerFocus,
  trackFocusModality,
} from "../../lib/restore-trigger-focus";
import { cn } from "../../lib/utils";
import { Button, type buttonVariants } from "./button";
import type {
  DatePickerPanelProps,
  DatePickerPanelSelection,
} from "./date-picker-panel";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { selectTriggerChrome, type SelectTriggerVariant } from "./select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  useInsideSheet,
} from "./sheet";

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export type DatePickerLabels = {
  placeholder: string;
  previousMonth: string;
  nextMonth: string;
  close: string;
  clear?: string;
  done?: string;
  hour?: string;
  minute?: string;
  title?: string;
};

type CommonProps = {
  id?: string;
  labels: DatePickerLabels;
  min?: string;
  max?: string;
  timeZone?: string;
  numeralLocale?: NumeralLocale;
  weekStartsOn?: number;
  clearable?: boolean;
  variant?: SelectTriggerVariant;
  size?: ButtonSize;
  disabled?: boolean;
  invalid?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export type DatePickerProps = CommonProps & {
  value: string;
  onValueChange: (value: string) => void;
};

export type DateTimePickerProps = Omit<CommonProps, "labels"> & {
  labels: DatePickerLabels & { done: string; hour: string; minute: string };
  value: string;
  onValueChange: (value: string) => void;
  defaultTime?: ClockTime;
  minuteStep?: number;
};

export type DateRange = { from: string; to: string };

export type DateRangePickerProps = CommonProps & {
  value: DateRange;
  onValueChange: (value: DateRange) => void;
};

const DatePickerPanel = React.lazy(() => import("./date-picker-panel"));

const NARROW_QUERY = "(max-width: 639px)";

function subscribeNarrow(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(NARROW_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useNarrowViewport(): boolean {
  return React.useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}

type PanelInput = Omit<
  DatePickerPanelProps,
  "today" | "locale" | "dir" | "weekStartsOn" | "labels" | "min" | "max"
>;

type ShellProps = CommonProps & {
  display: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  panel: (close: () => void) => PanelInput;
};

function PickerShell({
  id,
  labels,
  min,
  max,
  timeZone,
  numeralLocale = "en-US",
  weekStartsOn = 0,
  variant = "secondary",
  size = "xl",
  disabled,
  invalid,
  className,
  display,
  open,
  setOpen,
  panel,
  ref,
  ...props
}: ShellProps): React.JSX.Element {
  trackFocusModality();
  const dir = Direction.useDirection();
  const narrow = useNarrowViewport();
  const insideSheet = useInsideSheet();
  const contentId = React.useId();
  const close = (): void => setOpen(false);

  const trigger = (
    <button
      ref={ref}
      type="button"
      id={id}
      role="combobox"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={props["aria-required"] ? true : undefined}
      aria-invalid={invalid ? true : undefined}
      data-slot="date-picker-trigger"
      data-placeholder={display == null ? "" : undefined}
      disabled={disabled}
      onKeyDown={(event) => {
        if (open) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
        }
      }}
      className={cn(
        selectTriggerChrome({ variant, size, chevron: true, closed: false }),
        "group/date-picker-trigger",
        className,
      )}
    >
      <span dir="auto" className="tabular min-w-0 flex-1 truncate">
        {display ?? labels.placeholder}
      </span>
      <span
        aria-hidden
        className="flex size-4 shrink-0 items-center justify-center opacity-50 group-hover/date-picker-trigger:opacity-70 group-data-[state=open]/date-picker-trigger:opacity-70"
      >
        <Icon icon={CalendarIcon} />
      </span>
    </button>
  );

  const body = open ? (
    <React.Suspense fallback={<div aria-hidden className="h-72 w-72" />}>
      <DatePickerPanel
        {...panel(close)}
        min={min?.slice(0, 10)}
        max={max?.slice(0, 10)}
        today={todayIn(timeZone)}
        locale={numeralLocale}
        dir={dir === "rtl" ? "rtl" : "ltr"}
        weekStartsOn={weekStartsOn}
        labels={labels}
      />
    </React.Suspense>
  ) : null;

  if (narrow) {
    return (
      <Sheet
        side="bottom"
        open={open}
        onOpenChange={setOpen}
        noBodyStyles={insideSheet}
      >
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent id={contentId} aria-describedby={undefined} dir={dir}>
          <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
            <SheetTitle className="min-w-0 truncate">
              {labels.title ?? labels.placeholder}
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="xl">
                {labels.close}
              </Button>
            </SheetClose>
          </div>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        id={contentId}
        dir={dir}
        aria-labelledby={props["aria-labelledby"]}
        aria-label={
          props["aria-labelledby"] != null
            ? undefined
            : (labels.title ?? props["aria-label"] ?? labels.placeholder)
        }
        align="start"
        sideOffset={4}
        collisionPadding={8}
        className="w-auto p-0"
        onCloseAutoFocus={restoreTriggerFocus}
      >
        {body}
      </PopoverContent>
    </Popover>
  );
}

function useOpen(
  props: Pick<CommonProps, "open" | "onOpenChange" | "disabled">,
): [boolean, (open: boolean) => void] {
  const [state, setState] = React.useState(false);
  const open = props.open ?? state;
  const setOpen = (next: boolean): void => {
    if (next && props.disabled) return;
    setState(next);
    props.onOpenChange?.(next);
  };
  return [open, setOpen];
}

function PanelFooter({
  clear,
  done,
}: {
  clear?: { label: string; onClick: () => void };
  done?: { label: string; onClick: () => void };
}): React.JSX.Element | null {
  if (clear == null && done == null) return null;
  return (
    <div
      data-slot="date-picker-footer"
      className="flex items-center justify-between gap-2 border-t border-border pt-2"
    >
      {clear != null ? (
        <Button type="button" variant="ghost" size="sm" onClick={clear.onClick}>
          {clear.label}
        </Button>
      ) : (
        <span />
      )}
      {done != null ? (
        <Button type="button" size="sm" onClick={done.onClick}>
          {done.label}
        </Button>
      ) : null}
    </div>
  );
}

function DatePicker({
  value,
  onValueChange,
  ...props
}: DatePickerProps): React.JSX.Element {
  const [open, setOpen] = useOpen(props);
  const locale = props.numeralLocale ?? "en-US";
  const picked = toUtc(value) != null ? value.slice(0, 10) : null;
  return (
    <PickerShell
      {...props}
      open={open}
      setOpen={setOpen}
      display={picked == null ? null : formatDay(picked, locale)}
      panel={(close) => ({
        selection: { kind: "single", value: picked },
        onPick: (date) => {
          onValueChange(date);
          close();
        },
        footer: (
          <PanelFooter
            clear={
              props.clearable && props.labels.clear != null && picked != null
                ? {
                    label: props.labels.clear,
                    onClick: () => {
                      onValueChange("");
                      close();
                    },
                  }
                : undefined
            }
          />
        ),
      })}
    />
  );
}

function DateTimePicker({
  value,
  onValueChange,
  defaultTime = "09:00",
  minuteStep = 15,
  ...props
}: DateTimePickerProps): React.JSX.Element {
  const [open, setOpen] = useOpen(props);
  const locale = props.numeralLocale ?? "en-US";
  const { date, time } = splitDateTime(value);
  const day = toUtc(date);
  const clock = parseTime(time);
  const at =
    day == null || clock == null
      ? null
      : new Date(day.getTime() + (clock.hour * 60 + clock.minute) * 60_000);
  const display =
    at == null
      ? null
      : dateFormatter(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(at);
  const emit = (nextDate: CalendarDate, nextTime: ClockTime): void =>
    onValueChange(`${nextDate}T${nextTime}`);
  return (
    <PickerShell
      {...props}
      open={open}
      setOpen={setOpen}
      display={display}
      panel={(close) => ({
        selection: { kind: "single", value: date },
        onPick: (day) => emit(day, time ?? defaultTime),
        time: {
          value: time,
          onChange: (next) => emit(date ?? todayIn(props.timeZone), next),
          minuteStep,
          labels: { hour: props.labels.hour, minute: props.labels.minute },
        },
        footer: (
          <PanelFooter
            clear={
              props.clearable && props.labels.clear != null && date != null
                ? {
                    label: props.labels.clear,
                    onClick: () => {
                      onValueChange("");
                      close();
                    },
                  }
                : undefined
            }
            done={{ label: props.labels.done, onClick: close }}
          />
        ),
      })}
    />
  );
}

function DateRangePicker({
  value,
  onValueChange,
  ...props
}: DateRangePickerProps): React.JSX.Element {
  const [open, setOpenState] = useOpen(props);
  const locale = props.numeralLocale ?? "en-US";
  const [start, setStart] = React.useState<CalendarDate | null>(null);
  const setOpen = (next: boolean): void => {
    if (!next) setStart(null);
    setOpenState(next);
  };
  const from = toUtc(value.from) != null ? value.from.slice(0, 10) : null;
  const to = toUtc(value.to) != null ? value.to.slice(0, 10) : null;
  const display =
    from != null && to != null
      ? formatDayRange(from, to, locale)
      : from != null
        ? formatDay(from, locale)
        : to != null
          ? formatDay(to, locale)
          : null;
  const selection: DatePickerPanelSelection =
    start != null
      ? { kind: "range", from: start, to: null }
      : { kind: "range", from, to };
  return (
    <PickerShell
      {...props}
      open={open}
      setOpen={setOpen}
      display={display}
      panel={(close) => ({
        selection,
        onPick: (day) => {
          if (start == null) {
            setStart(day);
            return;
          }
          onValueChange(
            day < start ? { from: day, to: start } : { from: start, to: day },
          );
          setStart(null);
          close();
        },
        footer: (
          <PanelFooter
            clear={
              props.clearable &&
              props.labels.clear != null &&
              (from != null || to != null)
                ? {
                    label: props.labels.clear,
                    onClick: () => {
                      onValueChange({ from: "", to: "" });
                      setStart(null);
                      close();
                    },
                  }
                : undefined
            }
          />
        ),
      })}
    />
  );
}

export { DatePicker, DateRangePicker, DateTimePicker };
