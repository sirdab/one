"use client";

import * as React from "react";
import { Direction } from "radix-ui";

import { cn } from "../../lib/utils";
import { ChevronDownIcon, PlusCircleIcon } from "../icons/catalogue";
import { CheckboxMark } from "./checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { FIELD_HEIGHT, FIELD_RADIUS, FIELD_TRIGGER } from "./field-chrome";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";
import { Spinner } from "./spinner";

const TRAY_QUERY = "(width < 48rem)";

const SEARCH_FROM = 12;

export type ComboboxOption = { value: string; label: string };
export type ComboboxGroup = { label: string; values: readonly string[] };

function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  addLabel,
  createLabel,
  onCreate,
  groups,
  fixed,
  title,
  disabled = false,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: {
  options: readonly ComboboxOption[];
  value: readonly string[];
  onValueChange: (next: string[]) => void;

  placeholder: string;
  searchPlaceholder: string;

  emptyLabel: string;

  addLabel?: string;

  createLabel?: (query: string) => string;

  onCreate?: (query: string) => Promise<void>;

  groups?: readonly ComboboxGroup[];

  fixed?: readonly string[];

  title?: string;
  disabled?: boolean;

  id?: string;

  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [tray, setTray] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const picked = new Set(value);
  const pinned = new Set(fixed);

  const unique = options.filter(
    (option, index) =>
      options.findIndex((o) => o.value === option.value) === index,
  );

  const choices = unique.filter((option) => !pinned.has(option.value));
  const needle = query.trim().toLocaleLowerCase();
  const visible = needle
    ? choices.filter((option) =>
        option.label.toLocaleLowerCase().includes(needle),
      )
    : choices;
  const showSearch = onCreate != null || choices.length > SEARCH_FROM;
  const sections = sectionsOf(visible, groups);

  const canCreate =
    onCreate != null &&
    createLabel != null &&
    needle !== "" &&
    !unique.some((option) => option.label.toLocaleLowerCase() === needle);
  const showAdd = canCreate || (onCreate != null && addLabel != null);

  const dir = Direction.useDirection();
  const summary = [...(fixed ?? []), ...value.filter((v) => !pinned.has(v))]
    .map((v) => options.find((option) => option.value === v)?.label)
    .filter((label): label is string => label != null)
    .join(dir === "rtl" ? "، " : ", ");

  function toggle(optionValue: string): void {
    onValueChange(
      picked.has(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  async function create(): Promise<void> {
    if (!onCreate || creating) return;
    setCreating(true);
    try {
      await onCreate(query.trim());
      setQuery("");
    } finally {
      setCreating(false);
    }
  }

  function changeOpen(next: boolean): void {
    if (next) {
      setTray(
        typeof window.matchMedia === "function" &&
          window.matchMedia(TRAY_QUERY).matches,
      );
    } else {
      setQuery("");
    }
    setOpen(next);
  }

  const panel = (
    <Command
      shouldFilter={false}
      className={tray ? "min-h-0 flex-1" : undefined}
    >
      {showSearch ? (
        <CommandInput
          ref={searchRef}
          value={query}
          onValueChange={setQuery}
          placeholder={searchPlaceholder}
        />
      ) : null}
      <CommandList
        className={tray ? "min-h-0 flex-1 pb-2" : undefined}
        style={tray ? { maxHeight: "none" } : undefined}
      >
        {visible.length === 0 && !canCreate ? (
          <CommandEmpty always={showAdd}>{emptyLabel}</CommandEmpty>
        ) : null}
        {sections.map((section) => (
          <CommandGroup
            key={section.label ?? "ungrouped"}
            heading={section.label}
          >
            {section.options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => toggle(option.value)}
                aria-checked={picked.has(option.value)}
                className={cn("aria-checked:font-medium", tray && "min-h-11")}
              >
                <CheckboxMark checked={picked.has(option.value)} />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {showAdd ? (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="combobox-add"
                disabled={creating}
                onSelect={() => {
                  if (canCreate) void create();
                  else searchRef.current?.focus();
                }}
                className={tray ? "min-h-11" : undefined}
              >
                {creating ? <Spinner /> : <Icon icon={PlusCircleIcon} />}
                <span className="min-w-0 flex-1 truncate">
                  {canCreate ? createLabel(query.trim()) : addLabel}
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </Command>
  );

  return (
    <>
      <Popover open={open && !tray} onOpenChange={changeOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}

          aria-expanded={open}
          data-slot="combobox-trigger"
          className={cn(
            FIELD_TRIGGER,
            FIELD_HEIGHT.default,
            FIELD_RADIUS.default,
            "group/combobox-trigger ps-3 pe-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span
            className={cn(
              "line-clamp-1 min-w-0 flex-1",
              summary === "" && "text-subtle",
            )}
          >
            {summary === "" ? placeholder : summary}
          </span>

          <span
            aria-hidden
            className="flex size-4 shrink-0 items-center justify-center opacity-50 transition-transform duration-200 ease-out group-hover/combobox-trigger:opacity-70 group-data-[state=open]/combobox-trigger:rotate-180 group-data-[state=open]/combobox-trigger:opacity-70 motion-reduce:transition-none"
          >
            <Icon icon={ChevronDownIcon} className="size-4" />
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"

          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          {tray ? null : panel}
        </PopoverContent>
      </Popover>
      <Sheet side="bottom" open={open && tray} onOpenChange={changeOpen}>
        <SheetContent aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>{title ?? ariaLabel ?? placeholder}</SheetTitle>
          </SheetHeader>
          {panel}
        </SheetContent>
      </Sheet>
    </>
  );
}

function sectionsOf(
  visible: readonly ComboboxOption[],
  groups: readonly ComboboxGroup[] | undefined,
): { label: string | undefined; options: ComboboxOption[] }[] {
  if (!groups || groups.length === 0) {
    return visible.length > 0
      ? [{ label: undefined, options: [...visible] }]
      : [];
  }
  const placed = new Set<string>();
  const out: { label: string | undefined; options: ComboboxOption[] }[] = [];
  for (const group of groups) {
    const options = group.values
      .map((v) => visible.find((option) => option.value === v))
      .filter((option): option is ComboboxOption => option != null);
    for (const option of options) placed.add(option.value);
    if (options.length > 0) out.push({ label: group.label, options });
  }
  const rest = visible.filter((option) => !placed.has(option.value));
  if (rest.length > 0) out.push({ label: undefined, options: rest });
  return out;
}

export { Combobox };
