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

/* The Sirdab trace: the steps an agent takes, one line each. Taken from
   shadcn's Trace (the radix build) and trued: physical sides became logical
   ones so a line reads right in Arabic, the chevron is the house glyph and
   flips with the reading direction, the type is the house body and the
   description the subtle tone, the content opens on the collapsible
   keyframes, and no part sets `outline-none` (focus is the global ring).

   Every agent step is the same shape: an icon that names the action, a
   one-sentence title, optional secondary text, and a status.
     none       done: "Looked at 14 orders"
     running    under way, title in the present tense; the title shimmers
     error      failed, and the title says so; destructive text
     pending    not started yet (a plan step); dimmed

   TraceLine is only ever the line: a span, not a tab stop. To make it do
   something, wrap it in that thing's trigger (TraceCollapsibleTrigger to
   fold detail under it, a link, a dialog's trigger). Trace lays out any
   trigger or link that wraps a line, so put rows that sit together in one.
   The line brightens on hover under TraceCollapsibleTrigger; another
   wrapper that wants it adds `group/trace-trigger` (the token lint keeps
   shadcn's arbitrary in-a-or-button variant out).

   The status shows in colour and motion, so the title must say it too
   ("Failed to publish", not "Publish" in red). TraceIcon is hidden from
   assistive tech: the title is the accessible name.

   Usage:
       <Trace>
           <TraceLine status="running">
               <TraceIcon><Icon icon={LoaderIcon} /></TraceIcon>
               <TraceTitle>Looking at your orders</TraceTitle>
           </TraceLine>
           <TraceCollapsible>
               <TraceCollapsibleTrigger>
                   <TraceLine>
                       <TraceIcon><Icon icon={CheckIcon} /></TraceIcon>
                       <TraceTitle>Looked at 14 orders</TraceTitle>
                   </TraceLine>
               </TraceCollapsibleTrigger>
               <TraceCollapsibleContent>…</TraceCollapsibleContent>
           </TraceCollapsible>
       </Trace>
*/

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

/* Before the title it names the action; after it, it is the indicator. */
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

/* One sentence on one line: it truncates, and shimmers while running. */
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

/* A count, a duration, a time: after the title, never truncated. */
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

/* The button that folds the row; it adds the chevron after the line,
   pointing along the reading direction and down once open. */
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

/* The detail under a folded row, behind a guide line that starts under the
   row's icon. Text inside is muted; a block with its own ground (a table,
   a code well) sets text-foreground to keep its contrast. */
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
