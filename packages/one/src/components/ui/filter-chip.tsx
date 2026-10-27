"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { CheckIcon } from "../icons/catalogue";
import { PlusIcon } from "../icons/shell";
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

function FilterChip({
  className,
  children,
  hint,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & {
  hint?: React.ReactNode;
}) {
  const chip = (
    <TogglePrimitive.Root
      data-slot="filter-chip"
      className={cn(
        "group h-control-xs border-btn-border text-caption hover:bg-btn-surface-hover active:bg-btn-surface-active data-[state=on]:hover:bg-gray-alpha-800 data-[state=on]:active:bg-gray-alpha-700 flex max-w-full cursor-pointer items-center justify-center rounded-lg border bg-background px-1 whitespace-nowrap transition-colors duration-200 select-none data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
        className,
      )}
      {...props}
    >
      <span className="relative size-4 shrink-0 rounded-full">
        <Icon
          icon={PlusIcon}
          className="text-muted-foreground absolute inset-0.5 size-3 transition-transform duration-200 group-data-[state=on]:rotate-45 group-data-[state=on]:text-background"
        />
      </span>
      <span className="shrink-0 ps-0.5 pe-1">{children}</span>
    </TogglePrimitive.Root>
  );

  if (hint == null) return chip;

  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      {chip}
      <span className="text-caption-quiet text-subtle">{hint}</span>
    </span>
  );
}

type FilterChipSelectItem = { value: string; label: string };

function FilterChipSelect({
  label,
  items,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  searchPlaceholder,
  empty,
  clearLabel = "Clear",
  hint,
  className,
}: {
  label: string;
  items: FilterChipSelectItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;

  searchPlaceholder?: string;
  empty: string;
  clearLabel?: string;

  hint?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : internal;
  const selected = items.find((item) => item.value === value) ?? null;

  const [shownLabel, setShownLabel] = React.useState<string | null>(
    selected?.label ?? null,
  );
  if (selected && selected.label !== shownLabel) {
    setShownLabel(selected.label);
  }
  const set = (next: string | null): void => {
    setInternal(next);
    onValueChange?.(next);
  };

  const chip = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          data-slot="filter-chip-select"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.currentTarget.click();
            }
            if (
              selected &&
              (event.key === "Delete" || event.key === "Backspace")
            ) {
              event.preventDefault();
              set(null);
            }
          }}
          className={cn(
            "group h-control-xs text-caption flex w-fit max-w-full cursor-pointer items-center justify-center rounded-lg border px-1 whitespace-nowrap transition-colors duration-200 select-none",
            selected
              ? "hover:bg-gray-alpha-800 active:bg-gray-alpha-700 border-foreground bg-foreground text-background"
              : "border-btn-border hover:bg-btn-surface-hover active:bg-btn-surface-active bg-background",
            className,
          )}
        >
          {selected ? (
            <span
              aria-hidden
              data-slot="filter-chip-clear"
              className="relative size-4 shrink-0 rounded-full"
              onPointerDown={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
              onClick={(event) => {
                event.stopPropagation();
                set(null);
              }}
            >
              <Icon
                icon={PlusIcon}
                className="absolute inset-0.5 size-3 rotate-45 text-background transition-transform duration-200"
              />
            </span>
          ) : (
            <span className="relative size-4 shrink-0 rounded-full">
              <Icon
                icon={PlusIcon}
                className="text-muted-foreground absolute inset-0.5 size-3 rotate-0 transition-transform duration-200"
              />
            </span>
          )}
          <span className="shrink-0 ps-0.5 pe-1">{label}</span>

          <div
            data-open={selected ? "" : undefined}
            aria-hidden={selected ? undefined : true}
            className="reveal-inline h-full duration-200"
          >
            <div className="flex h-full items-stretch">
              <span className="ms-1 flex h-full max-w-48 items-center border-s border-gray-700 ps-2 pe-1">
                <span className="truncate">{shownLabel}</span>
                <span className="sr-only">{clearLabel}</span>
              </span>
            </div>
          </div>
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
                  onSelect={() => {
                    set(item.value === value ? null : item.value);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Icon
                    icon={CheckIcon}
                    className={cn(
                      "ms-auto size-4",
                      value === item.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (hint == null) return chip;

  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      {chip}
      <span className="text-caption-quiet text-subtle">{hint}</span>
    </span>
  );
}

export { FilterChip, FilterChipSelect };
