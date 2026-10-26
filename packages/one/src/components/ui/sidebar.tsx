"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Direction, Slot } from "radix-ui";

import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../lib/utils";
import { SidebarIcon } from "../icons/system";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

/* The Sirdab Sidebar. shadcn's sidebar family, trued onto the foundation:
   structure and behavior (provider, cookie persistence, icon collapse,
   the mobile Sheet) are stock; every value is ours. Stock's ⌘B toggle
   shortcut is REMOVED: the trigger is the only toggle here, and a host
   that wants a chord binds it against its own state (the studio shell
   does). The other deviations, and why:

   - WIDTHS come from the shell frame tokens (w-shell-rail 256px,
     w-shell-rail-icon 60px), not per-instance --sidebar-width style vars:
     the shell has ONE rail geometry, set in foundation, and the private
     vars were unlintable var-shorthand. The mobile drawer takes the
     Sheet's own width.
   - COLORS are the sidebar aliases in foundation's tailwind glue:
     bg-sidebar = the rail tint (the one tinted surface), sidebar-accent =
     gray-alpha-100 (the nav recipe's fill: hover and active are the SAME
     rung, text lights to foreground). data-[active=true] adds no weight,
     no louder active state, ever.
   - MOTION is 300ms, the drawer rung (the ladder's 150ms sidebar slide
     reads too fast at this rail width).
     The label fade must stay on the same duration as the width slide
     or the two desync visibly.
   - PEEK (`peek`, offcanvas only): the hidden container slides back in
     over the page with the popover shadow while the gap stays w-0, so
     the layout never moves. It runs at the 200 rung, not the rail's
     300: a panel over content is lighter than a reflow. The host owns
     WHEN (a hot strip, a dwell timer); the primitive only draws it.
   - INERT: a collapsed offcanvas container is `inert`. The translate
     hides it from sight and from nothing else; without this, Tab walks
     into a nav that is off screen. Peeked or expanded it is reachable
     again. The icon rail is never inert: it never leaves the screen and
     its rows are real tab stops. Reduced motion needs nothing here: the
     foundation's global rule already collapses every transition.
   - THE PHONE DRAWER closes when a link inside it is tapped (stock leaves
     it open over the page it just navigated to); see navigatesHere.
   - ROW TOOLTIPS belong to the icon rail, where the label is gone. An
     offcanvas rail keeps its labels whenever it is on screen (expanded
     or peeked), so its rows show none, whatever the state says.
   - FOCUS is the global focus-visible outline; the stock outline-hidden +
     ring pair is deleted (doctrine: nothing sets outline-none).
   - TYPE is the roles, and the rail is ONE column of it: group labels are
     set in the same text-body as the rows they introduce rather than a
     step down. Both are solid --muted-foreground, never foreground/70
     alpha (Arabic joins double-paint).
   - The offcanvas hide is a translate, not a left-calc (arbitrary
     values are forbidden); side="left"/"right" positioning stays
     physical and the HOST picks the side per direction, like stock.

   Only the parts the shell actually uses are kept; stock's group
   actions, badges, sub-menus, inset and rail are NOT carried. Re-add one
   from shadcn, trued, the day a screen needs it.

   Stock's `variant` props are gone in both places, and not merely as
   unused surface: they encode a DIFFERENT shell than ours. `inset`
   makes the main content a card while the rail stays outside it, but
   our lift takes the rail and the content up TOGETHER as one card.
   `floating` detaches the rail into its own card, which would put a
   second floating surface beside the workspace and break "the rail is
   the one tinted structural surface, flush to the edge". And the menu
   button's `outline` draws a bordered nav row, against the recipe's
   one rule (hover and current are the same fill, nothing louder).
   Neutral scales stay: `size` is just a row height and contradicts
   nothing.

   Compose the shell from SidebarProvider > Sidebar (header/content/menu)
   plus the host's own <main>; SidebarTrigger goes in the host topbar. */

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

/* Which physical edge THIS Sidebar sits on: SidebarProvider is the
   ancestor that owns open/collapsed state, but `side` is a prop on
   Sidebar itself, one level down, so it needs its own context. The
   collapsed rail's tooltip is the one consumer: it has to open into the
   workspace, away from the rail, on whichever edge that turns out to be. */
const SidebarSideContext = React.createContext<"left" | "right">("left");

/* Which collapse mode THIS Sidebar runs, for the same reason: the row
   tooltip exists for the ICON rail, where the label is gone. An offcanvas
   rail keeps its labels whenever it is on screen (expanded or peeked), so
   a tooltip there would say the word twice. Defaults to icon so a rail
   outside the desktop branch keeps today's behaviour. */
const SidebarCollapsibleContext = React.createContext<
  "offcanvas" | "icon" | "none"
>("icon");

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        /* A controlled host owns the state, so it owns persistence
                   too. Writing the cookie here as well would record a value
                   nothing reads and, when the host overrides open (the studio
                   view forces it shut), a value the rail never had. */
        setOpenProp(openState);
        return;
      }
      _setOpen(openState);

      /* Uncontrolled only: pair this with `defaultOpen` read from the
               same cookie on the server, or the rail still jumps on refresh. */
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  /* No TooltipProvider here. Stock wraps the whole subtree in one at
       delayDuration={0}, and our Tooltip defers to an ancestor provider, so a
       structural primitive would silently re-tune the hover delay of every
       hint in the host's shell. Tooltip self-wraps at the house 300ms when
       there is no provider, which is what we want. The rail's own rows DO
       want zero delay; that provider lives on SidebarMenu, where it reaches
       the nav and nothing else. */
  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/* A link tapped in the phone drawer is a navigation, and the drawer goes
   with it: the docked rail stays put beside the new page, but a drawer
   left open over it hid the page the merchant just asked for. A modified
   click or a new-tab link leaves this tab where it was, so the drawer
   stays too. Read off the DOM rather than a prop on every row, so a
   host's own links (a footer, a menu inside the rail) close it as well. */
function navigatesHere(event: React.MouseEvent): boolean {
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest("a[href]");
  if (link == null) return false;
  return link.getAttribute("target") !== "_blank";
}

function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  peek = false,
  scheme,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  collapsible?: "offcanvas" | "icon" | "none";
  /**
   * The rail's own color scheme when it differs from the page's (the
   * studio's ink rail beside a light page). The docked rail inherits it
   * from the host's scope, but the phone drawer portals out to <body>,
   * outside that scope, so the drawer has to carry it itself.
   */
  scheme?: "dark";
  /**
   * The hover reveal, offcanvas only: the container slides back in OVER
   * the page as a floating panel while the gap stays shut, so nothing
   * reflows. The host decides when (a hot strip, a timer); this draws it.
   */
  peek?: boolean;
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  // Same source the Sheet reads, so the two cannot disagree about which
  // edge is the start.
  const direction = Direction.useDirection();

  /* Offcanvas is the only mode that leaves the screen, so it is the only
       one where an off-screen nav can be tabbed into (inert) or asked back
       (peek). The icon rail stays on screen and its rows are tab stops. */
  const offcanvasCollapsed =
    collapsible === "offcanvas" && state === "collapsed";
  const offscreen = offcanvasCollapsed && !peek;
  const peeking = offcanvasCollapsed && peek;

  /* Off screen, the rail keeps the shape it left with. An icon rail that
       folds away (the shell switching from icon to offcanvas in one frame)
       would otherwise widen to the full rail WHILE it slides out, and narrow
       back WHILE it slides in: a grow-then-shrink on every crossing. Held as
       state, reconciled in render, so the frame that goes off screen still
       sees the shape it had on screen. */
  const [foldedAsIcon, setFoldedAsIcon] = React.useState(false);
  if (!offscreen) {
    const iconNow = collapsible === "icon" && state === "collapsed";
    if (iconNow !== foldedAsIcon) setFoldedAsIcon(iconNow);
  }
  const look =
    state !== "collapsed"
      ? ""
      : offscreen && foldedAsIcon
        ? "icon"
        : collapsible;

  if (collapsible === "none") {
    return (
      <SidebarSideContext.Provider value={side}>
        <div
          data-slot="sidebar"
          className={cn(
            "w-shell-rail bg-sidebar text-sidebar-foreground flex h-full flex-col",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarSideContext.Provider>
    );
  }

  if (isMobile) {
    return (
      <SidebarSideContext.Provider value={side}>
        {/* Our Sheet speaks LOGICAL sides and maps them to vaul's
                   physical ones per dir; this prop is PHYSICAL, so the
                   translation has to read dir too.

                   `side === "right" ? "end" : "start"` is only correct in
                   LTR. In RTL the host passes side="right" precisely BECAUSE
                   right is the inline start there, so that mapping says
                   "end", the Sheet resolves end-in-rtl back to physical left,
                   and the drawer comes out of the opposite edge from the rail
                   it replaces. Two correct translations composed into a wrong
                   one. */}
        <Sheet
          open={openMobile}
          onOpenChange={setOpenMobile}
          side={(side === "right") === (direction === "rtl") ? "start" : "end"}
        >
          <SheetContent
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            /* Capture, not bubble: a client-side link (next/link)
                           cancels the click to route itself, so by the time
                           it bubbled here it would look like no navigation. */
            onClickCapture={(event) => {
              if (navigatesHere(event)) setOpenMobile(false);
            }}
            className={cn(
              "w-shell-rail p-0 [&>button]:hidden",
              /* The same ground the docked dark rail stands on
                               (the host's frame), not the Sheet's own
                               surface, so the drawer is the rail it replaces. */
              scheme === "dark" && "dark bg-surface-sunken text-foreground",
            )}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      </SidebarSideContext.Provider>
    );
  }

  return (
    <SidebarSideContext.Provider value={side}>
      <SidebarCollapsibleContext.Provider value={collapsible}>
        <div
          className="group peer text-sidebar-foreground hidden md:block"
          data-state={state}
          data-collapsible={look}
          data-peek={peek ? "true" : undefined}
          data-side={side}
          data-slot="sidebar"
        >
          {/* This element reserves the sidebar's width in the flow. */}
          <div
            data-slot="sidebar-gap"
            className={cn(
              "w-shell-rail relative bg-transparent transition-all duration-300 ease-out",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              "group-data-[collapsible=icon]:w-shell-rail-icon",
              /* Off screen takes no room, whatever look the
                               rail is holding while it goes. */
              offscreen && "w-0!",
            )}
          />
          <div
            data-slot="sidebar-container"
            /* A translate hides nothing from the keyboard. */
            inert={offscreen}
            className={cn(
              "z-sticky w-shell-rail fixed inset-y-0 hidden h-svh transition-all duration-300 ease-out md:flex",
              "group-data-[collapsible=icon]:w-shell-rail-icon",
              side === "left" ? "left-0" : "right-0",
              /* The offcanvas hide, decided here rather than by a
                               group variant: the peek has to beat it, and two
                               group variants fighting over `translate` hand the
                               winner to Tailwind's emit order. */
              offscreen &&
                (side === "left" ? "-translate-x-full" : "translate-x-full"),
              /* Peeked, it is a floating panel over content: the
                               popover shadow, and the 200 rung instead of the
                               rail's 300, because a panel sliding over the page
                               is lighter than the layout reflowing under it. */
              peeking && "shadow-popover-sm duration-200",
              /* The rail's hairline is a PSEUDO-ELEMENT, not a border:
                               a border consumes 1px of the rail's usable width, which
                               throws off the icon-axis arithmetic inside it (a 60px
                               rail behaves as 59px, so centred things land half a
                               pixel out and bordered ones a whole pixel). This paints
                               in the same place and costs no layout. */
              "after:bg-border after:absolute after:inset-y-0 after:w-px group-data-[side=left]:after:right-0 group-data-[side=right]:after:left-0",
              className,
            )}
            {...props}
          >
            <div
              data-sidebar="sidebar"
              data-slot="sidebar-inner"
              className="bg-sidebar flex h-full w-full flex-col overflow-hidden"
            >
              {children}
            </div>
          </div>
        </div>
      </SidebarCollapsibleContext.Provider>
    </SidebarSideContext.Provider>
  );
}

function SidebarTrigger({
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, isMobile, open, openMobile } = useSidebar();
  const expanded = isMobile ? openMobile : open;

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      aria-label="Toggle sidebar"
      /* A control that shows and hides a region is a disclosure, so the
               state belongs on aria-expanded. Without it the only cue that the
               rail is collapsed is visual. */
      aria-expanded={expanded}
      /* Icon-only buttons take a label AND a hint (button.tsx's own
               rule), and here the hint has to name the RESULT rather than the
               control: "Toggle sidebar" tells you what the button is, not what
               pressing it will do to what you are looking at. It follows the
               state for the same reason. Before {...props}, so a host with a
               better word for its own rail can still override it. */
      hint={expanded ? "Collapse the sidebar" : "Expand the sidebar"}
      /* The double-headed resize cursor, not a pointer: this widens and
               narrows the rail, it does not navigate. Matches the collapsed
               rail's own expand affordance. */
      className={cn("cursor-ew-resize", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {/* Hosts with their own glyph pass it as children; the house
                sidebar glyph is only the default. */}
      {children ?? <SidebarIcon />}
    </Button>
  );
}
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        /* touch-pan-y + overscroll-contain: on a phone this list IS
                   the nav drawer's contents, and the drawer is a vaul Sheet
                   that pins the body with `position: fixed`. Without the two,
                   iOS Safari gives the drag to that pinned body and a rail
                   taller than the screen cannot be scrolled to its last row. */
        "flex min-h-0 flex-1 touch-pan-y flex-col gap-2 overflow-auto overscroll-contain group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-3", className)}
      {...props}
    />
  );
}
/* The heading over a group of rows. Stock's, trued to the house, and trued
   to the ROWS specifically: same text-body, same
   weight, same --muted-foreground as SidebarMenuButton, rather than stock's
   smaller caption at foreground-70%. A rail is one column of type; a heading
   set two steps down from the rows it introduces reads as a caption that
   fell in, not as the name of what follows. It separates itself by position
   and by having no icon, which is enough.

   Collapsed, the label LEAVES SIDEWAYS and its box stays put. The two
   obvious alternatives are wrong in opposite directions. Cancelling the
   label's height with a negative margin zeroes the band and leaves the group
   hard up against the list above it, so the icon rail becomes one undivided
   column and the grouping the label exists to express is gone exactly where
   a label cannot explain it. Keeping a short band and animating the height
   down to it restores the separation but reads wrong: type getting SHORTER
   while the rail gets narrower is a second axis of movement, and the only
   one in the rail going that way.

   So the height never changes at all. The label fades and nudges a hair along
   the rail's own axis, which is the same treatment every row label and the
   wordmark already get, and it mirrors under rtl for the same reason they do.
   Nothing in the column moves vertically on collapse: the rows hold their
   positions, the separation holds its size, and the only thing that happens is
   the width closing and the words going with it. */
/* A section's name. Collapsed to icons there is no room to spell it out,
   so the words compress away and a hairline spanning the group's inner width
   grows out of them: the rail still shows where one group ends and the next begins. The
   box keeps its height in both states, so the rows under it never jump while
   the rail slides. With asChild the host owns the markup, so it only fades. */
function SidebarGroupLabel({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  if (asChild) {
    return (
      <Slot.Root
        data-slot="sidebar-group-label"
        data-sidebar="group-label"
        className={cn(
          "text-body text-muted-foreground flex h-7 shrink-0 items-center overflow-hidden px-2 font-medium whitespace-nowrap transition-all duration-300 ease-out",
          "group-data-[collapsible=icon]:translate-x-1 group-data-[collapsible=icon]:opacity-0 rtl:group-data-[collapsible=icon]:-translate-x-1",
          className,
        )}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-body text-muted-foreground relative flex h-7 shrink-0 items-center px-2 font-medium whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {/* One morph, not a handover: both halves run on the rail's own
                300ms ease-out, so the words compress toward the inline-start
                edge while the line grows out of the same point, and the width
                closing drives both. The line is the label box's full width
                (inset-x-0, so only the group's p-3 bounds it) and scales from
                its start, which makes it track the rail as it narrows instead
                of being a fixed-width line pushed around. Origin flips under rtl.
                */}
      <span className="min-w-0 origin-left overflow-hidden transition-all duration-300 ease-out group-data-[collapsible=icon]:scale-x-0 group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none rtl:origin-right">
        {children}
      </span>
      <span
        aria-hidden
        className="bg-gray-alpha-400 pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 opacity-0 transition-all duration-300 ease-out group-data-[collapsible=icon]:scale-x-100 group-data-[collapsible=icon]:opacity-100 motion-reduce:transition-none rtl:origin-right"
      />
    </div>
  );
}

/* The nav is a CLUSTER, so it gets ONE provider at zero delay [Sirdab
   2026-08-01]. Collapsed, the label IS the tooltip: it is the only way to
   read the row, so making it wait feels like the rail is withholding the
   answer. Radix's skip-delay then keeps it instant while you run down the
   rail instead of re-waiting per row.

   Scoped HERE and not on SidebarProvider deliberately: stock wraps the whole
   subtree, which silently re-tunes every hint in the host's shell to 0ms.
   This provider reaches the rows and nothing else, so the topbar keeps the
   house 300ms. */
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <TooltipProvider delayDuration={0}>
      <ul
        data-slot="sidebar-menu"
        data-sidebar="menu"
        className={cn("flex w-full min-w-0 flex-col gap-1", className)}
        {...props}
      />
    </TooltipProvider>
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

/* Nav rows per the doctrine: rest quiet (--secondary), hover AND active the
   same alpha-100 fill with text lighting to foreground; no louder active
   state, no weight change. Radius is 10px (radius-lg), the reference rail's
   row radius. The ROW itself carries no transition (nav rows snap, the
   ladder's 0 rung); only the trailing span (the label) animates, fading and
   sliding in on expand instead of just being clipped, at the same 300ms as
   the rail's width or the two visibly desync. */
const sidebarMenuButtonVariants = cva(
  "peer/menu-button text-body font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg p-2 text-start disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-of-type]:truncate [&>span:last-of-type]:transition-all [&>span:last-of-type]:duration-300 group-data-[collapsible=icon]:[&>span:last-of-type]:translate-x-1 group-data-[collapsible=icon]:[&>span:last-of-type]:opacity-0 rtl:group-data-[collapsible=icon]:[&>span:last-of-type]:-translate-x-1 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      size: {
        default: "h-8",
        sm: "text-caption h-7",
        lg: "h-12 group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button";
  const { isMobile, state } = useSidebar();
  const railSide = React.useContext(SidebarSideContext);
  const collapsible = React.useContext(SidebarCollapsibleContext);

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      /* The visual current-state is deliberately quiet (same fill as
               hover, ink text, nothing else), so it carries no cue at all
               without this. data-active is styling; aria-current is meaning. */
      aria-current={isActive ? "page" : undefined}
      className={cn(
        sidebarMenuButtonVariants({ size }),
        /* The phone's sheet is held in the hand: every row meets the
                   44px touch floor rather than the desk rail's 32. */
        isMobile && size !== "lg" && "h-control-touch",
        className,
      )}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        /* Opens away from the rail, into the workspace: the LEFT
                   rail (default) opens right, the RIGHT rail (RTL) opens
                   left. A hardcoded "right" put the tooltip off the edge
                   of the viewport the first time the rail mirrored. */
        side={railSide === "right" ? "left" : "right"}
        align="center"
        /* Clears the rail entirely: the button sits 12px in from
                   the rail's edge (the group's p-3), so 20px lands the
                   tooltip 8px out onto the page instead of half on the
                   rail. */
        sideOffset={20}
        /* The tooltip stands in for a label that is gone, which is
                   only ever the ICON rail's collapsed state. An offcanvas
                   rail that is on screen (peeked) is "collapsed" with every
                   label showing. */
        hidden={state !== "collapsed" || isMobile || collapsible !== "icon"}
        {...tooltip}
      />
    </Tooltip>
  );
}
export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
