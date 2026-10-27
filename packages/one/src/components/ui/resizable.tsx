"use client";

import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "../../lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps): React.JSX.Element {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel(
  props: ResizablePrimitive.PanelProps,
): React.JSX.Element {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  className,
  ...props
}: ResizablePrimitive.SeparatorProps): React.JSX.Element {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border data-[separator=active]:bg-gray-alpha-400 data-[separator=hover]:bg-gray-alpha-400 relative flex w-px items-center justify-center transition-colors duration-100 after:absolute after:inset-y-0 after:start-1/2 after:w-2 after:-translate-x-1/2 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:start-0 aria-[orientation=horizontal]:after:h-2 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 rtl:after:translate-x-1/2",
        className,
      )}
      {...props}
    />
  );
}

const useResizablePanelRef = ResizablePrimitive.usePanelRef;

type ResizableLayoutMeta = ResizablePrimitive.LayoutChangedMeta;

export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useResizablePanelRef,
  type ResizableLayoutMeta,
};
