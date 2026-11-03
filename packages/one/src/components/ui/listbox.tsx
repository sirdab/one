"use client";

import * as React from "react";
import { Direction } from "radix-ui";

import { cn } from "../../lib/utils";
import { overlayItemChrome } from "./overlay";
import { Spinner } from "./spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type ListboxItemRecord = {
  disabled: boolean;
  group: string | null;
  text: string[];
  domId: string;
  node: HTMLElement | null;
  select: () => void;
};

type ListboxContextValue = {
  search: string;
  setSearch: (value: string) => void;
  activeValue: string | null;
  setActiveValue: (value: string | null) => void;
  matches: (text: string[]) => boolean;
  register: (value: string, record: ListboxItemRecord) => void;
  unregister: (value: string) => void;
  move: (to: "next" | "previous" | "first" | "last") => void;
  selectActive: () => void;
  activeDomId: string | undefined;
  hasMatches: boolean;
  groupHidden: (group: string) => boolean;
  listId: string;
  listMounted: boolean;
  setListMounted: (mounted: boolean) => void;
};

const ListboxContext = React.createContext<ListboxContextValue | null>(null);

const ListboxGroupContext = React.createContext<string | null>(null);

function useListboxContext(component: string): ListboxContextValue {
  const ctx = React.useContext(ListboxContext);
  if (ctx == null) {
    throw new Error(`${component} must be rendered inside <Listbox>`);
  }
  return ctx;
}

function listboxMatches(keywords: readonly string[], query: string): boolean {
  const needle = query.trim().toLowerCase();
  return (
    needle === "" ||
    keywords.some((keyword) => keyword.toLowerCase().includes(needle))
  );
}

function byDomOrder(
  a: [string, ListboxItemRecord],
  b: [string, ListboxItemRecord],
): number {
  const left = a[1].node;
  const right = b[1].node;
  if (left == null || right == null || left === right) return 0;
  return left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

function Listbox({
  className,
  children,
  search: searchProp,
  onSearchChange,
  shouldFilter = true,
  ...props
}: React.ComponentProps<"div"> & {
  search?: string;
  onSearchChange?: (search: string) => void;
  shouldFilter?: boolean;
}) {
  const listId = React.useId();
  const [internalSearch, setInternalSearch] = React.useState("");
  const search = searchProp ?? internalSearch;
  const setSearch = React.useCallback(
    (value: string): void => {
      setInternalSearch(value);
      onSearchChange?.(value);
    },
    [onSearchChange],
  );
  const [listMounted, setListMounted] = React.useState(false);
  const [pickedValue, setPickedValue] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<
    ReadonlyMap<string, ListboxItemRecord>
  >(new Map());

  const matches = React.useCallback(
    (text: string[]): boolean => {
      return !shouldFilter || listboxMatches(text, search);
    },
    [search, shouldFilter],
  );

  const register = React.useCallback(
    (value: string, record: ListboxItemRecord): void => {
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

  const ordered = React.useMemo(
    () => Array.from(items.entries()).sort(byDomOrder),
    [items],
  );
  const matching = React.useMemo(
    () => ordered.filter(([, record]) => matches(record.text)),
    [ordered, matches],
  );
  const visibleValues = React.useMemo(
    () =>
      matching.filter(([, record]) => !record.disabled).map(([value]) => value),
    [matching],
  );
  const hasMatches = matching.length > 0;
  const groupHidden = React.useCallback(
    (group: string): boolean => {
      let registered = false;
      for (const [, record] of ordered) {
        if (record.group !== group) continue;
        registered = true;
        if (matches(record.text)) return false;
      }
      return registered;
    },
    [ordered, matches],
  );
  const activeValue =
    pickedValue != null && visibleValues.includes(pickedValue)
      ? pickedValue
      : (visibleValues[0] ?? null);
  const activeDomId =
    activeValue != null ? items.get(activeValue)?.domId : undefined;

  const move = React.useCallback(
    (to: "next" | "previous" | "first" | "last"): void => {
      const count = visibleValues.length;
      if (count === 0) return;
      const index =
        activeValue != null ? visibleValues.indexOf(activeValue) : -1;
      const next =
        to === "first"
          ? 0
          : to === "last"
            ? count - 1
            : index === -1
              ? 0
              : (index + (to === "next" ? 1 : -1) + count) % count;
      const value = visibleValues[next] ?? null;
      setPickedValue(value);
      if (value != null) {
        items.get(value)?.node?.scrollIntoView({ block: "nearest" });
      }
    },
    [activeValue, visibleValues, items],
  );

  const selectActive = React.useCallback((): void => {
    if (activeValue == null) return;
    items.get(activeValue)?.select();
  }, [activeValue, items]);

  return (
    <ListboxContext.Provider
      value={{
        search,
        setSearch,
        activeValue,
        setActiveValue: setPickedValue,
        matches,
        register,
        unregister,
        move,
        selectActive,
        activeDomId,
        hasMatches,
        groupHidden,
        listId,
        listMounted,
        setListMounted,
      }}
    >
      <div
        data-slot="listbox"
        className={cn(
          "flex size-full flex-col overflow-hidden rounded-lg bg-transparent",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ListboxContext.Provider>
  );
}

function ListboxInput({
  searchable = true,
  className,
  onKeyDown,
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "value"> & {
  searchable?: boolean;
}) {
  const {
    search,
    setSearch,
    activeDomId,
    move,
    selectActive,
    listId,
    listMounted,
  } = useListboxContext("ListboxInput");
  return (
    <div
      data-slot="listbox-input-wrapper"
      className={cn(
        "flex shrink-0 items-center border-b border-border bg-popover",
        !searchable && "sr-only",
      )}
    >
      <input
        data-slot="listbox-input"
        role="combobox"
        aria-expanded={listMounted}
        aria-controls={listMounted ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeDomId}
        autoComplete="off"
        readOnly={!searchable}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={(event) => {
          const to =
            event.key === "ArrowDown"
              ? "next"
              : event.key === "ArrowUp"
                ? "previous"
                : event.key === "Home"
                  ? "first"
                  : event.key === "End"
                    ? "last"
                    : null;
          if (to != null) {
            event.preventDefault();
            move(to);
          } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            selectActive();
          }
          onKeyDown?.(event);
        }}
        className={cn(
          "h-control-xl w-full bg-transparent px-3 text-body-lg outline-hidden placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-50 sm:text-body-quiet",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function ListboxList({
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const { listId, setListMounted } = useListboxContext("ListboxList");
  React.useLayoutEffect(() => {
    setListMounted(true);
    return () => setListMounted(false);
  }, [setListMounted]);
  return (
    <div
      id={listId}
      role="listbox"
      data-slot="listbox-list"
      className={cn(
        "touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-thin",
        className,
      )}
      style={{
        maxHeight:
          "min(280px, calc(var(--radix-popover-content-available-height, 9999px) - 5.5rem))",
        ...style,
      }}
      {...props}
    />
  );
}

function ListboxEmpty({ className, ...props }: React.ComponentProps<"div">) {
  const { hasMatches } = useListboxContext("ListboxEmpty");
  if (hasMatches) return null;
  return (
    <div
      data-slot="listbox-empty"
      role="presentation"
      className={cn(
        "py-6 text-center text-body text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ListboxLoading({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="listbox-loading"
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 py-6 text-body text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Spinner className="text-muted-foreground" />
      {children}
    </div>
  );
}

function ListboxGroup({
  className,
  heading,
  children,
  ...props
}: React.ComponentProps<"div"> & { heading?: React.ReactNode }) {
  const { groupHidden } = useListboxContext("ListboxGroup");
  const groupId = React.useId();
  const headingId = React.useId();
  return (
    <ListboxGroupContext.Provider value={groupId}>
      <div
        data-slot="listbox-group"
        role="group"
        hidden={groupHidden(groupId)}
        aria-labelledby={heading != null ? headingId : undefined}
        className={cn("overflow-hidden p-1 text-foreground", className)}
        {...props}
      >
        {heading != null ? (
          <div
            id={headingId}
            data-slot="listbox-group-heading"
            className="px-2 py-1.5 text-caption text-muted-foreground"
          >
            {heading}
          </div>
        ) : null}
        {children}
      </div>
    </ListboxGroupContext.Provider>
  );
}

function ListboxSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="listbox-separator"
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function ListboxItem({
  className,
  value,
  keywords,
  selected = false,
  disabled: disabledProp = false,
  disabledReason,
  onSelect,
  onMouseEnter,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  value: string;
  keywords?: string[];
  selected?: boolean;
  disabled?: boolean;
  disabledReason?: React.ReactNode;
  onSelect?: (value: string) => void;
}) {
  const { activeValue, setActiveValue, matches, register, unregister, listId } =
    useListboxContext("ListboxItem");
  const group = React.useContext(ListboxGroupContext);
  const dir = Direction.useDirection();
  const disabled = disabledProp || disabledReason != null;
  const domId = `${listId}-option-${React.useId()}`;
  const node = React.useRef<HTMLDivElement>(null);
  const onSelectRef = React.useRef(onSelect);
  React.useLayoutEffect(() => {
    onSelectRef.current = onSelect;
  });
  const corpus = (keywords ?? [value]).join("\u0000").toLowerCase();

  React.useLayoutEffect(() => {
    register(value, {
      disabled,
      group,
      text: corpus.split("\u0000"),
      domId,
      node: node.current,
      select: () => onSelectRef.current?.(value),
    });
    return () => unregister(value);
  }, [value, disabled, group, corpus, domId, register, unregister]);

  const visible = matches(corpus.split("\u0000"));
  const active = visible && activeValue === value;
  const item = (
    <div
      ref={node}
      id={domId}
      hidden={!visible}
      data-slot="listbox-item"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-active={active ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        overlayItemChrome,
        "gap-3 data-[active=true]:bg-btn-ghost-surface-hover data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&>svg:not([class*='size-'])]:size-4",
        disabledReason != null &&
          "data-[disabled=true]:pointer-events-auto data-[disabled=true]:cursor-default",
        className,
      )}
      onMouseEnter={(event) => {
        if (!disabled) setActiveValue(value);
        onMouseEnter?.(event);
      }}
      onClick={(event) => {
        if (!disabled) onSelect?.(value);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </div>
  );

  if (disabledReason == null) return item;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="block">{item}</div>
      </TooltipTrigger>
      <TooltipContent side={dir === "rtl" ? "right" : "left"} sideOffset={8}>
        {disabledReason}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  Listbox,
  ListboxEmpty,
  ListboxGroup,
  ListboxInput,
  ListboxItem,
  ListboxList,
  ListboxLoading,
  ListboxSeparator,
  listboxMatches,
};
