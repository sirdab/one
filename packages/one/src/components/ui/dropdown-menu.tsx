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

/* The Sirdab dropdown menu. It does THINGS: Edit, Duplicate, Delete. The
   third leg of the disclosure split: a Select SETS A VALUE, a Filter
   NARROWS A VIEW, a menu ACTS. role=menu semantics. Rows are INK at rest:
   a menu the merchant opened is the focus of the screen, so its choices
   read as primary text, never as secondary grey. Highlight adds the ghost
   fill. Group labels stay quiet; they name the rows, they are not choices.
   Row colours SNAP (no transition class, the instant tier); the PANEL
   comes and goes on overlayPanelMotion like every other floating panel.

   Panel: the frosted popover treatment (overlayPanelChrome) at the menu
   radius (12px, one step softer than the picker's 10), p-1 with 2px row
   gaps.

   Marking a CURRENT choice (a language menu, a density menu) uses
   DropdownMenuRadioGroup/RadioItem: the selected row holds a STATIC
   alpha-100 fill and ink text, no check glyph; the fill IS the mark.

   The trigger is the caller's Button (ghost for icon-only "⋯" actions,
   secondary for labelled ones) via asChild. SUBMENUS: ONE level of Sub is
   allowed, for grouped preference sets (the account menu's language).
   SubTrigger wears the item chrome plus a trailing chevron
   that flips in RTL; SubContent is the same frosted panel. Anything
   deeper than one level still needs a redesign, not a third tier.

   Usage:
       <DropdownMenu>
           <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" aria-label="خيارات">
                   <Icon icon={Ellipsis} />
               </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent>
               <DropdownMenuItem onSelect={…}>تعديل</DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onSelect={…}>حذف</DropdownMenuItem>
           </DropdownMenuContent>
       </DropdownMenu>
*/

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

/* A menu is a list, and a list can outgrow the screen. Radix publishes the
   room it actually has; nothing here read it, so a menu of every section a
   store owns simply ran off the bottom edge with no way to reach the rest,
   on a desktop as much as on a phone. Select has capped itself against the
   equivalent var all along; the menu is the one that never did.

   touch-pan-y + overscroll-contain are the phone half of the same fix. A menu
   can open inside a body that vaul has pinned with `position: fixed` for its
   iOS scroll lock (the nav drawer, any tray), and iOS Safari then hands the
   drag to that pinned body rather than to the menu under the finger. */
const MENU_AVAILABLE_HEIGHT =
  "var(--radix-dropdown-menu-content-available-height)";
/* The panel is the frosted chrome (its ::before carries the surface and
   the blur) and never scrolls; an inner viewport does. A ::before laid over
   a scrolling box is sized to the visible box and scrolls away with the
   content, which would leave a long menu bare past its first screen. */
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
  /** The panel's color scheme when it should differ from the page's (the
        account menu is dark); Popover's prop of the same name. */
  scheme?: "dark";
}) {
  trackFocusModality();
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        /* Click-away must not leave a focus ring on the trigger; see
                   restoreTriggerFocus. Escape still rings. */
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          restoreTriggerFocus(event);
        }}
        className={cn(
          overlayPanelChrome,
          // rounded-xl overrides the panel chrome's 10px on both
          // the box and its frost pseudo. Menus are the 12px
          // tier.
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

/* The menu row recipe, shared by Item and RadioItem: ink at rest,
   highlight = ghost fill, colours SNAP. */
const menuItemChrome = cn(
  overlayItemChrome,
  "data-highlighted:bg-btn-ghost-surface-hover text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg:not([class*='size-'])]:size-4",
);

/* `destructive` is the row that loses something (delete): red at rest and
   under the highlight, on the destructive button's own wash, so it reads as
   the dangerous one before the pointer gets there. Sit it last, after a
   separator. It still opens a confirm; the colour is a warning, not the
   guard. */
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
      /* The content stacks its CHILDREN at gap-0.5, but a radio group
               is one child holding many rows, so without its own gap the
               selected row's static fill welds to the hovered neighbour's. */
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
        // The current choice holds a STATIC alpha-100 fill and ink
        // text, no check glyph; the fill is the mark.
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
  /** Match the menu it opens from: a submenu portals out of it. */
  scheme?: "dark";
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(
          overlayPanelChrome,
          // The same 12px-tier frosted panel as the root menu.
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
