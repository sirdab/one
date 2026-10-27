"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { useSlideFrom } from "../../lib/use-slide-from";
import { cn } from "../../lib/utils";
import { SEGMENTED_ITEM, SEGMENTED_THUMB, SEGMENTED_TRACK } from "./segmented";

const TabsVariantContext = React.createContext<{
  variant: "underline" | "segmented";

  value: string | undefined;

  setValue: (value: string) => void;

  order: string[];

  rtl: boolean;

  indicatorRef: React.RefObject<HTMLSpanElement | null> | null;
}>({
  variant: "underline",
  value: undefined,
  setValue: () => undefined,
  order: [],
  rtl: false,
  indicatorRef: null,
});

function Tabs({
  className,
  variant = "underline",
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  variant?: "underline" | "segmented";
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = valueProp ?? internal;
  const indicatorRef = useSlideFrom<HTMLSpanElement>(value);
  const setValue = (next: string): void => {
    if (next === value) return;
    setInternal(next);
    onValueChange?.(next);
  };

  const rootRef = React.useRef<HTMLDivElement>(null);
  const [layout, setLayout] = React.useState<{
    order: string[];
    rtl: boolean;
  }>({ order: [], rtl: false });
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (root == null) return;
    setLayout({
      order: Array.from(
        root.querySelectorAll<HTMLElement>(
          '[data-slot="tabs-trigger"][data-value]',
        ),
      ).map((trigger) => trigger.dataset.value ?? ""),
      rtl: getComputedStyle(root).direction === "rtl",
    });
  }, []);

  return (
    <TabsVariantContext.Provider
      value={{
        variant,
        value,
        setValue,
        order: layout.order,
        rtl: layout.rtl,
        indicatorRef,
      }}
    >
      <TabsPrimitive.Root
        ref={rootRef}
        data-slot="tabs"
        data-variant={variant}
        value={value}
        onValueChange={setValue}

        className={cn("grid grid-cols-1 gap-2", className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { variant } = React.useContext(TabsVariantContext);
  if (variant === "segmented") {
    return (
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn("row-start-1", SEGMENTED_TRACK, className)}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="tabs-list-frame"
      className={cn("border-border row-start-1 w-full border-b", className)}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "no-scrollbar -mb-px flex min-h-10 w-full items-stretch justify-around gap-1.5 overflow-x-auto lg:justify-start",
        )}
        {...props}
      />
    </div>
  );
}

function TabsTrigger({
  className,
  children,
  onMouseDown,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant, value, setValue, indicatorRef } =
    React.useContext(TabsVariantContext);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    onMouseDown?.(event);
    if (
      !event.defaultPrevented &&
      event.button === 0 &&
      !event.ctrlKey &&
      !props.disabled
    ) {
      event.preventDefault();
      setValue(props.value);
    }
  };
  const active = value === props.value;
  if (variant === "segmented") {
    return (
      <TabsPrimitive.Trigger
        data-slot="tabs-trigger"
        data-value={props.value}
        onMouseDown={handleMouseDown}
        className={cn(
          SEGMENTED_ITEM,
          "text-label inline-flex items-center justify-center whitespace-nowrap select-none data-[state=active]:text-foreground",
          className,
        )}
        {...props}
      >
        {active ? (
          <span
            aria-hidden
            data-slot="tabs-trigger-thumb"
            className={SEGMENTED_THUMB}
          />
        ) : null}
        <span className="z-raised relative">{children}</span>
      </TabsPrimitive.Trigger>
    );
  }
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-value={props.value}
      onMouseDown={handleMouseDown}
      className={cn(
        "group/tabs-trigger relative inline-flex w-full items-center justify-center px-4 pb-2 whitespace-nowrap select-none md:px-0 lg:w-auto",

        "text-body text-muted-foreground hover:text-foreground data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    >
      <span
        data-slot="tabs-trigger-pill"
        className="lg:group-hover/tabs-trigger:bg-btn-ghost-surface-hover lg:group-data-[state=active]/tabs-trigger:border-gray-alpha-200 flex items-center rounded-lg border border-transparent lg:px-2.5 lg:py-1 lg:group-data-[state=active]/tabs-trigger:bg-transparent"
      >
        {children}
      </span>

      {active ? (
        <span
          ref={indicatorRef}
          aria-hidden
          data-slot="tabs-trigger-indicator"
          className="h-tab-indicator absolute inset-x-0 bottom-0 bg-foreground transition-all duration-200 motion-reduce:transition-none"
        />
      ) : null}
    </TabsPrimitive.Trigger>
  );
}

const SLIDE = 16;

function TabsContent({
  className,
  children,
  fitActive = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  fitActive?: boolean;
}) {
  const { value, order, rtl } = React.useContext(TabsVariantContext);
  const active = value === props.value;

  const index = order.indexOf(String(props.value));
  const activeIndex = order.indexOf(String(value));
  const known = index !== -1 && activeIndex !== -1;
  const logical = !known || active ? 0 : index < activeIndex ? -1 : 1;
  return (
    <TabsPrimitive.Content
      forceMount
      data-slot="tabs-content"

      inert={!active}
      className={cn(
        "col-start-1 row-start-2 min-w-0",
        !active && "pointer-events-none",

        !active && fitActive && "h-0 overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        data-slot="tabs-content-inner"
        className="transition duration-200 motion-reduce:transition-none"
        style={{
          transform: `translateX(${logical * (rtl ? -SLIDE : SLIDE)}px)`,
          opacity: active ? 1 : 0,
        }}
      >
        {children}
      </div>
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
