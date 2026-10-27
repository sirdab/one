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

const SidebarSideContext = React.createContext<"left" | "right">("left");

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
        setOpenProp(openState);
        return;
      }
      _setOpen(openState);

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

  scheme?: "dark";

  peek?: boolean;
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  const direction = Direction.useDirection();

  const offcanvasCollapsed =
    collapsible === "offcanvas" && state === "collapsed";
  const offscreen = offcanvasCollapsed && !peek;
  const peeking = offcanvasCollapsed && peek;

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
        <Sheet
          open={openMobile}
          onOpenChange={setOpenMobile}
          side={(side === "right") === (direction === "rtl") ? "start" : "end"}
        >
          <SheetContent
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            dir={direction}
            lang={props.lang}
            id={props.id}

            onClickCapture={(event) => {
              if (navigatesHere(event)) setOpenMobile(false);
            }}
            className={cn(
              "w-shell-rail p-0 [&>button]:hidden",

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
          <div
            data-slot="sidebar-gap"
            className={cn(
              "w-shell-rail relative bg-transparent transition-all duration-300 ease-out",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              "group-data-[collapsible=icon]:w-shell-rail-icon",

              offscreen && "w-0!",
            )}
          />
          <div
            data-slot="sidebar-container"

            inert={offscreen}
            className={cn(
              "z-sticky w-shell-rail fixed inset-y-0 hidden h-svh transition-all duration-300 ease-out md:flex",
              "group-data-[collapsible=icon]:w-shell-rail-icon",
              side === "left" ? "left-0" : "right-0",

              offscreen &&
                (side === "left" ? "-translate-x-full" : "translate-x-full"),

              peeking && "shadow-popover-sm duration-200",

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

      aria-expanded={expanded}

      hint={expanded ? "Collapse the sidebar" : "Expand the sidebar"}

      className={cn("cursor-ew-resize", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
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

      aria-current={isActive ? "page" : undefined}
      className={cn(
        sidebarMenuButtonVariants({ size }),

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
        side={railSide === "right" ? "left" : "right"}
        align="center"

        sideOffset={20}

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
