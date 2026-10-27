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

  label: string;

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
  title: string;

  value: unknown;
}

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
