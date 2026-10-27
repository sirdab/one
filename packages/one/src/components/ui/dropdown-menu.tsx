"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import {
  restoreTriggerFocus,
  trackFocusModality,
} from "../../lib/restore-trigger-focus";
import { cn } from "../../lib/utils";
import { ChevronRightIcon } from "../icons/catalogue";
import {
  overlayItemChrome,
  overlayPanelChrome,
  overlayPanelMotion,
} from "./overlay";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

const MENU_AVAILABLE_HEIGHT =
  "var(--radix-dropdown-menu-content-available-height)";

const menuScroller =
  "no-scrollbar flex min-h-0 flex-1 touch-pan-y flex-col gap-0.5 overflow-y-auto overscroll-contain p-1";

function DropdownMenuContent({
  className,
  sideOffset = 4,
  onCloseAutoFocus,
  style,
  scheme,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  scheme?: "dark";
}) {
  trackFocusModality();
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}

        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          restoreTriggerFocus(event);
        }}
        className={cn(
          overlayPanelChrome,

          "z-popover flex min-w-32 flex-col overflow-hidden rounded-xl before:rounded-xl",
          overlayPanelMotion,
          scheme === "dark" && "dark text-foreground",
          className,
        )}
        style={{
          maxHeight: MENU_AVAILABLE_HEIGHT,
          ...style,
        }}
        {...props}
      >
        <div data-slot="dropdown-menu-viewport" className={menuScroller}>
          {children}
        </div>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

const menuItemChrome = cn(
  overlayItemChrome,
  "data-highlighted:bg-btn-ghost-surface-hover text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg:not([class*='size-'])]:size-4",
);

function DropdownMenuItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        menuItemChrome,
        variant === "destructive" &&
          "text-btn-destructive data-highlighted:bg-btn-destructive/10 data-highlighted:text-btn-destructive",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuRadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"

      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        menuItemChrome,

        "data-[state=checked]:bg-gray-alpha-100 data-[state=checked]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("text-label text-muted-foreground px-2 py-1", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        menuItemChrome,
        "data-[state=open]:bg-btn-ghost-surface-hover data-[state=open]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto size-4 rtl:-scale-x-100" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  style,
  scheme,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> & {
  scheme?: "dark";
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(
          overlayPanelChrome,

          "z-popover flex min-w-32 flex-col overflow-hidden rounded-xl before:rounded-xl",
          overlayPanelMotion,
          scheme === "dark" && "dark text-foreground",
          className,
        )}
        style={{
          maxHeight: MENU_AVAILABLE_HEIGHT,
          ...style,
        }}
        {...props}
      >
        <div data-slot="dropdown-menu-viewport" className={menuScroller}>
          {children}
        </div>
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
