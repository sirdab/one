"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { overlayPanelChrome, overlayPanelMotion } from "./overlay";

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
  scheme?: "dark";

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
