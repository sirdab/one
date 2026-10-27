"use client";

import * as React from "react";
import { Direction } from "radix-ui";
import { Drawer as DrawerPrimitive } from "vaul";

import { useHeldWhileClosing } from "../../lib/held-while-closing";
import { cn } from "../../lib/utils";

type Side = "start" | "end" | "bottom";

const SideContext = React.createContext<Side>("end");

const SheetOpenContext = React.createContext(true);

function Sheet({
  side = "end",
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  side?: Side;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const isOpen = open ?? uncontrolled;
  const dir = Direction.useDirection();

  const direction =
    side === "bottom"
      ? "bottom"
      : (side === "start") !== (dir === "rtl")
        ? "left"
        : "right";
  return (
    <SideContext.Provider value={side}>
      <SheetOpenContext.Provider value={isOpen}>
        <DrawerPrimitive.Root
          data-slot="sheet"
          direction={direction}
          open={isOpen}
          onOpenChange={(next) => {
            setUncontrolled(next);
            onOpenChange?.(next);
          }}
          {...props}
        />
      </SheetOpenContext.Provider>
    </SideContext.Provider>
  );
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="sheet-close" {...props} />;
}

const SIDE_CLASSES: Record<Side, string> = {
  start: "inset-y-2 start-2 w-3/4 rounded-2xl sm:max-w-sm",
  end: "inset-y-2 end-2 w-3/4 rounded-2xl sm:max-w-sm",
  bottom: "inset-x-2 bottom-2 rounded-2xl",
};

function SheetContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const side = React.useContext(SideContext);
  const shown = useHeldWhileClosing(
    React.useContext(SheetOpenContext),
    children,
  );
  return (
    <DrawerPrimitive.Portal data-slot="sheet-portal">
      <DrawerPrimitive.Overlay
        data-slot="sheet-overlay"
        className="z-modal bg-scrim-surface backdrop-blur-scrim fixed inset-0"
      />
      <DrawerPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "z-modal shadow-modal-lg fixed flex flex-col overflow-hidden bg-background",
          SIDE_CLASSES[side],
          className,
        )}

        style={side === "bottom" ? { maxHeight: "80dvh", ...style } : style}
        {...props}
      >
        {side === "bottom" ? (
          <div
            aria-hidden
            className="bg-muted mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full"
          />
        ) : null}
        {shown}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex shrink-0 flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"

      className={cn("mt-auto flex shrink-0 justify-end gap-2.5 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-heading-xs", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-body-quiet text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
