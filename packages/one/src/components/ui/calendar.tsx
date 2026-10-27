"use client";

import * as React from "react";
import { arSA, enUS, fr, tr } from "date-fns/locale";
import { Direction } from "radix-ui";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Numerals,
} from "react-day-picker";

import { cn } from "../../lib/utils";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../icons/catalogue";
import { Button, buttonVariants } from "./button";
import { Icon } from "./icon";

const LOCALES: Record<string, typeof enUS> = { ar: arSA, en: enUS, fr, tr };

const NUMERALS: Numerals = "latn";

function resolveLocale(locale: string | undefined): typeof enUS {
  const base = (locale ?? "en").split("-")[0] ?? "en";
  return LOCALES[base] ?? enUS;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type CalendarProps = DistributiveOmit<
  React.ComponentProps<typeof DayPicker>,
  "locale" | "dir"
> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];

  locale?: string;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: CalendarProps): React.JSX.Element {
  const defaultClassNames = getDefaultClassNames();
  const dir = Direction.useDirection();
  const dateLocale = resolveLocale(locale);

  return (
    <DayPicker
      dir={dir}
      locale={dateLocale}
      numerals={NUMERALS}
      showOutsideDays={showOutsideDays}
      className={cn("group/calendar p-3", className)}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(dateLocale.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-control w-full items-center justify-center px-8",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-control w-full items-center justify-center gap-1.5 text-label",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-lg border border-btn-border",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "select-none",
          captionLayout === "label"
            ? "text-label"
            : "flex items-center gap-1 rounded-lg px-2 text-label [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-lg text-caption text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-8 select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "text-caption text-muted-foreground select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-e-lg",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-s-lg"
            : "[&:first-child[data-selected=true]_button]:rounded-s-lg",
          defaultClassNames.day,
        ),
        range_start: cn(
          "rounded-s-lg bg-gray-alpha-100",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "rounded-e-lg bg-gray-alpha-100",
          defaultClassNames.range_end,
        ),
        today: cn(
          "rounded-lg bg-gray-alpha-100 text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootClassName, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(rootClassName)}
            {...rootProps}
          />
        ),
        Chevron: ({
          className: chevronClassName,
          orientation,
          ...chevronProps
        }) => {
          if (orientation === "left") {
            return (
              <Icon
                icon={ChevronLeftIcon}
                flip
                className={cn("size-4", chevronClassName)}
                {...chevronProps}
              />
            );
          }
          if (orientation === "right") {
            return (
              <Icon
                icon={ChevronRightIcon}
                flip
                className={cn("size-4", chevronClassName)}
                {...chevronProps}
              />
            );
          }
          return (
            <Icon
              icon={ChevronDownIcon}
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekProps }) => (
          <td {...weekProps}>
            <div className="flex size-8 items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>): React.JSX.Element {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={isoDay(day.date)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:hover:bg-primary-hover data-[range-middle=true]:bg-gray-alpha-100 data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:hover:bg-primary-hover data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:hover:bg-primary-hover flex aspect-square size-auto w-full min-w-8 flex-col gap-1 leading-none font-normal data-[range-end=true]:rounded-e-lg data-[range-middle=true]:rounded-none data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-s-lg",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
