"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { CheckIcon } from "../icons/catalogue";
import { BanIcon, LoaderIcon } from "../icons/general";
import type { IconComponent } from "../icons/house-icon";
import { CloseIcon } from "../icons/shell";
import { ClockIcon } from "../icons/system";
import { useConversationHold } from "./conversation";
import { Icon } from "./icon";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
  type TraceStatus,
} from "./trace";

/* The Sirdab tool step: one line saying what the assistant did, "✓ Looked at
   14 orders", with what it read or changed folded behind it. It is a Trace
   line (trace.tsx): the same row every agent step in the product draws, so
   a tool call, the build's stages and its files read as one list.

   States (the icon carries them; the label never changes colour except
   failure, which reports in the destructive text tone):
     running            spinner, the label shimmers (trace `running`)
     done               check
     failed             cross, destructive text (trace `error`)
     awaiting_approval  clock; the approval card sits below the row
     denied             ban
     expired            clock

   No children means no chevron and no button: a step with nothing behind
   it must not look like it opens. Opening one holds the conversation's
   scroll, so the detail unfolds under the reader's eye.

   Usage:
       <Tool state="done" label={t("steps.list_orders.done", { count })}>
           <OrdersTable ... />
           <ToolDetail title={t("details.output")} value={output} />
       </Tool>
*/
type ToolState =
  "running" | "done" | "failed" | "awaiting_approval" | "denied" | "expired";

const STATE_ICON: Record<ToolState, IconComponent> = {
  running: LoaderIcon,
  done: CheckIcon,
  failed: CloseIcon,
  awaiting_approval: ClockIcon,
  denied: BanIcon,
  expired: ClockIcon,
};

function traceStatus(state: ToolState): TraceStatus | undefined {
  if (state === "running") return "running";
  if (state === "failed") return "error";
  return undefined;
}

interface ToolProps extends Omit<
  React.ComponentProps<typeof TraceCollapsible>,
  "children"
> {
  state: ToolState;
  /** The step's words, already interpolated by the caller. */
  label: string;
  /** What opens under the row. Absent: a static row. */
  children?: React.ReactNode;
}

function StepLine({
  state,
  label,
}: {
  state: ToolState;
  label: string;
}): React.JSX.Element {
  return (
    <TraceLine status={traceStatus(state)}>
      <TraceIcon>
        <Icon
          icon={STATE_ICON[state]}
          className={cn(
            state === "running" && "animate-spin motion-reduce:animate-none",
          )}
        />
      </TraceIcon>
      <TraceTitle>{label}</TraceTitle>
    </TraceLine>
  );
}

function Tool({
  state,
  label,
  children,
  className,
  ...props
}: ToolProps): React.JSX.Element {
  /* data-tool-state, not data-state: Radix owns data-state on the
       Collapsible (open/closed) and would clobber it. */
  const hold = useConversationHold();
  if (children == null) {
    return (
      <Trace data-slot="tool" data-tool-state={state} className={className}>
        <StepLine state={state} label={label} />
      </Trace>
    );
  }
  return (
    <Trace data-slot="tool" data-tool-state={state} className={className}>
      <TraceCollapsible
        {...props}
        onOpenChange={(open) => {
          hold();
          props.onOpenChange?.(open);
        }}
      >
        <TraceCollapsibleTrigger>
          <StepLine state={state} label={label} />
        </TraceCollapsibleTrigger>
        {/* Its artifacts and JSON wells carry their own ground, so
                    the detail keeps the foreground rather than the
                    trace's muted text. */}
        <TraceCollapsibleContent
          data-slot="tool-content"
          className="flex flex-col gap-3 text-foreground"
        >
          {children}
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

interface ToolDetailProps extends Omit<
  React.ComponentProps<"div">,
  "children" | "title"
> {
  /** The block's heading, caller-worded ("What it read"). */
  title: string;
  /** Printed as-is when a string, as indented JSON otherwise. */
  value: unknown;
}

/* The verbose view: exactly what the tool received or returned, for the
   merchant (or us) who wants to check the assistant's work. Always LTR:
   it is JSON, and a flipped brace reads as broken. */
function ToolDetail({
  title,
  value,
  className,
  ...props
}: ToolDetailProps): React.JSX.Element {
  const text: string =
    typeof value === "string" ? value : (JSON.stringify(value, null, 2) ?? "");
  return (
    <div
      data-slot="tool-detail"
      className={cn("flex min-w-0 flex-col gap-1", className)}
      {...props}
    >
      <p className="text-caption text-muted-foreground">{title}</p>
      <pre
        dir="ltr"
        className="bg-surface-whisper text-caption-quiet max-h-64 overflow-auto rounded-lg p-3 font-mono text-foreground"
      >
        {text}
      </pre>
    </div>
  );
}

export { Tool, ToolDetail };
export type { ToolDetailProps, ToolProps, ToolState };
