"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "../../lib/utils";
import { overlayItemChrome } from "./overlay";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-lg bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"

      className="border-border bg-popover flex items-center border-b"
    >
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "h-control-xl text-body-lg placeholder:text-subtle sm:text-body-quiet w-full bg-transparent px-3 outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain",
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

const COMMAND_EMPTY = "py-6 text-center text-body text-muted-foreground";

function CommandEmpty({
  className,
  always = false,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty> & {
  always?: boolean;
}) {
  if (always) {
    return (
      <div
        data-slot="command-empty"
        role="presentation"
        className={cn(COMMAND_EMPTY, className)}
        {...props}
      />
    );
  }
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(COMMAND_EMPTY, className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "**:[[cmdk-group-heading]]:text-caption **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"

      className={cn(
        overlayItemChrome,
        "aria-selected:bg-btn-ghost-surface-hover gap-3 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&>svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
};
