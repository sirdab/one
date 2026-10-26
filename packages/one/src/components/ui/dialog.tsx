"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { useVisualViewport } from "../../hooks/use-visual-viewport";
import { BELOW_MD } from "../../lib/breakpoints";
import { focusDialogTarget } from "../../lib/dialog-focus";
import { useHeldWhileClosing } from "../../lib/held-while-closing";
import { cn } from "../../lib/utils";
import { CloseIcon } from "../icons/shell";
import { Button } from "./button";
import { Icon } from "./icon";
import { overlayDialogMotion, overlayScrimMotion } from "./overlay";
import { Reveal } from "./reveal";

/* The Sirdab dialog: the blocking layer. A modal REPLACES the stack: the
   frosted scrim behind (gray-150 at 30% over a 2.5px blur, a light veil
   that brightens the page, never a black dim), the panel on top. One
   scrim for every blocking layer; Sheet shares it.

   The panel: surface-modal (white), shadow-modal (the six-layer contact ladder), radius-modal 24px at
   EVERY size, mobile included (stock shadcn's square-corner mobile
   fallback is a leftover, not a design). 20px inset, 20px internal gap,
   512px max with 16px viewport gutters.

   Motion: scrim fades, panel fades + zooms from 95% with no slide; both
   200ms in and out (overlay.ts has the curves).

   Anatomy: DialogHeader (title + optional description), the caller's
   form/body, DialogFooter (actions end-aligned, stacking column-reverse
   on mobile so the primary lands on top). The close X sits at the
   logical end, painted above the sticky header that spans its corner (a
   title that runs long keeps clear of it). Title is the heading-xs role;
   description is quiet body [decision: house type roles, not per-surface
   one-offs].

   The primary is a DialogSubmit: rendered only once the draft would save,
   concealed and inert until then, so the footer holds its height and nothing
   jumps when it arrives. Below sm the footer is a stack and the slot stays
   open (the hidden primary keeps its row); from sm the slot closes and
   Cancel sits flush at the end. Cancel is always there.

   Position: `DialogContent`'s `position` prop is "center" (default,
   centred on both axes) or "launcher" (the command palette: a fixed box
   20vh down from md, the whole visible screen below it); see
   DIALOG_POSITION_CLASSES below. A "launcher" dialog also skips the close
   X by default: it replaces a topbar control the person just clicked (or
   a shortcut they just pressed), so Esc and outside-click are already how
   it closes, and a corner X would be one more affordance than that
   surface needs. Pass `showCloseButton` to override either way.

   A popover may open OVER a dialog (stacking rule); never a dialog over
   a dialog.

   Usage:
       <Dialog>
           <DialogTrigger asChild><Button variant="secondary">تعديل</Button></DialogTrigger>
           <DialogContent>
               <DialogHeader>
                   <DialogTitle>تعديل الاسم</DialogTitle>
                   <DialogDescription>يظهر على المتجر والفواتير.</DialogDescription>
               </DialogHeader>
               …form…
               <DialogFooter>
                   <Button>حفظ</Button>
               </DialogFooter>
           </DialogContent>
       </Dialog>
*/

/* Whether the dialog is open, for DialogContent to hold its last open
   content while it animates out. True outside a Dialog (a caller on the
   bare primitive), which holds nothing. */
const DialogOpenContext = React.createContext(true);

/* The corner X's screen-reader name. The primitive takes no strings, so an
   app sets its own word once, at its root, and every dialog under it reads
   that rather than each call site passing it (or forgetting to and saying
   "Close" in Arabic). A `closeLabel` prop still wins. */
const DialogCloseLabelContext = React.createContext("Close");

function DialogCloseLabelProvider({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <DialogCloseLabelContext.Provider value={label}>
      {children}
    </DialogCloseLabelContext.Provider>
  );
}

function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const isOpen = open ?? uncontrolled;
  return (
    <DialogOpenContext.Provider value={isOpen}>
      <DialogPrimitive.Root
        data-slot="dialog"
        open={isOpen}
        onOpenChange={(next) => {
          setUncontrolled(next);
          onOpenChange?.(next);
        }}
        {...props}
      />
    </DialogOpenContext.Provider>
  );
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Fade only (the blur stays static), in the same pair as the
        // panel so scrim and panel land and leave together.
        "z-modal bg-scrim-surface backdrop-blur-scrim fixed inset-0",
        overlayScrimMotion,
        className,
      )}
      {...props}
    />
  );
}

/* "center" (default): the panel centres on both axes, the ordinary
   modal. "launcher": the command palette. From md it is a fixed box,
   w-shell-palette by h-shell-launcher at top-shell-launcher (720 by 470,
   20vh down), horizontally centred, that never resizes: results swap
   inside a list that scrolls, so the panel does not jump on every
   keystroke as the count changes. max-w-none drops the base max-w-lg cap,
   which would otherwise clip the palette's width.

   The two also differ in how their edge is drawn. "center" wears
   shadow-modal, whose first layer is a 1px ring standing in for a
   border. "launcher" takes a real 1px border instead: the panel is
   centred by a -50% translate at a viewport-relative width, so it
   routinely lands on a half pixel, and a ring painted as a shadow
   antialiases across two device pixels there and reads as a thick, soft
   edge. A border snaps to the pixel grid.

   Below md the launcher has no control to land on, and searching is the
   whole job while it is open: it is the screen itself, top to bottom and
   edge to edge, with no radius and no border (the palette inside carries
   its own Cancel, since a phone has no Esc). Only from md is it the fixed
   box. A caller that moves the panel's centre with an inline `left` does
   so from md only, or the inline value would beat the full width.

   Full screen on a phone means the VISIBLE screen. 100dvh ignores the
   on-screen keyboard, so on iOS the list's last rows and the keyboard's own
   Go key sit under the keys; below md the panel is sized to the visual
   viewport instead (its height, and how far down it starts), with h-dvh as
   the answer until that is known. */
const DIALOG_POSITION_CLASSES = {
  center: "top-1/2 left-1/2 -translate-1/2 shadow-modal",
  launcher:
    "max-md:top-0 max-md:inset-x-0 max-md:h-dvh max-md:w-auto max-md:rounded-none max-md:border-0 md:top-shell-launcher md:left-1/2 md:-translate-x-1/2 md:w-shell-palette md:h-shell-launcher max-w-none border border-border",
} as const;

type DialogPosition = keyof typeof DIALOG_POSITION_CLASSES;

function focusOnOpen(event: Event): void {
  const content = event.target;
  if (!(content instanceof HTMLElement)) return;
  if (focusDialogTarget(content)) event.preventDefault();
}

function DialogContent({
  className,
  children,
  style,
  closeLabel,
  position = "center",
  showCloseButton = position !== "launcher",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** sr-only name for the close X, over the app's DialogCloseLabelProvider
        word. The primitive stays i18n-free;
        the caller passes the localized string. */
  closeLabel?: string;
  /** See DIALOG_POSITION_CLASSES above. */
  position?: DialogPosition;
  /** Whether the corner close X renders. Defaults to `position !==
        "launcher"`: an ordinary dialog keeps its X, a launcher (the
        command palette) does not, since it already replaces a control
        the person just triggered and Esc / outside-click are the close
        affordances that surface wants. */
  showCloseButton?: boolean;
}) {
  const shown = useHeldWhileClosing(
    React.useContext(DialogOpenContext),
    children,
  );
  const appCloseLabel = React.useContext(DialogCloseLabelContext);
  const visible = useVisualViewport(position === "launcher" ? BELOW_MD : null);
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-has-close={showCloseButton ? "" : undefined}
        className={cn(
          // The edge belongs to the position, see
          // DIALOG_POSITION_CLASSES.
          // Motion is the scrim's pair plus a 0.96 scale.
          "group/dialog z-modal no-scrollbar rounded-modal bg-surface-modal fixed flex w-full max-w-lg flex-col gap-5 overflow-y-auto p-5",
          overlayDialogMotion,
          DIALOG_POSITION_CLASSES[position],
          className,
        )}
        // Structural bounds, not design values: 16px viewport
        // gutters on small screens, never taller than the
        // viewport minus breathing room. "launcher" skips the
        // inline width: it is sized by the w-shell-palette CLASS,
        // which an inline style would always beat.
        style={{
          ...(position === "launcher"
            ? visible
              ? { top: visible.offsetTop, height: visible.height }
              : {}
            : {
                width: "calc(100% - 2rem)",
                maxHeight: "calc(100dvh - 4rem)",
              }),
          ...style,
        }}
        {...props}
        onOpenAutoFocus={(event) => {
          props.onOpenAutoFocus?.(event);
          if (!event.defaultPrevented) focusOnOpen(event);
        }}
      >
        {/* The CloseIcon rides a zero-height sticky strip, first in the
                    column (-mb-5 cancels the gap it would add): it holds at
                    the content edge, 20px down, on the title's line, while a
                    long body scrolls under it. Sticky insets count from the
                    content edge (inside the padding), so top-0 is 20px. An absolute CloseIcon scrolled away
                    with the content. z-raised-more, one rung above the
                    sticky DialogHeader's z-raised: the header spans the corner
                    with an opaque fill and comes later, so at the same rung it
                    painted over the X, which stayed in the accessibility tree
                    but could neither be seen nor tapped. A flex column, not a grid: a grid row
                    never shrinks below zero, so the negative margin was
                    ignored and every title sat a gap (20px) too low. */}
        {showCloseButton ? (
          <div className="z-raised-more sticky top-0 -mb-5 h-0 self-end">
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="rounded-xs opacity-70 transition-opacity hover:opacity-100"
            >
              <Icon icon={CloseIcon} />
              <span className="sr-only">{closeLabel ?? appCloseLabel}</span>
            </DialogPrimitive.Close>
          </div>
        ) : null}
        {shown}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        /* Sticky, so the title stays put while the body scrolls.
                   -mx-5/-mt-5 + matching padding pull its fill over the
                   dialog's own padding, so content scrolling under it is
                   hidden rather than showing through above the title.
                   -top-5, not top-0: sticky insets count from the content
                   edge, inside that padding, so top-0 pushed the header back
                   down 20px and every title sat a padding too low. */
        "z-raised bg-surface-modal sticky -top-5 -mx-5 -mt-5 flex flex-col gap-1.5 px-5 pt-5 pb-2 text-center sm:text-start",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      /* Clear of the corner X once it is painted: symmetric on a phone,
               where the title is centred, end-side from sm, where it starts at
               the start edge. */
      className={cn(
        "text-heading-xs group-data-[has-close]/dialog:max-sm:px-9 group-data-[has-close]/dialog:sm:pe-9",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-body-quiet text-muted-foreground", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // column-reverse on mobile: the primary action stays on
        // top of the stack, closest to the thumb. The row gap is the
        // 8px Reveal gives back when a primary is hidden, so Cancel
        // sits flush at the end instead of 2px short.
        "mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-2",
        className,
      )}
      {...props}
    />
  );
}

/* The dialog's primary: a submit button that exists only once the draft
   would save. `ready` is that fact; the caller keeps it true while a request
   is in flight (`busy`), so the button stays, spinning, instead of vanishing
   before the dialog closes. Cancel is a sibling and is always there. */
function DialogSubmit({
  ready,
  busy = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "concealed" | "loading"> & {
  ready: boolean;
  busy?: boolean;
}) {
  return (
    <Reveal open={ready} className="max-sm:reveal-slot-open">
      <Button
        type="submit"
        loading={busy}
        concealed={!ready}
        className={cn("max-sm:w-full", className)}
        {...props}
      />
    </Reveal>
  );
}

export {
  Dialog,
  DialogClose,
  DialogCloseLabelProvider,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogSubmit,
  DialogTitle,
  DialogTrigger,
};
