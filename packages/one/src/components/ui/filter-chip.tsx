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

/* The Sirdab filter chip, a toggle at the smallest rung: a
   24px (control-xs) caption chip, bordered on the background at rest with
   the secondary wash ladder, INVERTING to full ink when pressed (label
   goes background-on-foreground, hover lightens through the high alpha
   rungs 800→700). The leading plus rotates 45° into an X as it presses:
   one glyph, two meanings, 200ms. Chips run the 200ms colour tier, not
   the controls' 75.

   A div[role=button] WRAPPING a real remove button is invalid nesting
   (the pattern this replaces); since pressing the chip and pressing the
   X are the same action for a toggle, ours is a single real <button
   aria-pressed> (Radix Toggle) with the icon purely visual.

   The applied-value slot (the animated reveal behind a divider) belongs
   to the popover-opening filter chips, FilterTrigger's job; this is
   only the self-contained toggle.

   Not to be confused with Button's `chip` VARIANT: that one is quiet
   picker-trigger chrome (muted label, ghost fills, the 100ms tier) for
   Select triggers; this is the stateful filter TOGGLE (inverts to ink,
   200ms). Same word, two jobs.

   Usage:
       <FilterChip pressed={video} onPressedChange={setVideo}>فيديو</FilterChip>
*/
function FilterChip({
  className,
  children,
  hint,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & {
  /** What this filter narrows the view to, rendered inline under the
        chip. The label is a noun; the hint is what applying it does. */
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
  // Inline, attached to the chip, never a floating tooltip: the hint
  // belongs to this one filter, so it renders with it.
  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      {chip}
      <span className="text-caption-quiet text-subtle">{hint}</span>
    </span>
  );
}

/* FilterChipSelect, the chip that OPENS: same 24px chip, but a popover
   trigger over a Command list.
   Unselected it reads EXACTLY like the toggle chip: plus + label, no
   chevron [decision: a small chip could carry one; ours drop it
   so the family looks uniform]. Picking a value INVERTS the chip to ink
   and the value animates in behind an h-full divider while the plus
   becomes an X that clears without opening. The X is DECORATIVE to
   assistive tech (a nested role would be flattened out of the tree by
   the outer button role anyway, the invalid nesting FilterChip's
   header describes); real clear paths: pointer on the X, Delete/Backspace on the
   focused chip, or reselecting the current item. Single-value; the
   multi filter is FilterTrigger's job. The trigger is a
   div[role=button] (not <button>) so the X can own its pointer events;
   Enter/Space forward to click. */
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
  /** The chip's own name ("التصنيف"), always visible. */
  label: string;
  items: FilterChipSelectItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Provide to render the search row; omit for a plain list. */
  searchPlaceholder?: string;
  empty: string;
  clearLabel?: string;
  /** What picking here does to the view, rendered inline under the
        chip. The chip names the filter; the hint says what it narrows. */
  hint?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : internal;
  const selected = items.find((item) => item.value === value) ?? null;
  /* The label stays after a clear so the collapse carries the old value out
       rather than an empty box; React's "adjust state on prop change" form,
       not an effect, so it never paints a frame behind. */
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
              : /* rest tone inherits (foreground), same as
                                 FilterChip */
                "border-btn-border hover:bg-btn-surface-hover active:bg-btn-surface-active bg-background",
            className,
          )}
        >
          {selected ? (
            /* Pointer-only clear affordance (aria-hidden, no
                           role): keyboards clear via Delete/Backspace or
                           reselect (see onKeyDown above). clearLabel
                           names the sr-only hint below. */
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
          {/* One reveal, always mounted: none to selected runs the
                        width open, a clear runs it shut with the old label
                        still inside. A change from one value to another snaps
                        to the new width; the open and close are what read as
                        motion. */}
          <div
            data-open={selected ? "" : undefined}
            aria-hidden={selected ? undefined : true}
            className="reveal-inline h-full duration-200"
          >
            <div className="flex h-full items-stretch">
              {/* gray-700: a raw ramp step on purpose. On the
                                inverted (ink) chip it reads as a quiet
                                mid-dark divider. */}
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
  // Inline, attached to the chip, never a floating tooltip: the hint
  // belongs to this one filter, so it renders with it.
  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      {chip}
      <span className="text-caption-quiet text-subtle">{hint}</span>
    </span>
  );
}

export { FilterChip, FilterChipSelect };
