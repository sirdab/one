"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { ChevronRightIcon } from "../icons/catalogue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { Icon } from "./icon";

type TraceStatus = "running" | "error" | "pending";

function Trace({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-lg *:has-[>[data-slot=trace-line]]:text-start",
        className,
      )}
      {...props}
    />
  );
}

function TraceLine({
  className,
  status,
  ...props
}: React.ComponentProps<"span"> & {
  status?: TraceStatus;
}): React.JSX.Element {
  return (
    <span
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "text-body text-muted-foreground data-[status=error]:text-destructive data-[status=error]:group-hover/trace-trigger:text-destructive data-[status=running]:*:data-[slot=trace-title]:shimmer flex w-fit max-w-full min-w-0 items-center gap-2 transition-colors duration-100 group-hover/trace-trigger:text-foreground data-[status=pending]:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

function TraceIcon({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ms-1",
        className,
      )}
      {...props}
    />
  );
}

function TraceTitle({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="trace-title"
      className={cn("min-w-0 truncate", className)}
      {...props}
    />
  );
}

function TraceDescription({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="trace-description"
      className={cn("text-subtle shrink-0 tabular-nums", className)}
      {...props}
    />
  );
}

function TraceCollapsible({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof Collapsible>,
  "asChild"
>): React.JSX.Element {
  return (
    <Collapsible
      data-slot="trace-collapsible"
      className={cn("flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  );
}

function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof CollapsibleTrigger>,
  "asChild"
>): React.JSX.Element {
  return (
    <CollapsibleTrigger
      data-slot="trace-collapsible-trigger"
      className={cn(
        "group/trace-trigger text-muted-foreground has-[[data-status=error]]:text-destructive flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-lg text-start transition-colors duration-100 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <TraceIcon className="transition-transform duration-200 group-aria-expanded/trace-trigger:rotate-90 motion-reduce:transition-none rtl:group-aria-expanded/trace-trigger:-rotate-90">
        <Icon icon={ChevronRightIcon} flip />
      </TraceIcon>
    </CollapsibleTrigger>
  );
}

function TraceCollapsibleContent({
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof CollapsibleContent>,
  "asChild"
>): React.JSX.Element {
  return (
    <CollapsibleContent
      data-slot="trace-collapsible-content"
      className="min-w-0"
      {...props}
    >
      <div
        data-slot="trace-collapsible-content-inner"
        className={cn(
          "border-border text-muted-foreground ms-2 mt-2 mb-1 min-w-0 border-s ps-4 pe-1 leading-relaxed wrap-break-word",
          className,
        )}
      >
        {children}
      </div>
    </CollapsibleContent>
  );
}

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
};
export type { TraceStatus };
