"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

const HasProviderContext = React.createContext(false);

const OPEN_DELAY_MS = 200;
const SKIP_DELAY_MS = 400;

function TooltipProvider({
  delayDuration = OPEN_DELAY_MS,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={SKIP_DELAY_MS}
      {...props}
    >
      <HasProviderContext.Provider value={true}>
        {children}
      </HasProviderContext.Provider>
    </TooltipPrimitive.Provider>
  );
}

const TriggerContext = React.createContext<{
  ref: React.RefObject<HTMLElement | null>;
  close: () => void;
} | null>(null);

let lastNavigationKeyAt = Number.NEGATIVE_INFINITY;
let listening = false;
const NAVIGATION_KEY_WINDOW_MS = 300;

function listenForNavigationKeys(): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(
    "focus",
    (event) => {
      if (event.target === event.currentTarget) {
        windowFocusedAt = performance.now();
      }
    },
    true,
  );
  window.addEventListener(
    "keydown",
    (event) => {
      const key = event.key as string | undefined;
      if (key === "Tab" || key?.startsWith("Arrow") === true) {
        lastNavigationKeyAt = performance.now();
      }
    },
    true,
  );
}

let windowFocusedAt = Number.NEGATIVE_INFINITY;
const WINDOW_RETURN_MS = 500;

function focusCameFromKeyboard(): boolean {
  return performance.now() - lastNavigationKeyAt < NAVIGATION_KEY_WINDOW_MS;
}

function focusCameFromWindowReturn(): boolean {
  return performance.now() - windowFocusedAt < WINDOW_RETURN_MS;
}

function Tooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const hasProvider = React.useContext(HasProviderContext);
  React.useEffect(listenForNavigationKeys, []);
  const trigger = React.useRef<HTMLElement | null>(null);
  const [internal, setInternal] = React.useState(defaultOpen);
  const open = openProp ?? internal;
  const setOpen = React.useCallback(
    (next: boolean): void => {
      if (next) {
        const el = trigger.current;

        if (
          el?.matches('[aria-expanded="true"]') ||
          el?.querySelector('[aria-expanded="true"][aria-haspopup]')
        ) {
          return;
        }

        if (
          el &&
          el.contains(document.activeElement) &&
          !el.matches(":hover") &&
          (focusCameFromWindowReturn() || !focusCameFromKeyboard())
        ) {
          return;
        }
      }
      setInternal(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  React.useEffect(() => {
    if (!open) return;
    const close = (): void => setOpen(false);
    const onVisibility = (): void => {
      if (document.hidden) close();
    };
    window.addEventListener("blur", close);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", close);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [open, setOpen]);

  const root = (
    <TriggerContext.Provider
      value={{ ref: trigger, close: () => setOpen(false) }}
    >
      <TooltipPrimitive.Root
        data-slot="tooltip"
        open={open}
        onOpenChange={setOpen}
        {...props}
      />
    </TriggerContext.Provider>
  );
  if (hasProvider) return root;
  return (
    <TooltipPrimitive.Provider
      delayDuration={OPEN_DELAY_MS}
      skipDelayDuration={SKIP_DELAY_MS}
    >
      {root}
    </TooltipPrimitive.Provider>
  );
}

function TooltipTrigger({
  ref,
  onPointerDown,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const context = React.useContext(TriggerContext);
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      ref={(node: HTMLButtonElement | null) => {
        if (context) context.ref.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}

      onPointerDown={(event) => {
        context?.close();
        onPointerDown?.(event);
      }}
      {...props}
    />
  );
}

function TooltipContent({
  className,
  sideOffset = 8,
  style,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-tooltip bg-primary text-body text-primary-foreground shadow-popover-sm data-[state=closed]:animate-out data-[state=closed]:ease-exit data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-75 data-[state=delayed-open]:animate-in data-[state=delayed-open]:ease-pop data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-75 data-[state=instant-open]:animate-in data-[state=instant-open]:ease-pop data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-75 max-w-64 rounded-md px-2 py-1 text-pretty data-[state=closed]:duration-150 data-[state=delayed-open]:duration-200 data-[state=instant-open]:duration-200",
          className,
        )}
        style={{
          transformOrigin: "var(--radix-tooltip-content-transform-origin)",
          ...style,
        }}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
