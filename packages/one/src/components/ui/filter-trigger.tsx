"use client";

import * as React from "react";

import { formatValue, type Locale as NumeralLocale } from "@sirdab/one/foundation";

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

/* The Sirdab filter trigger (the 40px member of the filter chip family):
   a multi-value, searchable, clearable filter over a frosted Popover +
   Command panel. A FILTER NARROWS A VIEW; it is not a Select (a select
   sets ONE form value and never clears). Different ARIA too: the trigger
   announces aria-haspopup="dialog". The panel is a filter dialog, not a
   listbox.

   Chrome is the chip ladder at the xl rung: bg-transparent with a
   STATIC alpha-200 border (the border
   NEVER steps, unlike secondary Button's 200→300) and the ghost fills
   answer interaction instead (hover alpha-100, active/open alpha-200).
   rounded-xl, h-control-xl, 20px leading icon, text-body label, trailing
   chevron ms-1 at opacity-50 rotating 180 while open. Colours run the
   chips' 200ms tier, not the controls' 75. The label rests at inherited
   foreground like FilterChip, not the chip Button variant's muted
   [decision: family over variant].

   APPLIED STATE: the resting chrome holds, no inversion (that is the
   small tier's move), no ring. The state reads from the applied-values
   slot: the first selection's label (+N in tabular figures for the
   rest, 8px off and in the quiet tier so it never reads as the label's
   suffix) animating in behind the family divider (border-border here,
   not FilterChipSelect's gray-700: that step is tuned for the small
   chip's inverted ink, and on this never-inverting surface the plain
   hairline is the right weight), and the leading slot swapping to the
   clear X.

   The clear paths are FilterChipSelect's, one tier up: the X is
   pointer-only and DECORATIVE to assistive tech (a nested role inside
   role=button would be flattened out of the tree anyway); keyboards
   clear with Delete/Backspace on the focused trigger, or reselect an
   applied item to toggle it off. clearLabel names the sr-only hint. The
   trigger is a div[role=button] (not <button>) so the X can own its
   pointer events; Enter/Space forward to click.

   Panel rows toggle WITHOUT closing (multi) with a leading checkbox-style
   check: an always-reserved 16px box before the label fading by opacity,
   so checking can never shift the row's text.

   Usage:
       <FilterTrigger
           label="التصنيف"
           icon={<Icon icon={Tag} />}
           items={categories}
           values={applied}
           onValuesChange={setApplied}
           searchPlaceholder="ابحث…"
           empty="ما فيه نتائج."
           clearLabel="مسح"
           numeralLocale="ar-SA"
       />
*/
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
  /** The filter's own name ("التصنيف"), always visible. */
  label: string;
  items: FilterTriggerItem[];
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  /** 20px leading icon (`<Icon icon={Tag} />`): a rendered node, not
        a component, so server pages can pass it across the client
        boundary. The clear X takes its place while applied. */
  icon?: React.ReactNode;
  /** Provide to render the search row; omit for a plain list. */
  searchPlaceholder?: string;
  empty: string;
  clearLabel?: string;
  /** What this filter narrows the view to, rendered inline under the
        trigger. The label names the filter; the hint says what applying
        it does. */
  hint?: React.ReactNode;
  /** The "+N" count goes through formatValue (numerals.ts rule):
        Western digits in every locale; pass "ar-SA" under Arabic for its
        grouping. */
  numeralLocale?: NumeralLocale;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string[]>(defaultValues);
  const values = valuesProp ?? internal;
  // Selection order, not items order: the first PICK anchors the
  // applied slot, so later picks only bump the count.
  const applied = values
    .map((value) => items.find((item) => item.value === value))
    .filter((item): item is FilterTriggerItem => item != null);
  const first = applied.length > 0 ? applied[0] : null;
  const extra = applied.length - 1;
  /* What the reveal shows. A clear keeps the last applied value inside it
       so the collapse carries it out instead of an empty box; React's
       "adjust state on prop change" form, not an effect, so it never paints
       a frame behind. */
  const [shown, setShown] = React.useState<{
    label: string;
    extra: number;
  } | null>(first ? { label: first.label, extra } : null);
  /* The reveal's width before an anchor or count change lands, read while
       the DOM still shows the old value (see the layout effect below). */
  const revealRef = React.useRef<HTMLDivElement>(null);
  const fromWidth = React.useRef<number | null>(null);
  if (first && (first.label !== shown?.label || extra !== shown.extra)) {
    const reveal = revealRef.current;
    if (reveal?.hasAttribute("data-open")) {
      fromWidth.current = reveal.getBoundingClientRect().width;
    }
    setShown({ label: first.label, extra });
  }
  /* "Paid" to "Paid +1", or another first pick, while a value is applied:
       the grid reveal only handles none to applied, so this change would
       snap. Ease the width from the old to the new, measured; nothing on
       first paint, on open or close, or under reduced motion. */
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
            /* Pointer-only clear affordance (aria-hidden, no
                           role): keyboards clear via Delete/Backspace or
                           reselect (see onKeyDown above). clearLabel
                           names the sr-only hint in the values slot. */
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
          {/* One reveal, always mounted: none to applied runs the
                        width open and a clear runs it shut with the old
                        value still inside (FilterChipSelect's shape). A
                        change of anchor or count eases the width itself. */}
          <div
            ref={revealRef}
            data-open={first ? "" : undefined}
            aria-hidden={first ? undefined : true}
            className="reveal-inline h-full duration-200"
          >
            <div className="flex h-full items-stretch">
              {/* border-border, NOT FilterChipSelect's
                                gray-700: that step reads quiet on the
                                small chip's INVERTED ink. This trigger
                                never inverts, so on the plain surface
                                it needs the plain hairline [Sirdab
                                2026-07-28: gray-700 here was too dark]. */}
              <span
                data-slot="filter-trigger-values"
                className="border-border ms-2 flex h-full max-w-48 items-center border-s ps-2"
              >
                <span className="truncate">{shown?.label}</span>
                {shown && shown.extra > 0 ? (
                  /* dir=ltr pins the sign BEFORE the
                                       digits in RTL prose too (CLDR's
                                       order). 8px (the divider's own
                                       ps-2) and the quiet tier keep it
                                       from reading as a suffix of an
                                       Arabic word: «ملابس +2», never
                                       «ملابس2+». */
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
          {/* opacity-50, rotating 180 while open at the chip
                        family's 200ms. No hover step on this rung; rest
                        opacity only. */}
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
                  {/* Leading checkbox-style check: an
                                        always-reserved box fading by
                                        opacity. Checking never shifts
                                        the label. */}
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
  // Inline, attached to the trigger, never a floating tooltip: the
  // hint belongs to this one filter, so it renders with it.
  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      {trigger}
      <span className="text-caption-quiet text-subtle">{hint}</span>
    </span>
  );
}

export { FilterTrigger };
