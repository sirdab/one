import * as React from "react";

import { cn } from "../../lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreIcon,
} from "../icons/catalogue";
import { Button } from "./button";
import { Icon } from "./icon";

/* The Sirdab pagination, from shadcn's, trued: pages are Buttons (ghost, the
   current one outline), so they press, hover and focus like every other
   control. A page can be a link (asChild) or a plain button for a list that
   pages in the browser. Previous and next are glyphs that mirror in Arabic.
   Primitives take no strings: every label comes from the caller.

   Usage:
       <Pagination aria-label={t("pages")}>
           <PaginationContent>
               <PaginationItem>
                   <PaginationPrevious aria-label={t("previous")} disabled={page === 1} onClick={…} />
               </PaginationItem>
               <PaginationItem>
                   <PaginationLink isActive onClick={…}>1</PaginationLink>
               </PaginationItem>
               …
           </PaginationContent>
       </Pagination>
*/
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  isActive = false,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { isActive?: boolean }) {
  return (
    <Button
      data-slot="pagination-link"
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "outline" : "ghost"}
      size="icon"
      className={cn("latin tabular-nums", className)}
      {...props}
    />
  );
}

function PaginationPrevious(
  props: Omit<React.ComponentProps<typeof Button>, "children">,
) {
  return (
    <Button variant="ghost" size="icon" {...props}>
      <Icon icon={ChevronLeftIcon} flip />
    </Button>
  );
}

function PaginationNext(
  props: Omit<React.ComponentProps<typeof Button>, "children">,
) {
  return (
    <Button variant="ghost" size="icon" {...props}>
      <Icon icon={ChevronRightIcon} flip />
    </Button>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "h-control text-muted-foreground flex aspect-square items-center justify-center",
        className,
      )}
      {...props}
    >
      <Icon icon={MoreIcon} />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
