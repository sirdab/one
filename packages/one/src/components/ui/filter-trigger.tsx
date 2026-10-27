"use client";

import * as React from "react";

import {
  formatValue,
  type Locale as NumeralLocale,
} from "@sirdab/one/foundation";

import { cn } from "../../lib/utils";
import { CheckIcon, ChevronDownIcon } from "../icons/catalogue";
import { CloseIcon } from "../icons/shell";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type FilterTriggerItem = { value: string; label: string };

function FilterTrigger({
  label,
  items,
  values: valuesProp,
  defaultValues = [],
  onValuesChange,
  icon,
  searchPlaceholder,
  empty,
  clearLabel = "Clear",
  hint,
  numeralLocale = "en-US",
  className,
}: {
  label: string;
  items: FilterTriggerItem[];
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;

  icon?: React.ReactNode;

  searchPlaceholder?: string;
  empty: string;
  clearLabel?: string;

  hint?: React.ReactNode;

  numeralLocale?: NumeralLocale;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string[]>(defaultValues);
  const values = valuesProp ?? internal;

  const applied = values
    .map((value) => items.find((item) => item.value === value))
    .filter((item): item is FilterTriggerItem => item != null);
  const first = applied.length > 0 ? applied[0] : null;
  const extra = applied.length - 1;

  const [shown, setShown] = React.useState<{
    label: string;
    extra: number;
  } | null>(first ? { label: first.label, extra } : null);

  const revealRef = React.useRef<HTMLDivElement>(null);
  const fromWidth = React.useRef<number | null>(null);
  if (first && (first.label !== shown?.label || extra !== shown.extra)) {
    const reveal = revealRef.current;
    if (reveal?.hasAttribute("data-open")) {
      fromWidth.current = reveal.getBoundingClientRect().width;
    }
    setShown({ label: first.label, extra });
  }

  React.useLayoutEffect(() => {
    const reveal = revealRef.current;
    const from = fromWidth.current;
    fromWidth.current = null;
    if (reveal === null || from === null || from <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const to = reveal.getBoundingClientRect().width;
    if (to <= 0 || to === from) return;
    reveal.style.transition = "none";
    reveal.style.width = `${from}px`;
    reveal.getBoundingClientRect();
    reveal.style.transition = "width 200ms var(--ease-out)";
    reveal.style.width = `${to}px`;
    reveal.setAttribute("data-resizing", "");
    const finish = (): void => {
      reveal.style.transition = "";
      reveal.style.width = "";
      reveal.removeAttribute("data-resizing");
      reveal.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
    const onEnd = (event: Event): void => {
      const property = (event as TransitionEvent).propertyName;
      if (event.target === reveal && (!property || property === "width")) {
        finish();
      }
    };
    const timer = window.setTimeout(finish, 300);
    reveal.addEventListener("transitionend", onEnd);
    return finish;
  }, [shown?.label, shown?.extra]);
  const set = (next: string[]): void => {
    setInternal(next);
    onValuesChange?.(next);
  };
  const toggle = (value: string): void => {
    set(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );
  };

  const trigger = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          data-slot="filter-trigger"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.currentTarget.click();
            }
            if (
              applied.length > 0 &&
              (event.key === "Delete" || event.key === "Backspace")
            ) {
              event.preventDefault();
              set([]);
            }
          }}
          className={cn(
            "group/filter-trigger h-control-xl border-btn-border text-body hover:bg-btn-ghost-surface-hover active:bg-btn-ghost-surface-active data-[state=open]:bg-btn-ghost-surface-active flex w-fit max-w-full cursor-pointer items-center rounded-xl border bg-transparent px-3 whitespace-nowrap transition-colors duration-200 select-none",
            className,
          )}
        >
          {first != null ? (
            <span
              aria-hidden
              data-slot="filter-trigger-clear"
              className="-ms-0.5 me-1.5 flex size-5 shrink-0 items-center justify-center"
              onPointerDown={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
              onClick={(event) => {
                event.stopPropagation();
                set([]);
              }}
            >
              <Icon
                icon={CloseIcon}
                className="icon-quiet group-hover/filter-trigger:icon-quiet-hover size-4"
              />
            </span>
          ) : icon != null ? (
            <span
              aria-hidden
              data-slot="filter-trigger-icon"
              className="icon-quiet group-hover/filter-trigger:icon-quiet-hover -ms-0.5 me-1.5 flex size-5 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-5"
            >
              {icon}
            </span>
          ) : null}
          <span className="min-w-0 truncate">{label}</span>

          <div
            ref={revealRef}
            data-open={first ? "" : undefined}
            aria-hidden={first ? undefined : true}
            className="reveal-inline h-full duration-200"
          >
            <div className="flex h-full items-stretch">
              <span
                data-slot="filter-trigger-values"
                className="border-border ms-2 flex h-full max-w-48 items-center border-s ps-2"
              >
                <span className="truncate">{shown?.label}</span>
                {shown && shown.extra > 0 ? (
                  <span
                    dir="ltr"
                    className="tabular text-muted-foreground ms-2 shrink-0"
                  >
                    {formatValue(shown.extra, numeralLocale, {
                      signDisplay: "always",
                    })}
                  </span>
                ) : null}
                <span className="sr-only">{clearLabel}</span>
              </span>
            </div>
          </div>

          <span
            aria-hidden
            data-slot="filter-trigger-chevron"
            className="ms-1 flex size-4 shrink-0 rotate-0 items-center justify-center opacity-50 transition-transform duration-200 group-data-[state=open]/filter-trigger:rotate-180"
          >
            <Icon icon={ChevronDownIcon} className="size-4" />
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 duration-100">
        <Command>
          {searchPlaceholder != null ? (
            <CommandInput placeholder={searchPlaceholder} />
          ) : null}
          <CommandList>
            <CommandEmpty>{empty}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => toggle(item.value)}
                >
                  <span
                    data-slot="filter-trigger-check"
                    className="flex size-4 shrink-0 items-center justify-center"
                  >
                    <Icon
                      icon={CheckIcon}
                      className={cn(
                        "size-4",
                        values.includes(item.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </span>
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (hint == null) return trigger;

  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      {trigger}
      <span className="text-caption-quiet text-subtle">{hint}</span>
    </span>
  );
}

export { FilterTrigger };
