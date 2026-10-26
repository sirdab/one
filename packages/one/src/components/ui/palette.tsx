"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { SearchIcon } from "../icons/catalogue";
import { CornerDownLeftIcon } from "../icons/general";
import type { IconComponent } from "../icons/house-icon";
import { Icon } from "./icon";
import { Kbd } from "./kbd";
import { Skeleton } from "./skeleton";

/* The Sirdab command palette: a full-height searchable list built for the
   Dialog's "launcher" position, NOT a shrink of Command. Command
   (command.tsx) is the searchable menu that lives inside a frosted
   POPOVER for comboboxes: solid input header against the frost, no
   search icon, a 280px list cap. Every one of those is wrong for a modal
   palette that replaces the topbar's own search row: this panel is
   already opaque (Dialog's own bg-surface-modal), the search row IS the
   thing being replaced so it carries the magnifier, and the list is meant
   to run tall, not cap at dropdown height. Two components, one each,
   rather than a shared one bent sideways by a size prop: extending
   Command risked changing how every existing combobox call site renders.

   Same controlled-combobox shape as Command underneath (typed search,
   role=listbox + aria-activedescendant, arrow keys move the active row,
   Enter selects it), with two additions Command has no need for. Rows are
   GROUPED, and a group whose every row is filtered out hides its own
   heading rather than leaving an orphaned label over an empty section:
   items register with a `groupId` (read from the nearest PaletteGroup via
   context, not a prop the caller repeats on every row) and PaletteGroup
   counts its own visible rows to decide whether to render at all. And
   the SEARCH can be the host's: `search` / `onSearchChange` make it
   controlled, and `filter={false}` switches the built-in substring match
   off, for a host whose rows are answered by an api (a customer found by
   phone number carries no trace of the query in her title) and who
   decides what mounts. So can the ACTIVE ROW: a host that ranks its
   sources decides which row Enter will run (`activeValue`, null for none
   yet, so the highlight never jumps when a late answer arrives), hears
   the arrow keys and the pointer (`onActiveValueChange`), and can take
   Enter over (`onEnter`) to hold it while a source answers.

   Anatomy: PaletteInput (the tall, borderless search row, a hairline
   below it, never a boxed field; `trailing` holds the host's spinner or
   Cancel) → PaletteList (the scrolling region, filling whatever the
   launcher's fixed box leaves it, with its last row clear of a phone's
   bottom edge; PaletteSkeleton holds the place of rows still on their way) →
   PaletteGroup (quiet caption heading, hidden when empty) → PaletteItem
   (a 40px leading tile, a medium-weight title with its REQUIRED subtitle
   under it, and, ONLY on the active row, a trailing "<enterLabel> ⏎"
   affordance, the row's own word over the palette's `openLabel`: a
   combobox's active row does not need to explain that Enter opens it, a
   palette's action and record rows do, and a row that creates, publishes
   or asks must not say "Open").

   The tile is one of three, by what the row is: PaletteItemIcon (an
   action or a place: a gray well and a glyph, both stepping up with the
   active row), PaletteItemImage (a record with a photo: the photo), and
   PaletteItemAvatar (a record without one: an aurora gradient picked off
   its id, the one sanctioned colour here, COLORS.md row 11).

   Usage:
       <Palette openLabel={t("open")}>
           <PaletteInput placeholder="…" aria-label="…" />
           <PaletteList aria-label="…">
               <PaletteEmpty>{t("empty")}</PaletteEmpty>
               <PaletteGroup groupId="actions" heading={t("doThis")}>
                   <PaletteItem
                       value="add-product"
                       title="Create product"
                       subtitle="Add a new product to your catalog"
                       leading={<PaletteItemIcon icon={ProductsIcon} />}
                       onSelect={() => …}
                   />
                   <PaletteItem
                       value="order-1042"
                       title="#1042"
                       subtitle="Order · Pending"
                       leading={<PaletteItemAvatar seed={order.id} icon={OrdersIcon} />}
                   />
               </PaletteGroup>
           </PaletteList>
       </Palette>
*/

type PaletteItemRecord = {
  groupId: string;
  disabled: boolean;
  /** Title + subtitle joined: what the built-in search filters against.
        Distinct from the item's `value`, which is an opaque id (used as
        the React/DOM key), never shown and never searched. */
  searchText: string;
  onSelect?: () => void;
};

type PaletteContextValue = {
  search: string;
  setSearch: (value: string) => void;
  activeValue: string | null;
  setActiveValue: (value: string | null) => void;
  items: ReadonlyMap<string, PaletteItemRecord>;
  matches: (value: string) => boolean;
  register: (value: string, record: PaletteItemRecord) => void;
  unregister: (value: string) => void;
  move: (direction: 1 | -1) => void;
  selectActive: () => void;
  hasMatches: boolean;
  listId: string;
  /** The word before the Enter keycap on the active row ("Open" /
        "افتح") when the row names no action of its own. */
  openLabel: string;
  /** Where the pointer last actually was. A row activates on pointer
        MOTION, not on the pointer merely arriving over it: when an arrow
        key scrolls the list, a different row slides under a cursor that
        never moved, the browser fires a synthetic mouse event for it, and
        an enter-based hover would snap the highlight back to that row.
        Comparing against the last real position makes that event a
        no-op. A ref, not state: recording a position must never render. */
  pointerRef: React.RefObject<{ x: number; y: number }>;
};

const PaletteContext = React.createContext<PaletteContextValue | null>(null);

function usePaletteContext(component: string): PaletteContextValue {
  const ctx = React.useContext(PaletteContext);
  if (ctx == null) {
    throw new Error(`${component} must be rendered inside <Palette>`);
  }
  return ctx;
}

// A group is identified once, on <PaletteGroup>, and read back by every
// <PaletteItem> inside it: repeating the id on each row would be one more
// place for a copy-paste mistake to silently misfile a row into the
// wrong group's visible-count check.
const PaletteGroupContext = React.createContext<string | null>(null);

function usePaletteGroupId(component: string): string {
  const groupId = React.useContext(PaletteGroupContext);
  if (groupId == null) {
    throw new Error(`${component} must be rendered inside <PaletteGroup>`);
  }
  return groupId;
}

// A DOM id has to be a single token; item values here are always simple
// slugs, but this guards against the rare one that isn't.
function itemDomId(listId: string, value: string): string {
  return `${listId}-item-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

/* The registry re-ordered to match the rows on screen, or null when it
   already does. Only rendered rows move, into the slots rendered rows held,
   so a row filtered out keeps its place for when it comes back. */
function inScreenOrder(
  items: ReadonlyMap<string, PaletteItemRecord>,
  listId: string,
): ReadonlyMap<string, PaletteItemRecord> | null {
  const values = Array.from(items.keys());
  const nodes = new Map<string, HTMLElement>();
  for (const value of values) {
    const node = document.getElementById(itemDomId(listId, value));
    if (node != null) nodes.set(value, node);
  }
  const rendered = values.filter((value) => nodes.has(value));
  const sorted = [...rendered].sort((a, b) => {
    const nodeA = nodes.get(a);
    const nodeB = nodes.get(b);
    if (nodeA == null || nodeB == null) return 0;
    return nodeA.compareDocumentPosition(nodeB) &
      Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1;
  });
  if (sorted.every((value, index) => value === rendered[index])) return null;
  let next = 0;
  const ordered = values.map((value) =>
    nodes.has(value) ? (sorted[next++] ?? value) : value,
  );
  return new Map(
    ordered.flatMap((value) => {
      const record = items.get(value);
      return record ? [[value, record] as const] : [];
    }),
  );
}

function Palette({
  className,
  children,
  openLabel,
  search: searchProp,
  onSearchChange,
  filter = true,
  activeValue: activeProp,
  onActiveValueChange,
  onEnter,
  ...props
}: React.ComponentProps<"div"> & {
  /** The word on the active row's Enter hint when the row names no action
        of its own (`PaletteItem enterLabel`). */
  openLabel: string;
  /** The query, when the host owns it (a debounced fetch, an "ask" row
        built from the sentence). Uncontrolled otherwise. */
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Whether rows are matched against the query here. Off, every
        mounted row stays and the host decides what mounts. */
  filter?: boolean;
  /** The active row, when the host decides it (a verdict over several
        sources, not the first row on screen). A row's `value`; `null` lights
        nothing, which is how a host says "not yet" without the highlight
        jumping later. Left out, the first visible row is active until the
        arrow keys or the pointer move it. */
  activeValue?: string | null;
  /** Told when the arrow keys or the pointer move the highlight. With a
        host-owned `activeValue` the host decides whether it moves. */
  onActiveValueChange?: (value: string | null) => void;
  /** Takes Enter over, with the row that was active (null when none was):
        a host that has to hold the key while a source answers, or that runs
        something other than the row's own `onSelect`. */
  onEnter?: (activeValue: string | null) => void;
}) {
  const listId = React.useId();
  const pointerRef = React.useRef({ x: -1, y: -1 });
  // The last row this palette itself moved the highlight to, so a host that
  // echoes it back is not scrolled: the pointer put it there, and a list
  // that scrolls under a resting cursor walks the highlight away.
  const movedRef = React.useRef<string | null>(null);
  const [ownSearch, setOwnSearch] = React.useState("");
  const search = searchProp ?? ownSearch;
  const setSearch = React.useCallback(
    (value: string): void => {
      if (searchProp === undefined) setOwnSearch(value);
      onSearchChange?.(value);
    },
    [searchProp, onSearchChange],
  );
  const [pickedValue, setPickedValue] = React.useState<string | null>(null);
  // Registration lives in state, not a ref: visibleValues below reads it
  // during render, and a ref's `.current` is not safe to read there.
  // Order is mount order, which is also the groups' own DOM order, since
  // items never reorder themselves, only show or hide as search changes.
  const [items, setItems] = React.useState<
    ReadonlyMap<string, PaletteItemRecord>
  >(new Map());

  const matches = React.useCallback(
    (value: string): boolean => {
      if (!filter) return true;
      const query = search.trim().toLowerCase();
      if (query === "") return true;
      const record = items.get(value);
      // Not registered yet (first render, before the item's own mount
      // effect runs): render it rather than flash it hidden for a frame.
      if (record == null) return true;
      return record.searchText.toLowerCase().includes(query);
    },
    [filter, search, items],
  );

  const register = React.useCallback(
    (value: string, record: PaletteItemRecord): void => {
      setItems((prev) => {
        const next = new Map(prev);
        next.set(value, record);
        return next;
      });
    },
    [],
  );
  const unregister = React.useCallback((value: string): void => {
    setItems((prev) => {
      const next = new Map(prev);
      next.delete(value);
      return next;
    });
  }, []);

  /* Mount order is DOM order only while rows arrive top to bottom. A row
       the host answers late can land ABOVE rows already there (the studio's
       suggestion over its verbs), and left in mount order it would be the
       last stop for the arrow keys and never the default active row. Fixed
       before paint, so the highlight never visibly jumps. */
  React.useLayoutEffect(() => {
    const ordered = inScreenOrder(items, listId);
    // Read from the committed DOM, so it has to be an effect; null once
    // the order matches, so it settles in one extra pass.
    if (ordered !== null) setItems(ordered);
  }, [items, listId]);

  const visibleValues = React.useMemo(
    () =>
      Array.from(items.entries())
        .filter(([value, record]) => !record.disabled && matches(value))
        .map(([value]) => value),
    [items, matches],
  );
  const hasMatches = visibleValues.length > 0;
  const hosted = activeProp !== undefined;
  const activeValue = hosted
    ? activeProp !== null && visibleValues.includes(activeProp)
      ? activeProp
      : null
    : pickedValue != null && visibleValues.includes(pickedValue)
      ? pickedValue
      : (visibleValues[0] ?? null);

  const setActiveValue = React.useCallback(
    (value: string | null): void => {
      movedRef.current = value;
      setPickedValue(value);
      onActiveValueChange?.(value);
    },
    [onActiveValueChange],
  );

  /* A highlight the HOST moved (the verdict settled on another row as the
       query changed) may land off screen: the ask row is the last one. The
       keys and the pointer scroll for themselves, or deliberately do not. */
  React.useEffect(() => {
    if (activeProp == null || activeProp === movedRef.current) return;
    document
      .getElementById(itemDomId(listId, activeProp))
      ?.scrollIntoView?.({ block: "nearest" });
  }, [activeProp, listId]);

  const move = React.useCallback(
    (direction: 1 | -1): void => {
      if (visibleValues.length === 0) return;
      const index =
        activeValue != null ? visibleValues.indexOf(activeValue) : -1;
      // Clamped, not wrapped: the ends are where you stop, so a held key
      // parks on the last row instead of cycling back to the top.
      const next =
        index === -1
          ? 0
          : Math.min(Math.max(index + direction, 0), visibleValues.length - 1);
      if (next === index) return;
      const nextValue = visibleValues[next] ?? null;
      setActiveValue(nextValue);
      /* Scrolled from here, where the keyboard moved the row, rather
               than from an effect on the row itself becoming active: hover
               moves the active row too, and scrolling the list out from
               under a resting pointer walks the highlight away on its own.
               visibleValues only holds rows that matched, and those are
               exactly the ones mounted, so the node is already in the DOM
               and can be scrolled before this state update even commits.
               `block: "nearest"` scrolls the least that works, and nothing
               at all when the row is already fully in view. */
      if (nextValue == null) return;
      const row = document.getElementById(itemDomId(listId, nextValue));
      if (row == null) return;
      row.scrollIntoView({ block: "nearest" });
      /* A group's first row sits right under its heading. Bringing
               the row alone into view from below leaves that heading
               clipped above it, so the heading gets the same treatment:
               a no-op when it is already visible, a nudge of one heading's
               height when it is not. */
      const heading = row.previousElementSibling;
      if (
        heading instanceof HTMLElement &&
        heading.dataset.slot === "palette-group-heading"
      ) {
        heading.scrollIntoView({ block: "nearest" });
      }
    },
    [activeValue, listId, setActiveValue, visibleValues],
  );

  const selectActive = React.useCallback((): void => {
    if (onEnter) {
      onEnter(activeValue);
      return;
    }
    if (activeValue == null) return;
    items.get(activeValue)?.onSelect?.();
  }, [activeValue, items, onEnter]);

  return (
    <PaletteContext.Provider
      value={{
        search,
        setSearch,
        activeValue,
        setActiveValue,
        items,
        matches,
        register,
        unregister,
        move,
        selectActive,
        hasMatches,
        listId,
        openLabel,
        pointerRef,
      }}
    >
      <div
        data-slot="palette"
        className={cn("flex size-full min-h-0 flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </PaletteContext.Provider>
  );
}

function PaletteInput({
  className,
  onKeyDown,
  onChange,
  icon = SearchIcon,
  trailing,
  ...props
}: Omit<React.ComponentProps<"input">, "value"> & {
  /** The leading glyph; a plain magnifier unless the host's search does
        more than find (the studio's also asks the assistant). */
  icon?: IconComponent;
  /** At the end of the row, after the field: a spinner while the host
        holds Enter, a Cancel on the phone, where there is no Esc. The host
        owns its size (a tap target is 44px). */
  trailing?: React.ReactNode;
}) {
  const { search, setSearch, activeValue, move, selectActive, listId } =
    usePaletteContext("PaletteInput");
  return (
    <div
      data-slot="palette-input-wrapper"
      // Taller than an ordinary field (h-control-touch is 44px, the
      // system's own tallest control) and borderless: this row replaces
      // the topbar's own search control, so it reads as a continuation
      // of it, not as a boxed field dropped into a modal.
      className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4"
    >
      {/* Full-strength ink, unlike the quiet magnifier on the topbar
                control this row replaces: the row is live now. */}
      <Icon icon={icon} className="size-5 shrink-0 text-foreground" />
      <input
        data-slot="palette-input"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={
          activeValue != null ? itemDomId(listId, activeValue) : undefined
        }
        autoComplete="off"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          /* The active row falls back to the first match as the
                       query changes, which may be far above wherever the
                       list was left scrolled. The list starts over with the
                       query. */
          const list = document.getElementById(listId);
          if (list) list.scrollTop = 0;
          onChange?.(event);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            move(1);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            move(-1);
          } else if (event.key === "Enter") {
            event.preventDefault();
            selectActive();
          }
          onKeyDown?.(event);
        }}
        // text-body-lg sm:text-body, following Input's own responsive
        // pattern rather than one flat size: a real <input> below
        // 16px makes iOS auto-zoom on focus at touch widths. Same
        // outline treatment as CommandInput: the panel is the focus
        // container, a ring around a borderless row reads as a box.
        className={cn(
          "text-body-lg placeholder:text-subtle sm:text-body h-full min-w-0 flex-1 bg-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}

function PaletteList({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { listId } = usePaletteContext("PaletteList");
  return (
    <div
      id={listId}
      role="listbox"
      data-slot="palette-list"
      className={cn(
        // scroll-py-1.5 matches py-1.5: scrollIntoView aligns to
        // the scrollport's edge, not its padding, so without it the
        // active row lands hard against the top or bottom instead
        // of inside the list's own inset. No height of its own: the
        // launcher is a fixed box and the list takes what the
        // search row leaves, so the panel never resizes with its
        // results.
        "no-scrollbar min-h-0 flex-1 touch-pan-y scroll-py-1.5 overflow-x-hidden overflow-y-auto overscroll-contain px-0.5 py-1.5",
        className,
      )}
      style={style}
      {...props}
    >
      {children}
      {/* The last row on a phone clears the bottom edge: a cut-off last
                row is a bug, and the home indicator and the keyboard's
                accessory bar sit exactly there. Env() has no utility, so
                the height lives in style. */}
      <div
        aria-hidden
        data-slot="palette-list-end"
        className="md:hidden"
        style={{ height: "calc(2rem + env(safe-area-inset-bottom))" }}
      />
    </div>
  );
}

function PaletteEmpty({ className, ...props }: React.ComponentProps<"div">) {
  const { hasMatches } = usePaletteContext("PaletteEmpty");
  if (hasMatches) return null;
  return (
    <div
      data-slot="palette-empty"
      role="presentation"
      className={cn(
        "text-body text-muted-foreground py-10 text-center",
        className,
      )}
      {...props}
    />
  );
}

function PaletteGroup({
  className,
  groupId,
  heading,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  groupId: string;
  heading: React.ReactNode;
}) {
  const { items, matches } = usePaletteContext("PaletteGroup");
  const headingId = React.useId();
  const visibleCount = React.useMemo(
    () =>
      Array.from(items.entries()).filter(
        ([value, record]) =>
          record.groupId === groupId && !record.disabled && matches(value),
      ).length,
    [items, matches, groupId],
  );

  return (
    <PaletteGroupContext.Provider value={groupId}>
      <div
        data-slot="palette-group"
        role="group"
        // The heading is the group's accessible name, so a screen
        // reader lands on "Actions, group" rather than an unnamed
        // cluster of options.
        aria-labelledby={headingId}
        // Hidden, not unmounted: items stay registered (their mount
        // order is what keeps arrow-key navigation stable) even
        // while every one of them is filtered out.
        // 2px between rows, the heading's 4px above a group and
        // nothing more between groups: ElevenLabs' rhythm.
        className={cn(
          "flex flex-col gap-0.5 px-1 pt-1",
          visibleCount === 0 && "hidden",
          className,
        )}
        {...props}
      >
        {visibleCount > 0 ? (
          <div
            id={headingId}
            data-slot="palette-group-heading"
            className="text-caption-quiet text-muted-foreground px-2 pb-0.5"
          >
            {heading}
          </div>
        ) : null}
        {children}
      </div>
    </PaletteGroupContext.Provider>
  );
}

function PaletteItem({
  className,
  value,
  title,
  subtitle,
  leading,
  variant = "default",
  disabled = false,
  enterLabel,
  onSelect,
  onMouseMove,
  onClick,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect" | "children" | "title"> & {
  /** What Enter does on THIS row ("Create", "Publish", "Ask"), over the
        palette's `openLabel`. The hint names the row's own action: a row
        that creates something must not say "Open". */
  enterLabel?: string;
  /** Opaque, globally unique id: the React/DOM key, never shown and
        never searched. */
  value: string;
  title: string;
  /** Required: every row says what it is under its name ("Product",
        "Order · Pending", what an action does). A title alone made a
        product, a page and a verb with the same word indistinguishable. */
  subtitle: string;
  /** The 40px leading tile: `PaletteItemIcon` for an action or a place,
        `PaletteItemImage` for a record with a photo, `PaletteItemAvatar`
        for one without. */
  leading: React.ReactNode;
  /** `destructive` is the row that loses something (delete a product):
        red title on the destructive button's own wash, the menu's recipe,
        so it reads as the dangerous one before Enter. Pair it with a
        destructive tile. It still opens a confirm; the colour warns, it
        does not guard. */
  variant?: "default" | "destructive";
  disabled?: boolean;
  onSelect?: (value: string) => void;
}) {
  const {
    activeValue,
    setActiveValue,
    matches,
    register,
    unregister,
    listId,
    openLabel,
    pointerRef,
  } = usePaletteContext("PaletteItem");
  const groupId = usePaletteGroupId("PaletteItem");
  const searchText = `${title} ${subtitle}`;

  React.useEffect(() => {
    register(value, {
      groupId,
      disabled,
      searchText,
      onSelect: () => onSelect?.(value),
    });
    return () => unregister(value);
    // register/unregister are stable; onSelect is read through the
    // record so a host's inline arrow does not re-register every render.
  }, [value, groupId, disabled, searchText, onSelect]);

  const active = activeValue === value;

  if (!matches(value)) return null;

  return (
    <div
      id={itemDomId(listId, value)}
      data-slot="palette-item"
      role="option"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "true" : undefined}
      data-variant={variant}
      className={cn(
        /* 52px: a 40px tile in 6px of padding. The row's radius is
                   its own token (14px), a step past the menu rows' 12px, so
                   the highlighted row reads as the palette's shape rather
                   than a borrowed Select row. One highlight only, the
                   active row at the nav recipe's alpha-100: moving the
                   pointer already makes its row the active one, so a hover
                   wash of its own only ever showed when the arrow keys had
                   moved on, leaving a second lit row under a resting cursor;
                   the tile inside answers the same state (see the tiles). */
        "group/palette-item rounded-palette-item flex w-full cursor-pointer items-center gap-3 p-1.5 select-none",
        variant === "destructive"
          ? "aria-selected:bg-btn-destructive/10"
          : "aria-selected:bg-gray-alpha-100",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onMouseMove={(event) => {
        // See pointerRef: only a pointer that actually moved may take
        // the highlight, so the list scrolling under a resting cursor
        // does not.
        const last = pointerRef.current;
        if (event.clientX !== last.x || event.clientY !== last.y) {
          pointerRef.current = { x: event.clientX, y: event.clientY };
          if (!disabled && !active) setActiveValue(value);
        }
        onMouseMove?.(event);
      }}
      onClick={(event) => {
        if (!disabled) onSelect?.(value);
        onClick?.(event);
      }}
      {...props}
    >
      {leading}
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          data-slot="palette-item-title"
          className={cn(
            "text-body truncate font-medium",
            variant === "destructive"
              ? "text-btn-destructive"
              : "text-foreground",
          )}
        >
          {title}
        </span>
        <span
          data-slot="palette-item-subtitle"
          className="text-caption-quiet text-muted-foreground truncate"
        >
          {subtitle}
        </span>
      </span>
      {/* Only the active row explains itself: every other row is just
                waiting to be the active one. A touch screen has no Enter key
                to point at, so there the row is just tapped. */}
      {active ? (
        <span
          data-slot="palette-item-open"
          className="text-caption text-muted-foreground flex shrink-0 items-center gap-1.5 pe-1.5 pointer-coarse:hidden"
        >
          {enterLabel ?? openLabel}
          {/* The row underneath is already bg-gray-alpha-100; the
                        keycap's own surface washes out against that fill
                        instead of reading as a lifted key, so this one row
                        swaps it for the panel's own opaque surface (the same
                        bg-surface-modal the Dialog itself renders on), which
                        sits visibly on top. */}
          <Kbd className="bg-surface-modal">
            <Icon icon={CornerDownLeftIcon} className="size-3" />
          </Kbd>
        </span>
      ) : null}
    </div>
  );
}

/* The three leading tiles share one frame: 40px, the 10px default radius,
   never shrinking in a long row. */
const TILE = "flex size-10 shrink-0 items-center justify-center rounded-lg";

/* Rows still on their way: the row's own geometry (the tile, a title line
   over a shorter caption line) pulsing in the tile's own gray, laid out as
   a group so it sits where the answered rows will. Hidden from assistive
   tech, which has nothing to read in a gray block: the host says
   "searching" in words. */
function PaletteSkeleton({
  rows = 5,
  className,
  ...props
}: React.ComponentProps<"div"> & { rows?: number }) {
  return (
    <div
      data-slot="palette-skeleton"
      aria-hidden
      className={cn("flex flex-col gap-0.5 px-1 pt-1", className)}
      {...props}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 p-1.5">
          <Skeleton className={cn(TILE, "bg-gray-alpha-100")} />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="bg-gray-alpha-100 h-3.5 w-2/5" />
            <Skeleton className="bg-gray-alpha-100 h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The tile for an action or a place: a gray well holding a 20px glyph in
 * the secondary tone. Both step up with the row: the well one alpha rung
 * (100 to 150) and the glyph to full ink, so the active row's mark lights
 * with it rather than sitting grey inside a highlighted row. */
function PaletteItemIcon({
  icon,
  variant = "default",
  className,
}: {
  icon: IconComponent;
  /** Matches the row's own `variant`: a destructive row's glyph is red
        at rest and active, the well steps as usual. */
  variant?: "default" | "destructive";
  className?: string;
}): React.JSX.Element {
  return (
    <span
      data-slot="palette-item-icon"
      className={cn(
        TILE,
        "bg-gray-alpha-100 group-aria-selected/palette-item:bg-gray-alpha-150",
        variant === "destructive"
          ? "text-btn-destructive"
          : "text-muted-foreground group-aria-selected/palette-item:text-foreground",
        className,
      )}
    >
      <Icon icon={icon} className="size-5" />
    </span>
  );
}

/** The tile for a record that has a photo (a product): the photo itself,
 * cropped to the square. Decorative (`alt=""`): the title beside it
 * already names the record. The gray well shows while it loads and
 * around a transparent PNG. */
function PaletteItemImage({
  src,
  className,
}: {
  src: string;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      data-slot="palette-item-image"
      className={cn(TILE, "bg-gray-alpha-100 overflow-hidden", className)}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
    </span>
  );
}

/* Literal class names, not built from the index: Tailwind only generates a
   utility it can find spelled out in the source. */
const AURORA_AVATARS = [
  "aurora-avatar-1",
  "aurora-avatar-2",
  "aurora-avatar-3",
  "aurora-avatar-4",
  "aurora-avatar-5",
  "aurora-avatar-6",
] as const;

/** Which aurora pairing a seed wears. A plain string hash (djb2), so the
 * same record gets the same face on every device and every visit with
 * nothing stored. */
function auroraAvatarFor(seed: string): (typeof AURORA_AVATARS)[number] {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return AURORA_AVATARS[Math.abs(hash) % AURORA_AVATARS.length]!;
}

/** The tile for a record without a photo (an order, a customer): a
 * gradient of the aurora hues picked off `seed` (the record's id), with
 * the record type's glyph in white. The one sanctioned colour in a
 * palette row (COLORS.md, row 11): it is what lets a merchant find "that
 * order" in her recents by its face before she reads a number. It does
 * not step with the active row; the row's own fill already does.
 *
 * `face` swaps the aurora for a host's own artwork filling the tile (the
 * studio's store orbs, so a recent wears the same faces as the store
 * switcher); the glyph stays on top either way. */
function PaletteItemAvatar({
  seed,
  icon,
  face,
  className,
}: {
  seed: string;
  icon: IconComponent;
  face?: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      data-slot="palette-item-avatar"
      className={cn(
        TILE,
        face === undefined ? auroraAvatarFor(seed) : "relative overflow-hidden",
        "text-white",
        className,
      )}
    >
      {face === undefined ? null : (
        <span aria-hidden className="absolute inset-0 [&>*]:size-full">
          {face}
        </span>
      )}
      <Icon icon={icon} className="relative size-5" />
    </span>
  );
}

export {
  auroraAvatarFor,
  Palette,
  PaletteEmpty,
  PaletteGroup,
  PaletteInput,
  PaletteItem,
  PaletteItemAvatar,
  PaletteItemIcon,
  PaletteItemImage,
  PaletteList,
  PaletteSkeleton,
};
