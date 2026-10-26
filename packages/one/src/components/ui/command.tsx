"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "../../lib/utils";
import { overlayItemChrome } from "./overlay";

/* The Sirdab command list, the searchable menu (cmdk), built to live
   inside the frosted popover: the panel stays translucent, but the SEARCH
   HEADER goes SOLID (bg-popover) so the frost never shows through the
   input row. Only the header solidifies; the rest of the panel keeps
   the frost. (Scrolling happens in
   CommandList BELOW the header, so nothing can pass under it.) The input
   row is a bare 40px field with a hairline below and NO search
   icon. Items match select items: ghost-fill
   highlight, 16px leading icons at a 12px gap (gap-3: overlayItemChrome's
   gap-2 is the indicator column's; Select gets its 12px inside ItemText),
   400-weight labels, quiet caption group headings; the list hides its
   scrollbar and caps at min(280px, available − header).

   Usage for the searchable select (combobox):
       <Popover>
           <PopoverTrigger asChild>
               <Button variant="secondary" className="w-56 justify-between">…</Button>
           </PopoverTrigger>
           <PopoverContent className="w-56 p-0">
               <Command>
                   <CommandInput placeholder="ابحث…" />
                   <CommandList>
                       <CommandEmpty>ما فيه نتائج</CommandEmpty>
                       <CommandGroup>
                           <CommandItem value="…" onSelect={…}>…</CommandItem>
                       </CommandGroup>
                   </CommandList>
               </Command>
           </PopoverContent>
       </Popover>
*/
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
      // The one OPAQUE strip on the frosted panel (bg-popover, no
      // /90): options scroll inside CommandList BELOW this header,
      // never under it, so no sticky positioning is needed. The
      // solid fill is purely against the frost showing through.
      className="border-border bg-popover flex items-center border-b"
    >
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          // placeholder:text-subtle, the placeholder role, same
          // as Input (kept over a one-tone-higher variant; the
          // house rule wins for consistency [decision]).
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
        /* touch-pan-y + overscroll-contain, and on a phone they are
                   what makes this a scroller at all. A command list opens
                   inside a body that vaul has pinned with `position: fixed`
                   for its iOS scroll lock (the nav drawer, any tray), and iOS
                   Safari then hands the drag to that pinned body instead of to
                   the list under the finger: the list ends wherever the cap cut
                   it and the rest is unreachable. Claiming the vertical axis
                   and refusing to chain the gesture outward keeps it here. */
        "no-scrollbar touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain",
        className,
      )}
      // 280px cap; the 5.5rem subtraction reserves room for the
      // panel's fixed chrome when the popover reports its available
      // height: the 41px search header plus the panel's viewport
      // margins and breathing room below. A structural measurement,
      // not a design value, so it lives in style.
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

/* cmdk shows Empty only when no item is rendered. `always` is for a panel
   that keeps an item of its own (an add row) under a list that matched
   nothing: the caller decides when it shows. */
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
      // Direct-child icon sizing so a nested action control's icons
      // are never inflated; explicit size-* always wins.
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
