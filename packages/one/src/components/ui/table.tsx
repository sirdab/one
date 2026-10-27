import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronUpDownIcon,
} from "../icons/general";
import { Icon } from "./icon";

const FILL = "w-full max-w-0" as const;

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(
          "text-body w-full border-separate border-spacing-0",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableRow({
  interactive = false,
  selected,
  tone = "default",
  className,
  ...props
}: React.ComponentProps<"tr"> & {
  interactive?: boolean;

  selected?: boolean;

  tone?: "default" | "destructive" | "warning" | "muted";
}) {
  return (
    <tr
      data-slot="table-row"
      data-interactive={interactive ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-tone={tone === "default" ? undefined : tone}
      className={cn(
        "group/row",
        tone === "muted" && "text-muted-foreground",
        (interactive || selected !== undefined) && "relative",
        interactive && "cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

const GUTTER =
  "px-2 md:px-4 first:ps-0 last:pe-0 md:first:ps-2 md:last:pe-2" as const;

const BAND_GUTTER =
  'px-2 md:px-4 [td:first-child>&]:ps-0 [td:last-child>&]:pe-0 md:[td:first-child>&]:ps-2 md:[td:last-child>&]:pe-2 max-sm:[td:nth-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:ps-0 max-sm:[td:nth-last-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:pe-0' as const;

const BAND_CORNERS =
  '[td:first-child>&]:rounded-s-xl [td:last-child>&]:rounded-e-xl max-sm:[td:nth-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:rounded-s-xl max-sm:[td:nth-last-child(1_of_:not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"]))>&]:rounded-e-xl' as const;

const BAND_FILL =
  "group-not-data-selected/row:group-data-[tone=destructive]/row:bg-destructive-subtle group-not-data-selected/row:group-data-[tone=warning]/row:bg-warning-subtle group-data-interactive/row:group-not-data-selected/row:group-hover/row:bg-row-surface-hover group-data-selected/row:bg-row-surface-selected group-data-selected/row:group-data-interactive/row:group-hover/row:bg-row-surface-selected-hover" as const;

const NUMERIC_HEAD = "text-end rtl:text-start" as const;
const NUMERIC_BAND = "tabular justify-end rtl:justify-start" as const;

type TableSort = "ascending" | "descending" | "none";

function TableHead({
  numeric = false,
  fill = false,
  sort,
  className,
  ...props
}: React.ComponentProps<"th"> & {
  numeric?: boolean;

  fill?: boolean;

  sort?: TableSort;
}) {
  return (
    <th
      data-slot="table-head"
      aria-sort={sort}
      className={cn(
        "h-control-xl border-row-divider text-label text-muted-foreground border-b text-start align-middle",
        GUTTER,
        numeric && NUMERIC_HEAD,
        fill && FILL,

        sort !== undefined && "pointer-coarse:h-control-touch",
        className,
      )}
      {...props}
    />
  );
}

function TableSortLink({
  asChild = false,
  sort,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  sort: TableSort;

  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";
  const idle = sort === "none";

  return (
    <Comp
      data-slot="table-sort-link"

      className={cn(
        "group/sort touch-target relative inline-flex max-w-full items-center gap-1 rounded-sm whitespace-nowrap hover:text-foreground",
        className,
      )}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      <Icon
        icon={
          sort === "ascending"
            ? ArrowUpIcon
            : sort === "descending"
              ? ArrowDownIcon
              : ChevronUpDownIcon
        }
        data-slot="table-sort-glyph"

        className={cn(
          "size-3.5 shrink-0 transition-opacity duration-100 motion-reduce:transition-none",
          idle &&
            "opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100 pointer-coarse:opacity-100",
        )}
      />
    </Comp>
  );
}

function TableCell({
  multiline = false,
  numeric = false,
  fill = false,
  className,
  children,
  ...props
}: React.ComponentProps<"td"> & {
  numeric?: boolean;

  multiline?: boolean;

  fill?: boolean;
}) {
  return (
    <td
      data-slot="table-cell"

      className={cn(
        "border-row-divider border-b p-0",
        multiline ? "align-top" : "align-middle",
        fill && FILL,
        className,
      )}
      {...props}
    >
      <div
        data-slot="table-cell-band"
        className={cn(
          "my-1.5 flex min-w-0 items-center gap-2 *:min-w-0",
          multiline ? "py-3" : "h-row",
          BAND_FILL,
          BAND_CORNERS,
          BAND_GUTTER,
          numeric && NUMERIC_BAND,
        )}
      >
        {children}
      </div>
    </td>
  );
}

function TableRowLink({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";

  return (
    <Comp
      data-slot="table-row-link"
      className={cn("truncate after:absolute after:inset-0", className)}
      {...props}
    />
  );
}

function TableRowActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-row-actions"
      className={cn(
        "z-raised relative flex items-center justify-end gap-1",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
  TableRowLink,
  TableSortLink,
};
export type { TableSort };
