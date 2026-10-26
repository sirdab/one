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

/* Below md the panel is a bottom tray, not a popover floating mid-page where
   a thumb cannot reach it. The gate is read when the panel opens, not tracked:
   a phone does not become a desktop while a picker is open. */
const TRAY_QUERY = "(width < 48rem)";

/* The search earns its place past this many options; fewer and it is a
   keyboard in the way of a list that already fits. A create row needs the
   field to type the name into, so onCreate always shows it. */
const SEARCH_FROM = 12;

/* The Sirdab combobox: a searchable dropdown that picks SEVERAL options (a
   product's sections, a discount's products). The composition the command
   header prescribes (Popover + Command), named once so no form assembles it
   by hand.

   The trigger is the select trigger's FIELD (the default select: the Input's
   border, hover, ink focus ring and 12px corner at 40, read from the same
   field-chrome.ts, and the chevron that turns on open) and reads the picked
   labels, comma-joined and clipped to one line, or the placeholder. The
   panel matches the trigger's width. Picking toggles an option and keeps the panel open:
   several picks are one visit. Every row leads with a checkbox mark and a
   picked row's label goes a weight up, so what is in reads at a glance.

   Filtering is ours, not cmdk's: a case-insensitive "contains" on the label,
   because the create row has to know whether anything matched. With
   `onCreate`, the panel always ends in an add row: `addLabel` while the
   search is empty (picking it puts the cursor in the search, where the name
   gets typed), and "Add “…”" once the search holds a name no option already
   has (Enter picks it). The caller creates the record and passes it back in
   `options` and `value`. While it runs the row spins and nothing else can be
   created. With no options at all and nothing typed, `emptyLabel` shows.

   `groups` heads sets of options ("Gulf", "Others"); an option in no group
   follows the grouped ones with no heading. `fixed` values are in the
   selection for good: they lead the trigger's summary but are never rows, so
   they cannot be unpicked (Saudi Arabia on a shipping group).

   Below md the panel is a bottom tray on the house Sheet, titled from `title`
   (else the aria-label, else the placeholder). A row toggles and keeps it
   open, like the popover, so several picks are one visit; the scrim, a drag
   or Escape closes it, and there is no Done button.

   Strings arrive from the caller: a primitive takes no copy of its own.

   Usage:
       <Combobox
           options={sections.map((s) => ({ value: s.id, label: s.title }))}
           value={ids}
           onValueChange={setIds}
           placeholder={t("placeholder")}
           searchPlaceholder={t("search")}
           emptyLabel={t("empty")}
           addLabel={t("add")}
           createLabel={(query) => t("create", { name: query })}
           onCreate={async (name) => { const id = await make(name); … }}
       />
*/
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
  /** The trigger's text when nothing is picked. */
  placeholder: string;
  searchPlaceholder: string;
  /** Shown in the panel when a search matches nothing and nothing can be
        created, or when there are no options at all. */
  emptyLabel: string;
  /** The add row's text while nothing new is typed; without it the add
        row waits for a name. */
  addLabel?: string;
  /** The add row's text for the current search. Needed with onCreate. */
  createLabel?: (query: string) => string;
  /** Creates a record from the search. Resolve once it is in `options`
        (and, if it should be, in `value`); reject or return to keep the
        panel as it was. */
  onCreate?: (query: string) => Promise<void>;
  /** Headed sets of options, by value. Options in none go last, unheaded. */
  groups?: readonly ComboboxGroup[];
  /** Values that are always selected: in the summary, never a row. */
  fixed?: readonly string[];
  /** The tray's heading below md. Defaults to the aria-label, then the placeholder. */
  title?: string;
  disabled?: boolean;
  /** The trigger's id, for a <Label htmlFor>. */
  id?: string;
  /** LAYOUT only, on the trigger (w-full in a form column). */
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
  /* First occurrence wins: a caller merging a refreshed list with records
       it just created can briefly hold the same option twice. */
  const unique = options.filter(
    (option, index) =>
      options.findIndex((o) => o.value === option.value) === index,
  );
  /* Fixed values are not choices: they never reach the rows. */
  const choices = unique.filter((option) => !pinned.has(option.value));
  const needle = query.trim().toLocaleLowerCase();
  const visible = needle
    ? choices.filter((option) =>
        option.label.toLocaleLowerCase().includes(needle),
      )
    : choices;
  const showSearch = onCreate != null || choices.length > SEARCH_FROM;
  const sections = sectionsOf(visible, groups);
  /* A name that is already an option is picked, not made twice. Without
       an addLabel the add row only appears once there is a name to add. */
  const canCreate =
    onCreate != null &&
    createLabel != null &&
    needle !== "" &&
    !unique.some((option) => option.label.toLocaleLowerCase() === needle);
  const showAdd = canCreate || (onCreate != null && addLabel != null);

  /* The picked labels in the reading direction's own list comma: "،" in
       Arabic, "," otherwise, in the order they were picked. */
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
          /* In tray mode the Popover is held shut, so Radix would
                       report the trigger collapsed under an open sheet. */
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
          {/* The select trigger's chevron: 50% at rest, 70% on hover
                    and open, a half turn on open over 200ms ease-out. */}
          <span
            aria-hidden
            className="flex size-4 shrink-0 items-center justify-center opacity-50 transition-transform duration-200 ease-out group-hover/combobox-trigger:opacity-70 group-data-[state=open]/combobox-trigger:rotate-180 group-data-[state=open]/combobox-trigger:opacity-70 motion-reduce:transition-none"
          >
            <Icon icon={ChevronDownIcon} className="size-4" />
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          /* The trigger's width, measured: a structural value, so it
                   lives in style (as Select's content does). */
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

/* The rows by heading: each group's options in the order the group lists
   them, the unheaded rest last. A heading with nothing visible is dropped. */
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
