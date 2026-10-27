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

const DialogOpenContext = React.createContext(true);

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
        "z-modal bg-scrim-surface backdrop-blur-scrim fixed inset-0",
        overlayScrimMotion,
        className,
      )}
      {...props}
    />
  );
}

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
  closeLabel?: string;

  position?: DialogPosition;

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
          "group/dialog z-modal no-scrollbar rounded-modal bg-surface-modal fixed flex w-full max-w-lg flex-col gap-5 overflow-y-auto p-5",
          overlayDialogMotion,
          DIALOG_POSITION_CLASSES[position],
          className,
        )}

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
        "mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-2",
        className,
      )}
      {...props}
    />
  );
}

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
