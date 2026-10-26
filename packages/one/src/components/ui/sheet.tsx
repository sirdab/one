"use client";

import * as React from "react";
import { Direction } from "radix-ui";
import { Drawer as DrawerPrimitive } from "vaul";

import { useHeldWhileClosing } from "../../lib/held-while-closing";
import { cn } from "../../lib/utils";

/* The Sirdab sheet, the shadcn DRAWER pattern on our tokens ("the
   default shadcn drawer is perfect"): a FLOATING inset
   panel, not a flush edge, 8px off the viewport, rounded on every
   corner, drag-to-dismiss physics from vaul. Behind it, the one scrim
   every blocking layer shares (the light gray-150/30 frost, never a
   black dim).

   The panel is bg-background (floating layers return to background; the
   rail's tint is docked-only) + shadow-modal-lg. The bottom
   tray keeps vaul's grab handle; side panels drag from anywhere.

   Sides are LOGICAL: "start" (the nav drawer), "end" (side panels,
   the default shape), "bottom" (trays), mapped to physical directions
   through the direction provider, so RTL mirrors for free.

   No built-in X: the pattern closes by drag, scrim, Escape, or an
   explicit Cancel in the footer (SheetClose). Footer actions sit SIDE
   BY SIDE, end-aligned, the dialog footer's row; actions never
   stack.

   Usage:
       <Sheet>
           <SheetTrigger asChild><Button variant="secondary">خيارات</Button></SheetTrigger>
           <SheetContent side="end">
               <SheetHeader>
                   <SheetTitle>وقت التوصيل</SheetTitle>
                   <SheetDescription>بنجهز طلبك بأسرع وقت.</SheetDescription>
               </SheetHeader>
               …body…
               <SheetFooter>
                   <SheetClose asChild><Button variant="ghost">إلغاء</Button></SheetClose>
                   <Button>تأكيد</Button>
               </SheetFooter>
           </SheetContent>
       </Sheet>
*/

type Side = "start" | "end" | "bottom";

const SideContext = React.createContext<Side>("end");

/* Whether the sheet is open, so SheetContent holds its last open content
   while it slides out (see useHeldWhileClosing). */
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
  /* vaul speaks physical directions; the side prop stays logical. */
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
        // Structural cap, not a design value: a tray never
        // swallows the page.
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
      // Side-by-side actions, end-aligned, the same row the
      // dialog footer uses; actions never stack.
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
