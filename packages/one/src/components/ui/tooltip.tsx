"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab tooltip: a hint, never a home for anything essential. An ink
   chip: primary fill, primary-foreground text at the body role, a max width
   of 256px with pretty wrapping (a long hint wraps, it does not run across
   the screen), the md radius, shadow-popover-sm, no arrow, 8px off its
   trigger [decision]. Ink is right here and it is the one ink surface that
   is not an action: a hint is read at a glance over a photo, a table or a
   white page, and a frosted chip greys out on an image and reads as a tiny
   menu on white. It is text only, never a target. The 8px gap keeps the
   chip off the ink focus ring and off the ink primary beside it, where 4px
   merged with them.

   Hints never appear on touch (Radix opens on hover and keyboard focus
   only), so nothing a person needs to act may live in one. The one
   exception is a Button's `disabledReason`, which opens on a tap.

   Studio's /app and console mount ONE <TooltipProvider> at their root,
   so every tooltip there shares the skip-delay: once one is open, moving
   to another trigger opens it at once (skipDelayDuration) instead of
   re-waiting 300ms. A lone Tooltip outside any provider still works (it
   wraps its own), but then it knows nothing of its neighbours. A nested
   provider is only for a region that wants a different delay (the
   collapsed rail opens at 0ms).

   Usage:
       <Tooltip>
           <TooltipTrigger asChild><Button …/></TooltipTrigger>
           <TooltipContent>انسخ الرابط</TooltipContent>
       </Tooltip>

       <TooltipProvider>            // one per toolbar/cluster
           <Tooltip>…</Tooltip>
           <Tooltip>…</Tooltip>
       </TooltipProvider>
*/
/* Radix requires SOME Provider above every Root. Tooltip self-wraps when
   standalone, but inside our TooltipProvider it must NOT (a nested
   provider would isolate the tooltip from the cluster's skip-delay).
   Radix has no "am I inside a provider" hook, so this flag is ours. */
const HasProviderContext = React.createContext(false);

/* 200ms before the first tooltip opens: long enough that a mouse crossing
   the toolbar does not flash them, short enough not to feel laggy. Once one
   is open, neighbours inside the cluster open at once until 400ms after the
   last one closed. */
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

/* The trigger's element, so the tooltip can ask about it before opening. */
const TriggerContext = React.createContext<{
  ref: React.RefObject<HTMLElement | null>;
  close: () => void;
} | null>(null);

/* When the last navigation key went down. A tooltip may open on focus only
   when that focus is the keyboard moving (Tab, Shift+Tab, an arrow through
   a toolbar), not when focus is handed back to a trigger by something
   closing: once a merchant has tabbed, every later focus matches
   :focus-visible, so closing the assistant rail put its button's hint up
   with no one pointing at it. One listener for the page, added on first
   use. */
let lastNavigationKeyAt = Number.NEGATIVE_INFINITY;
let listening = false;
const NAVIGATION_KEY_WINDOW_MS = 300;

function listenForNavigationKeys(): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(
    "focus",
    (event) => {
      /* Element focus passes through the window too (capture); only
               the window's own focus is the return. */
      if (event.target === event.currentTarget) {
        windowFocusedAt = performance.now();
      }
    },
    true,
  );
  window.addEventListener(
    "keydown",
    (event) => {
      /* The DOM types say key is always a string; Chrome's autofill
               dispatches keydown without one. */
      const key = event.key as string | undefined;
      if (key === "Tab" || key?.startsWith("Arrow") === true) {
        lastNavigationKeyAt = performance.now();
      }
    },
    true,
  );
}

/* When the window last came back into focus. The browser re-focuses the
   element that held focus when the window left (a bell the notifications
   panel handed focus back to), and that focus is the window returning,
   never the merchant pointing. */
let windowFocusedAt = Number.NEGATIVE_INFINITY;
const WINDOW_RETURN_MS = 500;

function focusCameFromKeyboard(): boolean {
  return performance.now() - lastNavigationKeyAt < NAVIGATION_KEY_WINDOW_MS;
}

function focusCameFromWindowReturn(): boolean {
  return performance.now() - windowFocusedAt < WINDOW_RETURN_MS;
}

/* Two refusals Radix does not make on its own:

   - A trigger that has opened something of its own (a menu, a popover:
     aria-expanded) keeps its hint shut. Pressing a "more" button opened the
     menu and the hint over it. Focus handed back by the menu as it closes
     does not reopen it either, unless the pointer is on the trigger or a
     navigation key just moved the focus there.
   - Leaving the window (switching desktops, another app) closes it. The
     pointer never "left" the trigger as far as the page knew, so the hint
     waited there for the merchant's return. */
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
        /* The trigger, or the button a hint wrapper holds, has a
                   popup of its own open (a menu, a popover). A disclosure
                   without a popup (the sidebar toggle) keeps its hint. */
        if (
          el?.matches('[aria-expanded="true"]') ||
          el?.querySelector('[aria-expanded="true"][aria-haspopup]')
        ) {
          return;
        }
        /* Focus handed back by something closing (a menu, the
                   assistant rail), or handed back by the browser when the
                   window regains focus, with the pointer elsewhere: not a
                   keyboard visit, not a hover. `contains`, not `===`: a
                   Button with a hint wraps itself in a span, so the
                   trigger is the span and the focused element the button
                   inside it. */
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
      /* A press always closes the hint. Radix closes it too, but only
               when nothing prevented the event, and a menu trigger prevents
               its pointer-down: the hint the hover had already opened stayed
               over the menu the press opened. */
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
          // Both open states animate: delayed-open (normal) AND
          // instant-open (skip-delay inside a TooltipProvider
          // cluster). Keying off one of them left the other
          // popping in unanimated. Moving between neighbours, the
          // old hint shrinks into its trigger while the new one
          // grows out of the next, both at once from 0.75 and
          // with no slide: the overlap reads as one motion. The
          // same timing for both open states, or the switch
          // snaps where the first open glides.
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
