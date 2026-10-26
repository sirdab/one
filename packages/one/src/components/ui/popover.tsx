"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { overlayPanelChrome, overlayPanelMotion } from "./overlay";

/* The Sirdab popover, the frosted floating panel, shared chrome with the
   select's menu: popover surface at 90% over the 8px backdrop blur, NO
   border (shadow-popover-sm paints the hairline), 10px radius, 100ms
   panel animation. NO default padding: the composition owns its inset
   (a combobox needs a flush sticky header; a plain panel adds p-4 at the
   call site as layout).

   On a phone a panel keeps 16px off both screen edges, the same gutter
   the dialog holds: collision padding keeps Radix from shifting it any
   closer, and a viewport max-width caps a call-site width (a w-96 panel
   is wider than a 360px screen) so there is room to shift it into.

   Usage:
       <Popover>
           <PopoverTrigger asChild><Button variant="secondary">…</Button></PopoverTrigger>
           <PopoverContent className="w-72 p-4">…</PopoverContent>
       </Popover>
*/
/* 16px, the dialog's viewport gutter: padding on each side, so a panel is
   never wider than the viewport less both. */
const VIEWPORT_GUTTER_PX = 16;
const VIEWPORT_GUTTER_MAX_WIDTH = `calc(100vw - ${VIEWPORT_GUTTER_PX * 2}px)`;

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
  className,
  align = "start",
  sideOffset = 4,
  collisionPadding = VIEWPORT_GUTTER_PX,
  kind = "panel",
  scheme,
  style,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  /** The panel's color scheme when its trigger lives in a different one
        than the page (a control on the ink rail): the panel portals out to
        <body>, outside the trigger's scope, so it has to carry it itself. */
  scheme?: "dark";
  /** "panel" (default): the 10px menu-tier surface, composition owns
        the inset. "dialog": the 20px tier with p-4, the filter-dialog
        tier. */
  kind?: "panel" | "dialog";
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          overlayPanelChrome,
          kind === "dialog" && "rounded-popover before:rounded-popover p-4",
          scheme === "dark" && "dark text-foreground",
          "z-popover outline-hidden",
          overlayPanelMotion,
          className,
        )}
        /* A structural bound, not a design value (the dialog's own
                   gutter, as in dialog.tsx), so it lives in style. */
        style={{
          maxWidth: VIEWPORT_GUTTER_MAX_WIDTH,
          ...style,
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
