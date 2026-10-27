"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { SearchIcon } from "../icons/catalogue";
import { CornerDownLeftIcon } from "../icons/general";
import type { IconComponent } from "../icons/house-icon";
import { Icon } from "./icon";
import { Kbd } from "./kbd";
import { Skeleton } from "./skeleton";

type PaletteItemRecord = {
  groupId: string;
  disabled: boolean;

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

  openLabel: string;

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

const PaletteGroupContext = React.createContext<string | null>(null);

function usePaletteGroupId(component: string): string {
  const groupId = React.useContext(PaletteGroupContext);
  if (groupId == null) {
    throw new Error(`${component} must be rendered inside <PaletteGroup>`);
  }
  return groupId;
}

function itemDomId(listId: string, value: string): string {
  return `${listId}-item-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

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
  openLabel: string;

  search?: string;
  onSearchChange?: (value: string) => void;

  filter?: boolean;

  activeValue?: string | null;

  onActiveValueChange?: (value: string | null) => void;

  onEnter?: (activeValue: string | null) => void;
}) {
  const listId = React.useId();
  const pointerRef = React.useRef({ x: -1, y: -1 });

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

  const [items, setItems] = React.useState<
    ReadonlyMap<string, PaletteItemRecord>
  >(new Map());

  const matches = React.useCallback(
    (value: string): boolean => {
      if (!filter) return true;
      const query = search.trim().toLowerCase();
      if (query === "") return true;
      const record = items.get(value);

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

  React.useLayoutEffect(() => {
    const ordered = inScreenOrder(items, listId);

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

      const next =
        index === -1
          ? 0
          : Math.min(Math.max(index + direction, 0), visibleValues.length - 1);
      if (next === index) return;
      const nextValue = visibleValues[next] ?? null;
      setActiveValue(nextValue);

      if (nextValue == null) return;
      const row = document.getElementById(itemDomId(listId, nextValue));
      if (row == null) return;
      row.scrollIntoView({ block: "nearest" });

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
  icon?: IconComponent;

  trailing?: React.ReactNode;
}) {
  const { search, setSearch, activeValue, move, selectActive, listId } =
    usePaletteContext("PaletteInput");
  return (
    <div
      data-slot="palette-input-wrapper"

      className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4"
    >
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
        "no-scrollbar min-h-0 flex-1 touch-pan-y scroll-py-1.5 overflow-x-hidden overflow-y-auto overscroll-contain px-0.5 py-1.5",
        className,
      )}
      style={style}
      {...props}
    >
      {children}

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

        aria-labelledby={headingId}

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
  enterLabel?: string;

  value: string;
  title: string;

  subtitle: string;

  leading: React.ReactNode;

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
        "group/palette-item rounded-palette-item flex w-full cursor-pointer items-center gap-3 p-1.5 select-none",
        variant === "destructive"
          ? "aria-selected:bg-btn-destructive/10"
          : "aria-selected:bg-gray-alpha-100",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onMouseMove={(event) => {
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

      {active ? (
        <span
          data-slot="palette-item-open"
          className="text-caption text-muted-foreground flex shrink-0 items-center gap-1.5 pe-1.5 pointer-coarse:hidden"
        >
          {enterLabel ?? openLabel}

          <Kbd className="bg-surface-modal">
            <Icon icon={CornerDownLeftIcon} className="size-3" />
          </Kbd>
        </span>
      ) : null}
    </div>
  );
}

const TILE = "flex size-10 shrink-0 items-center justify-center rounded-lg";

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

function PaletteItemIcon({
  icon,
  variant = "default",
  className,
}: {
  icon: IconComponent;

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

const AURORA_AVATARS = [
  "aurora-avatar-1",
  "aurora-avatar-2",
  "aurora-avatar-3",
  "aurora-avatar-4",
  "aurora-avatar-5",
  "aurora-avatar-6",
] as const;

function auroraAvatarFor(seed: string): (typeof AURORA_AVATARS)[number] {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return AURORA_AVATARS[Math.abs(hash) % AURORA_AVATARS.length]!;
}

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
