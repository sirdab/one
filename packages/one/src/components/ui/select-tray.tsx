"use client";

import * as React from "react";

import { foldArabic } from "../../lib/arabic-fold";
import { BELOW_MD } from "../../lib/breakpoints";
import { restoreTriggerFocus } from "../../lib/restore-trigger-focus";
import { cn } from "../../lib/utils";
import { CheckIcon, SearchIcon } from "../icons/catalogue";
import { StatusNote } from "./badge";
import { Icon } from "./icon";
import { Input } from "./input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./sheet";

/* The tray a Select opens below md: the house Sheet at the bottom, titled with
   the field's label, a listbox of 44px rows, the chosen one marked with a
   check at the end. select.tsx decides when it opens (see its header); this
   file is what opens. It lives beside the primitive because the primitive is
   already long, and it imports nothing from select.tsx so the two cannot
   loop: the state they share is declared here.

   Rows are plain elements, not Radix items. Radix stays closed while the tray
   is up, so its own items sit in the closed fragment doing what they always
   did there (the SelectValue text, typeahead, the form's bubble input), and
   the tray renders the same children a second time through a context that
   turns SelectItem and its kin into rows. */

/** Past this many options the tray offers a search: about twelve 44px rows
    plus the title is what 80dvh holds on a phone. */
export const SEARCH_THRESHOLD = 12;

export interface SelectLabels {
  search: string;
  noMatches: string;
  clear: string;
  close: string;
}

const DEFAULT_LABELS: SelectLabels = {
  search: "Search",
  noMatches: "Nothing by that name.",
  clear: "Clear",
  close: "Close",
};

const SelectLabelsContext = React.createContext<SelectLabels>(DEFAULT_LABELS);

/** The tray's four strings, set once at an app's root like the dialog's close
    label: the primitive takes none of its own, so an Arabic app never says
    "Search" in English. */
export function SelectLabelsProvider({
  labels,
  children,
}: {
  labels: SelectLabels;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <SelectLabelsContext.Provider value={labels}>
      {children}
    </SelectLabelsContext.Provider>
  );
}

export interface TrayState {
  open: boolean;
  title: string;
  /** Bumped on every open, so the body remounts with an empty query. */
  session: number;
}

export interface SelectState {
  value: string;
  pick: (value: string) => void;
  /** Null until the first tray open: a Select that never opens one never
        mounts a Sheet. */
  tray: TrayState | null;
  closeTray: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  listboxId: string;
}

const NO_REF: React.RefObject<HTMLElement | null> = { current: null };

export const SelectStateContext = React.createContext<SelectState>({
  value: "",
  pick: () => {},
  tray: null,
  closeTray: () => {},
  triggerRef: NO_REF,
  listboxId: "",
});

interface TrayRows {
  value: string;
  pick: (value: string) => void;
}

/** Present only inside the tray's list: it is what turns SelectItem and its
    kin into rows. */
export const TrayRowsContext = React.createContext<TrayRows | null>(null);

/** Whether this tap opens the tray: a phone-width window, and no dialog,
    sheet or popover already open around the trigger (a panel over a panel is
    never the answer; the popover stays, 44px rows and all). */
export function opensAsTray(trigger: HTMLElement | null): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  if (!window.matchMedia(BELOW_MD).matches) return false;
  return trigger?.closest('[role="dialog"]') == null;
}

/** The field's name, for the tray's title: its aria-label, else what
    aria-labelledby points at, else the <label> that targets it (minus the
    trigger's own text when the trigger sits inside that label). */
export function titleOf(trigger: HTMLElement | null): string {
  if (!trigger) return "";
  const own = trigger.getAttribute("aria-label")?.trim();
  if (own) return own;
  const ids = trigger.getAttribute("aria-labelledby")?.split(/\s+/) ?? [];
  const named = ids
    .map((id) => trigger.ownerDocument.getElementById(id)?.textContent)
    .filter((text): text is string => Boolean(text))
    .join(" ")
    .trim();
  if (named) return named;
  const labels = (trigger as HTMLButtonElement).labels;
  if (!labels) return "";
  const triggerText = trigger.textContent ?? "";
  return Array.from(labels)
    .map((label) =>
      label.contains(trigger)
        ? (label.textContent ?? "").replace(triggerText, "")
        : (label.textContent ?? ""),
    )
    .join(" ")
    .trim();
}

const ROW =
  "flex min-h-11 w-full cursor-default items-center gap-3 rounded-lg px-3 text-body-lg outline-hidden select-none active:bg-btn-ghost-surface-hover focus-visible:bg-btn-ghost-surface-hover aria-disabled:opacity-50 [&_svg]:shrink-0";

export function TrayItem({
  value,
  disabled,
  disabledReason,
  className,
  children,
}: {
  value: string;
  disabled?: boolean;
  disabledReason?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const rows = React.useContext(TrayRowsContext);
  const selected = rows?.value === value;
  const unavailable = disabled === true || disabledReason != null;
  return (
    <div
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      aria-disabled={unavailable || undefined}
      data-slot="select-item"
      data-state={selected ? "checked" : "unchecked"}
      // A click, never pointerup: a scroll or drag that ends on a row
      // must pick nothing.
      onClick={() => {
        if (!unavailable) rows?.pick(value);
      }}
      className={cn(ROW, className)}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-3 [&>svg:not([class*='size-'])]:size-4">
          {React.Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number" ? (
              <span className="truncate">{child}</span>
            ) : (
              child
            ),
          )}
        </span>
        {disabledReason != null ? (
          <span className="text-caption text-muted-foreground">
            {disabledReason}
          </span>
        ) : null}
      </span>
      {/* In flow and always reserved, so the check never shifts the
                text. No fill marks the chosen row; the check does. */}
      <span
        aria-hidden
        data-slot="select-item-indicator"
        className="ms-auto flex size-5 shrink-0 items-center justify-center"
      >
        {selected ? <CheckIcon className="size-5" /> : null}
      </span>
    </div>
  );
}

export function TrayGroup({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div role="group" data-slot="select-group" className={className}>
      {children}
    </div>
  );
}

export function TrayLabel({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      data-slot="select-label"
      className={cn(
        "text-caption text-muted-foreground px-3 py-1.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TraySeparator({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <div
      role="separator"
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none mx-3 my-1 h-px", className)}
    />
  );
}

/* The search matches the way the list kit's does: both sides folded, so
   «سارة» finds «ساره». Rows are hidden in the DOM rather than filtered out of
   the children, because the children are the caller's and may wrap their
   items in components that only the DOM can see through. */
function applyQuery(list: HTMLElement, query: string): number {
  const needle = foldArabic(query.trim());
  let shown = 0;
  for (const row of list.querySelectorAll<HTMLElement>(
    '[data-slot="select-item"]',
  )) {
    const match =
      needle === "" || foldArabic(row.textContent ?? "").includes(needle);
    row.hidden = !match;
    if (match) shown += 1;
  }
  for (const group of list.querySelectorAll<HTMLElement>(
    '[data-slot="select-group"]',
  )) {
    group.hidden =
      needle !== "" &&
      group.querySelector('[data-slot="select-item"]:not([hidden])') === null;
  }
  for (const stray of list.querySelectorAll<HTMLElement>(
    '[data-slot="select-label"], [data-slot="select-separator"]',
  )) {
    if (!stray.closest('[data-slot="select-group"]'))
      stray.hidden = needle !== "";
  }
  return shown;
}

function TrayBody({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const state = React.useContext(SelectStateContext);
  const labels = React.useContext(SelectLabelsContext);
  const [query, setQuery] = React.useState("");
  const [noMatch, setNoMatch] = React.useState(false);
  const [searchable, setSearchable] = React.useState<boolean | null>(null);
  const pinnedRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const lastQueryRef = React.useRef("");
  const rows = React.useMemo<TrayRows>(
    () => ({ value: state.value, pick: state.pick }),
    [state.value, state.pick],
  );

  /* Whether to offer a search is decided from the rows that rendered, so
       it counts options behind wrapper components too. Radix does not hand
       out the closed fragment that holds its own copy, and the children are
       the caller's. A layout effect's update lands before the first paint,
       so the tray still opens at its final shape. */
  React.useLayoutEffect(() => {
    const count =
      listRef.current?.querySelectorAll('[data-slot="select-item"]').length ??
      0;
    setSearchable(count > SEARCH_THRESHOLD);
  }, []);

  /* The tray keeps the height it opened at, so filtering down to two rows
       does not shrink it under her thumb. What is pinned is the wrapper
       inside the scroller, to the scroller's visible height at open. Not the
       scroller itself: vaul shrinks the panel when the phone keyboard opens
       for the search field (repositionInputs) and the Sheet clips overflow,
       so a pinned scroller taller than the panel would hide its last rows
       with no way to scroll to them; left free, the scroller shrinks with the
       panel and the wrapper holds the space it scrolls over. Not the
       wrapper's own height either: a long list opens capped by the viewport,
       so the wrapper is taller than the scroller, and after filtering that
       excess would be a scrollable blank stretch with the match scrolled out
       of view. Scroller-height means scrollHeight equals clientHeight once
       filtered. The end padding sits on the wrapper, not the scroller, so the
       pin does not count it twice. Read after the search field is in place (searchable !== null),
       since the field takes part of the panel. */
  React.useLayoutEffect(() => {
    const pinned = pinnedRef.current;
    const scroller = scrollerRef.current;
    if (searchable !== null && pinned && scroller?.clientHeight)
      pinned.style.minHeight = `${String(scroller.clientHeight)}px`;
  }, [searchable]);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const shown = applyQuery(list, query);
    setNoMatch(query.trim() !== "" && shown === 0);
    // A match must start in view, not wherever the full list was scrolled.
    // Only a new query does it: a parent re-render hands over fresh
    // children too, and must not throw the chosen row out of view.
    if (scrollerRef.current && lastQueryRef.current !== query)
      scrollerRef.current.scrollTop = 0;
    lastQueryRef.current = query;
  }, [query, children]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const list = listRef.current;
    if (!list) return;
    const target = event.target;
    if (
      (event.key === "Enter" || event.key === " ") &&
      target instanceof HTMLElement &&
      target.getAttribute("role") === "option"
    ) {
      event.preventDefault();
      target.click();
      return;
    }
    const options = Array.from(
      list.querySelectorAll<HTMLElement>(
        '[role="option"]:not([hidden]):not([aria-disabled="true"])',
      ),
    );
    const at = options.findIndex((option) => option === target);
    let next: HTMLElement | undefined;
    if (event.key === "ArrowDown") next = options[at + 1] ?? options[0];
    else if (event.key === "ArrowUp")
      next = at <= 0 ? options[options.length - 1] : options[at - 1];
    else if (event.key === "Home") next = options[0];
    else if (event.key === "End") next = options[options.length - 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  return (
    <>
      <SheetHeader className="pb-2">
        <SheetTitle className={title ? undefined : "sr-only"}>
          {title || labels.search}
        </SheetTitle>
      </SheetHeader>
      {searchable ? (
        <div className="shrink-0 px-4 pb-2">
          <Input
            type="search"
            size="touch"
            value={query}
            leading={<Icon icon={SearchIcon} />}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
            aria-controls={state.listboxId}
            clearLabel={labels.clear}
            autoComplete="off"
            // The password managers' inline menus have no
            // business in a filter box; each reads its own opt-out.
            data-bwignore="true"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
          />
        </div>
      ) : null}
      <div
        ref={scrollerRef}
        data-slot="select-tray-scroller"
        className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-2"
      >
        <div ref={pinnedRef} data-slot="select-tray-pinned" className="pb-2">
          <div
            ref={listRef}
            role="listbox"
            id={state.listboxId}
            aria-label={title || undefined}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className="outline-hidden"
          >
            <TrayRowsContext.Provider value={rows}>
              {children}
            </TrayRowsContext.Provider>
          </div>
          {noMatch ? (
            <div className="flex justify-center px-4 py-6">
              <StatusNote tone="neutral">{labels.noMatches}</StatusNote>
            </div>
          ) : null}
        </div>
      </div>
      {/* The scrim, a drag and Escape close it, none of which a screen
                reader can find; this is its way out. */}
      <SheetClose className="sr-only">{labels.close}</SheetClose>
    </>
  );
}

export function SelectTray({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element | null {
  const state = React.useContext(SelectStateContext);
  const { tray } = state;
  if (!tray) return null;
  return (
    <Sheet
      side="bottom"
      open={tray.open}
      onOpenChange={(next) => {
        if (!next) state.closeTray();
      }}
    >
      <SheetContent
        className={className}
        aria-describedby={undefined}
        // Radix would focus the first tabbable, which past 12 options
        // is the search field and opens the keyboard. Land on the
        // chosen row instead (or the list), where a thumb or the
        // arrow keys start.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const container = event.currentTarget;
          if (!(container instanceof HTMLElement)) return;
          const target =
            container.querySelector<HTMLElement>(
              '[role="option"][aria-selected="true"]',
            ) ?? container.querySelector<HTMLElement>('[role="listbox"]');
          target?.focus();
        }}
        // The Sheet has no Trigger of its own, so Radix has nowhere to
        // send focus back to. A pointer close leaves it ringless (as
        // the popover does); a keyboard close returns it to the field.
        onCloseAutoFocus={(event) => {
          restoreTriggerFocus(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          state.triggerRef.current?.focus();
        }}
      >
        <TrayBody key={tray.session} title={tray.title}>
          {children}
        </TrayBody>
      </SheetContent>
    </Sheet>
  );
}
