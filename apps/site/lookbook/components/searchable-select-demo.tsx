"use client";

import { useState } from "react";

import { CheckIcon, ChevronDownIcon } from "@sirdab/one/icons/catalogue";
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

export function SearchableSelectDemo({
  items,
  placeholder,
  searchPlaceholder,
  empty,
}: {
  items: Item[];
  placeholder: string;
  searchPlaceholder: string;
  empty: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const selected = items.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="xl"
          role="combobox"
          aria-expanded={open}
          className="group/cbx max-w-64 justify-between"
        >
          <span className={cn(!selected && "text-subtle")}>
            {selected?.label ?? placeholder}
          </span>
          <span
            aria-hidden
            className="icon-quiet group-hover/cbx:icon-quiet-hover group-data-[state=open]/cbx:icon-quiet-hover flex size-4 shrink-0 rotate-0 items-center justify-center transition-transform group-data-[state=open]/cbx:rotate-180"
          >
            <Icon icon={ChevronDownIcon} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{empty}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => {
                    setValue(item.value);
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
}
