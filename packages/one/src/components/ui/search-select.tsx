"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Direction } from "radix-ui";

import { formatValue, type Locale as NumeralLocale } from "@sirdab/one/foundation";
import { CheckIcon, ChevronDownIcon } from "../icons/catalogue";

import {
  restoreTriggerFocus,
  trackFocusModality,
} from "../../lib/restore-trigger-focus";
import { cn } from "../../lib/utils";
import { Button, type buttonVariants } from "./button";
import {
  Listbox,
  ListboxEmpty,
  ListboxGroup,
  ListboxInput,
  ListboxItem,
  ListboxList,
  ListboxLoading,
  listboxMatches,
} from "./listbox";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { selectTriggerChrome, type SelectTriggerVariant } from "./select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  useInsideSheet,
} from "./sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export type SearchSelectOption<T = unknown> = {
  value: string;
  label: string;
  keywords?: string[];
  description?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  group?: string;
  disabledReason?: React.ReactNode;
  data?: T;
};

export type SearchSelectLabels = {
  placeholder: string;
  searchPlaceholder: string;
  empty: string;
  loading?: string;
  keepTyping?: string;
  error?: string;
  none?: string;
  close: string;
  title?: string;
  typeToSearch?: string;
  create?: (query: string) => string;
};

export type SearchSelectFooterContext<T = unknown> = {
  query: string;
  close: () => void;
  options: SearchSelectOption<T>[];
  values: string[];
  selectAll: () => void;
  clear: () => void;
};

type SearchSelectSearch<T> = (
  query: string,
  signal: AbortSignal,
) => Promise<SearchSelectOption<T>[]>;

type StaticSource<T> = {
  options: SearchSelectOption<T>[];
  search?: never;
  pageSize?: never;
  idleOptions?: never;
  searchKey?: never;
};

type ServerSource<T> = {
  options?: never;
  search: SearchSelectSearch<T>;
  pageSize?: number;
  idleOptions?: SearchSelectOption<T>[];
  searchKey?: string | number;
};

type SingleMode<T> = {
  multiple?: false;
  value: string | null;
  onValueChange: (
    value: string | null,
    option: SearchSelectOption<T> | null,
  ) => void;
};

type MultiMode<T> = {
  multiple: true;
  value: string[];
  onValueChange: (value: string[], options: SearchSelectOption<T>[]) => void;
};

type SearchSelectCommonProps<T> = {
  id?: string;
  labels: SearchSelectLabels;
  selectedOptions?: SearchSelectOption<T>[];
  clearable?: boolean;
  footer?: (context: SearchSelectFooterContext<T>) => React.ReactNode;
  onCreate?: (query: string) => void;
  variant?: SelectTriggerVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  searchable?: boolean;
  closed?: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  numeralLocale?: NumeralLocale;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export type SearchSelectProps<T = unknown> = SearchSelectCommonProps<T> &
  (StaticSource<T> | ServerSource<T>) &
  (SingleMode<T> | MultiMode<T>);

const DEBOUNCE_MS = 200;
const NARROW_QUERY = "(max-width: 639px)";

function subscribeNarrow(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(NARROW_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useNarrowViewport(): boolean {
  return React.useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}

type ServerAnswer<T> = {
  query: string;
  key: string | number | undefined;
  epoch: number;
  items: SearchSelectOption<T>[];
  failed: boolean;
};

function useServerSearch<T>(
  search: SearchSelectSearch<T> | undefined,
  open: boolean,
  query: string,
  idle: boolean,
  key: string | number | undefined,
): {
  answer: ServerAnswer<T> | null;
  previous: ServerAnswer<T> | null;
  loading: boolean;
} {
  const [answer, setAnswer] = React.useState<ServerAnswer<T> | null>(null);
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setAnswer(null);
  }
  const [seenKey, setSeenKey] = React.useState(key);
  const [epoch, setEpoch] = React.useState(0);
  if (seenKey !== key) {
    setSeenKey(key);
    setEpoch(epoch + 1);
  }
  const requestId = React.useRef(0);
  const searchRef = React.useRef(search);
  React.useLayoutEffect(() => {
    searchRef.current = search;
  });
  const enabled = search != null;

  React.useEffect(() => {
    if (!enabled || !open || idle) return;
    const current = (requestId.current += 1);
    const controller = new AbortController();
    const settle = (items: SearchSelectOption<T>[], failed: boolean): void => {
      if (controller.signal.aborted || current !== requestId.current) return;
      setAnswer({ query, key, epoch, items, failed });
    };
    const timer = setTimeout(
      () => {
        const run = searchRef.current;
        if (run == null) return;
        run(query, controller.signal).then(
          (items) => settle(items, false),
          () => settle([], true),
        );
      },
      query === "" ? 0 : DEBOUNCE_MS,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, open, query, idle, key, epoch]);

  const previous = answer != null && answer.key === key ? answer : null;
  const current =
    previous != null && previous.query === query && previous.epoch === epoch
      ? previous
      : null;
  return {
    answer: current,
    previous,
    loading: enabled && !idle && current == null,
  };
}

function optionKeywords<T>(option: SearchSelectOption<T>): string[] {
  return [option.label, ...(option.keywords ?? [])];
}

function groupOptions<T>(
  options: SearchSelectOption<T>[],
): { heading: string | undefined; options: SearchSelectOption<T>[] }[] {
  const groups = new Map<string | undefined, SearchSelectOption<T>[]>();
  for (const option of options) {
    const bucket = groups.get(option.group);
    if (bucket == null) groups.set(option.group, [option]);
    else bucket.push(option);
  }
  return Array.from(groups, ([heading, members]) => ({
    heading,
    options: members,
  }));
}

function CheckBox({
  checked,
  leading,
}: {
  checked: boolean;
  leading: boolean;
}): React.JSX.Element {
  return (
    <span
      data-slot="search-select-check"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center",
        !leading && "ms-auto me-0.5",
      )}
    >
      <Icon
        icon={CheckIcon}
        className={cn("size-4", checked ? "opacity-100" : "opacity-0")}
      />
    </span>
  );
}

function SearchSelect<T = unknown>(
  props: SearchSelectProps<T>,
): React.JSX.Element {
  const {
    id,
    labels,
    selectedOptions,
    clearable = false,
    footer,
    variant = "secondary",
    size = "xl",
    icon,
    searchable = true,
    closed,
    disabled,
    invalid,
    numeralLocale = "en-US",
    className,
    onCreate,
    ref,
  } = props;
  trackFocusModality();
  const dir = Direction.useDirection();
  const narrow = useNarrowViewport();
  const noneValue = `${React.useId()}-none`;
  const createValue = `${noneValue}-create`;
  const contentId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [openState, setOpenState] = React.useState(false);
  const open = props.open ?? openState;
  const [query, setQuery] = React.useState("");
  const trimmed = query.trim();
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setQuery("");
  }

  const server = props.search != null;
  const idle = server && trimmed === "" && props.idleOptions != null;
  const { answer, previous, loading } = useServerSearch(
    props.search,
    open,
    trimmed,
    idle,
    props.searchKey,
  );

  const listed: SearchSelectOption<T>[] = server
    ? idle
      ? (props.idleOptions ?? [])
      : ((answer ?? previous)?.items ?? [])
    : (props.options ?? []);
  const stale = loading && listed.length > 0;

  const [seen, setSeen] = React.useState<
    ReadonlyMap<string, SearchSelectOption<T>>
  >(new Map());
  const known = new Map<string, SearchSelectOption<T>>(seen);
  for (const option of selectedOptions ?? []) known.set(option.value, option);
  for (const option of props.options ?? []) known.set(option.value, option);
  for (const option of listed) known.set(option.value, option);
  const remember = (option: SearchSelectOption<T>): void => {
    setSeen((prev) => new Map(prev).set(option.value, option));
  };

  const values: string[] = props.multiple
    ? props.value
    : props.value != null
      ? [props.value]
      : [];
  const picked = values.map((value) => known.get(value));
  const first = picked[0];
  const extra = values.length - 1;
  const empty = values.length === 0;
  const unnamed = values.filter((value) => !known.has(value)).join(",");
  React.useEffect(() => {
    if (unnamed === "" || process.env.NODE_ENV === "production") return;
    console.warn(
      `SearchSelect: no option names the value(s) ${unnamed}; pass them in selectedOptions.`,
    );
  }, [unnamed]);

  const setOpen = (next: boolean): void => {
    if (next && (closed != null || disabled)) return;
    setOpenState(next);
    props.onOpenChange?.(next);
  };
  const close = (): void => setOpen(false);

  const choose = (option: SearchSelectOption<T>): void => {
    remember(option);
    if (props.multiple) {
      const next = props.value.includes(option.value)
        ? props.value.filter((value) => value !== option.value)
        : [...props.value, option.value];
      props.onValueChange(
        next,
        next
          .map((value) => (value === option.value ? option : known.get(value)))
          .filter((entry): entry is SearchSelectOption<T> => entry != null),
      );
      return;
    }
    props.onValueChange(option.value, option);
    close();
  };

  const clear = (): void => {
    if (props.multiple) {
      props.onValueChange([], []);
      return;
    }
    props.onValueChange(null, null);
    close();
  };

  const pickable = stale
    ? []
    : listed.filter(
        (option) =>
          option.disabledReason == null &&
          (server || listboxMatches(optionKeywords(option), query)),
      );
  const selectAll = (): void => {
    if (!props.multiple) return;
    const next = [...props.value];
    for (const option of pickable) {
      if (!next.includes(option.value)) next.push(option.value);
      remember(option);
    }
    props.onValueChange(
      next,
      next
        .map(
          (value) =>
            pickable.find((option) => option.value === value) ??
            known.get(value),
        )
        .filter((entry): entry is SearchSelectOption<T> => entry != null),
    );
  };

  const showCreate =
    onCreate != null &&
    trimmed !== "" &&
    !loading &&
    !listed.some(
      (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
    );
  const create = (): void => {
    onCreate?.(trimmed);
    if (props.multiple) setQuery("");
    else close();
  };

  const showNone =
    clearable &&
    labels.none != null &&
    (!props.multiple || props.value.length > 0) &&
    (!server || trimmed === "");
  const full =
    server &&
    !idle &&
    answer != null &&
    props.pageSize != null &&
    answer.items.length >= props.pageSize;

  const triggerLabel = first?.label ?? labels.placeholder;
  const insideSheet = useInsideSheet();

  const trigger = (
    <button
      ref={ref}
      type="button"
      id={id}
      role="combobox"
      data-slot="search-select-trigger"
      data-variant={variant}
      data-size={size}
      data-placeholder={first == null ? "" : undefined}
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={props["aria-required"] ? true : undefined}
      aria-invalid={invalid ? true : undefined}
      aria-disabled={closed != null ? true : undefined}
      tabIndex={closed != null ? -1 : undefined}
      disabled={disabled}
      onKeyDown={(event) => {
        if (open || closed != null) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
          return;
        }
        if (
          searchable &&
          event.key.length === 1 &&
          event.key !== " " &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          event.preventDefault();
          setQuery(event.key);
          setOpen(true);
        }
      }}
      className={cn(
        selectTriggerChrome({
          variant,
          size,
          chevron: true,
          closed: closed != null,
        }),
        "group/search-select-trigger",
        closed == null && className,
      )}
    >
      {icon}
      <span
        data-slot="search-select-value"
        className="flex min-w-0 flex-1 items-center gap-1"
      >
        <span dir="auto" className="truncate">
          {triggerLabel}
        </span>
        {extra > 0 ? (
          <span dir="ltr" className="tabular shrink-0">
            +{formatValue(extra, numeralLocale)}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className="flex size-4 shrink-0 rotate-0 items-center justify-center opacity-50 transition-transform group-hover/search-select-trigger:opacity-70 group-data-[state=open]/search-select-trigger:rotate-180 group-data-[state=open]/search-select-trigger:opacity-70"
      >
        <Icon icon={ChevronDownIcon} />
      </span>
    </button>
  );

  const row = (option: SearchSelectOption<T>): React.JSX.Element => {
    const selected = values.includes(option.value);
    const check = (
      <CheckBox checked={selected} leading={props.multiple === true} />
    );
    return (
      <ListboxItem
        key={option.value}
        value={option.value}
        keywords={optionKeywords(option)}
        selected={selected}
        disabledReason={option.disabledReason}
        onSelect={() => choose(option)}
      >
        {props.multiple ? check : null}
        {option.icon != null ? (
          <span
            aria-hidden
            className="flex size-4 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-4"
          >
            {option.icon}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span data-slot="search-select-label" dir="auto" className="truncate">
            {option.label}
          </span>
          {option.description != null ? (
            <span
              data-slot="search-select-description"
              className="truncate text-caption text-muted-foreground"
            >
              {option.description}
            </span>
          ) : null}
          {option.disabledReason != null ? (
            <span
              data-slot="search-select-reason"
              className="text-caption text-muted-foreground"
            >
              {option.disabledReason}
            </span>
          ) : null}
        </span>
        {option.badge != null ? (
          <span data-slot="search-select-badge" className="flex shrink-0">
            {option.badge}
          </span>
        ) : null}
        {props.multiple ? null : check}
      </ListboxItem>
    );
  };

  const failed = answer?.failed === true;
  const emptyText = failed
    ? (labels.error ?? labels.empty)
    : idle
      ? (labels.typeToSearch ?? labels.empty)
      : labels.empty;
  const panel = (
    <Listbox
      dir={dir}
      search={query}
      onSearchChange={setQuery}
      shouldFilter={!server}
      className="min-h-0"
    >
      <ListboxInput
        ref={inputRef}
        searchable={searchable}
        placeholder={labels.searchPlaceholder}
        aria-label={searchable ? labels.searchPlaceholder : labels.placeholder}
      />
      <ListboxList
        aria-multiselectable={props.multiple ? true : undefined}
        aria-busy={loading ? true : undefined}
        data-stale={stale ? "true" : undefined}
        className="min-h-0"
        style={{ maxHeight: "none" }}
      >
        {loading ? (
          <ListboxLoading
            className={stale ? "justify-start px-3 py-2" : undefined}
          >
            {labels.loading}
          </ListboxLoading>
        ) : null}
        {loading && !stale ? null : (
          <div
            data-slot="search-select-rows"
            className={cn(
              "transition-opacity duration-100",
              stale && "opacity-60",
            )}
          >
            {loading ? null : <ListboxEmpty>{emptyText}</ListboxEmpty>}
            {showNone ? (
              <ListboxGroup>
                <ListboxItem
                  value={noneValue}
                  keywords={[labels.none ?? ""]}
                  selected={!props.multiple && empty}
                  onSelect={clear}
                >
                  {props.multiple ? <CheckBox checked={false} leading /> : null}
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {labels.none}
                  </span>
                  {props.multiple ? null : (
                    <CheckBox checked={empty} leading={false} />
                  )}
                </ListboxItem>
              </ListboxGroup>
            ) : null}
            {groupOptions(listed).map((group) => (
              <ListboxGroup key={group.heading ?? ""} heading={group.heading}>
                {group.options.map(row)}
              </ListboxGroup>
            ))}
            {showCreate ? (
              <ListboxGroup>
                <ListboxItem
                  value={createValue}
                  keywords={[trimmed]}
                  onSelect={create}
                >
                  <span dir="auto" className="min-w-0 flex-1 truncate">
                    {labels.create?.(trimmed) ?? trimmed}
                  </span>
                </ListboxItem>
              </ListboxGroup>
            ) : null}
          </div>
        )}
      </ListboxList>
      {full && labels.keepTyping != null ? (
        <p
          data-slot="search-select-more"
          className="shrink-0 border-t border-border px-3 py-2 text-caption text-muted-foreground"
        >
          {labels.keepTyping}
        </p>
      ) : null}
      {footer != null ? (
        <div
          data-slot="search-select-footer"
          className="flex shrink-0 flex-col border-t border-border p-1"
        >
          {footer({
            query,
            close,
            options: pickable,
            values,
            selectAll,
            clear,
          })}
        </div>
      ) : null}
    </Listbox>
  );

  let control: React.ReactNode;
  if (narrow) {
    control = (
      <Sheet
        side="bottom"
        open={open}
        onOpenChange={setOpen}
        noBodyStyles={insideSheet}
      >
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          id={contentId}
          aria-describedby={undefined}
          dir={dir}
          style={{
            height: "calc(100dvh - 1rem)",
            maxHeight: "calc(100dvh - 1rem)",
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
            <SheetTitle className="min-w-0 truncate">
              {labels.title ?? labels.placeholder}
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="xl">
                {labels.close}
              </Button>
            </SheetClose>
          </div>
          {panel}
        </SheetContent>
      </Sheet>
    );
  } else {
    control = (
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          id={contentId}
          aria-labelledby={props["aria-labelledby"]}
          aria-label={
            props["aria-labelledby"] != null
              ? undefined
              : (labels.title ?? props["aria-label"] ?? labels.placeholder)
          }
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="flex flex-col overflow-hidden p-0"
          style={{
            width: "var(--radix-popover-trigger-width)",
            minWidth: "14rem",
            maxWidth: "var(--radix-popover-content-available-width)",
            maxHeight:
              "min(24rem, var(--radix-popover-content-available-height))",
          }}
          onCloseAutoFocus={restoreTriggerFocus}
        >
          {panel}
        </PopoverContent>
      </Popover>
    );
  }

  if (closed == null) return <>{control}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-slot="search-select-trigger-closed"
          tabIndex={0}
          className={cn("inline-flex cursor-default", className)}
        >
          {control}
        </span>
      </TooltipTrigger>
      <TooltipContent>{closed}</TooltipContent>
    </Tooltip>
  );
}

export { SearchSelect };
