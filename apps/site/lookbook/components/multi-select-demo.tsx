"use client";

import { useState } from "react";

import { formatValue } from "@sirdab/one/foundation";

import { CheckIcon, ChevronDownIcon } from "@sirdab/one/icons/catalogue";
import { CloseIcon } from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@sirdab/one/components/command";
import { Icon } from "@sirdab/one/components/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sirdab/one/components/popover";
import { cn } from "@sirdab/one/lib/utils";

type Item = { value: string; label: string };

export function MultiSelectDemo({
  items,
  placeholder,
  searchPlaceholder,
  empty,
  clearLabel,
  pairTemplate,
  moreTemplate,
  locale,
}: {
  items: Item[];
  placeholder: string;
  searchPlaceholder: string;
  empty: string;
  clearLabel: string;

  pairTemplate: string;

  moreTemplate: string;
  locale: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ReadonlySet<string>>(new Set());
  const applied = items.filter((item) => values.has(item.value));

  const summary = (): string => {
    if (applied.length === 1) return applied[0].label;
    if (applied.length === 2)
      return pairTemplate
        .replace("{a}", applied[0].label)
        .replace("{b}", applied[1].label);
    return moreTemplate
      .replace("{a}", applied[0].label)
      .replace(
        "{n}",
        formatValue(applied.length - 1, locale === "ar" ? "ar-SA" : "en-US"),
      );
  };

  const toggle = (value: string): void => {
    setValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="xl"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "group/msel max-w-72 justify-between",
            applied.length > 0 &&
              "border-ring bg-btn-surface-hover ring-input-focus hover:bg-btn-surface-active",
          )}
        >
          {applied.length > 0 ? (
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="-ms-1.5 me-0.5 shrink-0"
            >
              <span
                role="button"
                tabIndex={0}
                aria-label={clearLabel}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setValues(new Set());
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.stopPropagation();
                    event.preventDefault();
                    setValues(new Set());
                  }
                }}
              >
                <Icon icon={CloseIcon} className="size-3.5" />
              </span>
            </Button>
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-start",
              applied.length === 0 && "text-subtle",
            )}
          >
            {applied.length > 0 ? summary() : placeholder}
          </span>
          <span
            aria-hidden
            className="icon-quiet group-hover/msel:icon-quiet-hover group-data-[state=open]/msel:icon-quiet-hover flex size-4 shrink-0 rotate-0 items-center justify-center transition-transform group-data-[state=open]/msel:rotate-180"
          >
            <Icon icon={ChevronDownIcon} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{empty}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => toggle(item.value)}
                >
                  {item.label}
                  <Icon
                    icon={CheckIcon}
                    className={cn(
                      "ms-auto size-4",
                      values.has(item.value) ? "opacity-100" : "opacity-0",
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
}
