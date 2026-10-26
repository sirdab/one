"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { useSlideFrom } from "../../lib/use-slide-from";
import { cn } from "../../lib/utils";
import { SEGMENTED_ITEM, SEGMENTED_THUMB, SEGMENTED_TRACK } from "./segmented";

/* The Sirdab tabs: sectioned views under one heading, on Radix Tabs
   (roving focus, arrow keys, RTL, aria wiring all come from the
   primitive). Two variants, picked on the ROOT; ask "does it navigate a
   PAGE or flip a PANE?" before reaching for either:

   "underline" (default) is the responsive PAGE-TABS recipe.
   ONE component, two presentations. Below lg:
   full-width justify-around rows on a 40px rail; from lg up triggers
   hug and start-align and the inner pill span takes rounded-lg (10px,
   on grid) with a gray-alpha-200 border on
   the active tab. At EVERY size the active tab carries the underline:
   an ink bar (bg-foreground, h-tab-indicator: the minted 2px token)
   that SLIDES between tabs (useSlideFrom, the same recipe as
   Segmented's thumb: born at the previous tab's edges, eased home) (a 1.5px gray-alpha-800 bar reads
   too faint and a static swap too abrupt, so the bar is wider, darker,
   and animated like the shadcn underline tabs, pill and underline
   together). Text rests
   quiet (muted-foreground) and rises to ink; the row scrolls
   horizontally with no scrollbar when tabs overflow. The list sits on
   a border hairline at every size [decision: in the shell the tabs
   always rest on the header's border-b; standalone the component
   brings its own so the underline has something to land on. The
   -mb-px pull seats the indicator ON the hairline].

   "segmented" is the STATIC recipe, all sizes, no breakpoint, and it is
   the SAME shape as the Segmented control: the track, item and thumb are
   the three constants segmented.tsx exports, read here so the two can
   never drift [decision]. A 4% wash track (40 high, 44 on touch, p-1,
   rounded-xl 12px) holding 32px tabs (36 on touch, rounded-md 8px: the
   12px track minus the 4px pad, the nesting math --radius-nested encodes)
   whose active one carries the white thumb with the soft contact shadow.
   The thumb is PLACED on the active tab, not slid: Tabs flip panes, so the
   panel slide is the motion; the animated mode picker with the sliding
   thumb is the separate Segmented component (radio semantics: a mode, not
   a view). Quiet text rises to ink on hover and when active. Inactive tabs
   carry no chrome, so nothing moves on selection.

   THE PANEL AREA NEVER RESIZES. Every panel is
   force-mounted into the SAME grid cell, so the container is as tall as
   the tallest panel and a switch cannot shift the page under your
   cursor; a shorter panel simply fills the reserved space. Switching
   slides: panels rest off-centre on the side their own TAB sits on, so
   the arriving one enters from the direction you moved and the leaving
   one exits the other way (mirrored in RTL, where the next tab is to
   the left). Position, not switch history, decides: the animation is
   right however you got to a tab. Inactive panels stay inert and
   click-through, and nothing animates on first paint.

   Trigger COLOURS snap: no transition class on any trigger. The
   animated pieces are the underline indicator and the panel
   slide, both 200ms; segmented's own chrome stays fully static.

   Text rests quiet and actives to ink, SOLID tones only, per the text
   doctrine. Keyboard focus is the global focus-visible outline; nothing
   here sets outline-none. */

const TabsVariantContext = React.createContext<{
  variant: "underline" | "segmented";
  /** Current value: the underline indicator needs to know which
        trigger is active to mount its bar there. */
  value: string | undefined;
  /** Pointer selection path (see TabsTrigger's onMouseDown). */
  setValue: (value: string) => void;
  /** Tab values in DOM order: panels slide toward the tab they came
        from, so each needs to know where it sits in the row. */
  order: string[];
  /** Physical slide direction: RTL mirrors it (the next tab is to the
        LEFT, so its panel must arrive from the left). */
  rtl: boolean;
  /** The underline bar, per instance: the slide measures from the
        previous active trigger of THIS row, never another Tabs on the page. */
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
  /** "underline" = the responsive page-tabs recipe (sliding ink
        underline, bordered pill from lg). "segmented" = the static
        track Segmented wears, all sizes. */
  variant?: "underline" | "segmented";
}) {
  // The root is CONTROLLED against this mirror: triggers select on
  // mousedown themselves (preventDefault keeps Radix from focusing on
  // pointer: programmatic focus trips Chrome's :focus-visible and
  // painted the global ring on every CLICK; keyboard still flows
  // through Radix and keeps its real focus ring).
  const [internal, setInternal] = React.useState(defaultValue);
  const value = valueProp ?? internal;
  const indicatorRef = useSlideFrom<HTMLSpanElement>(value);
  const setValue = (next: string): void => {
    if (next === value) return;
    setInternal(next);
    onValueChange?.(next);
  };

  // Tab order and direction are READ FROM THE DOM once mounted,
  // rather than collected by child registration: document order IS the
  // visual order, whatever nesting the caller used, and it survives
  // StrictMode's double-invoked effects, which a registration list does
  // not. A layout effect, so panels know their resting sides before the
  // first paint.
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
    // Read ONCE. A tab row that changes shape after mount keeps the
    // old order and its panels cross-fade in place: the graceful
    // failure, and the price of an effect with no update chain.
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
        // A GRID, not a column: every panel is placed in the SAME
        // cell (row 2), so the row is as tall as the TALLEST panel
        // and switching tabs can never resize the container. The
        // list auto-places into row 1.
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
  // The list grows past its 40px rail when a script's line box is taller
  // (Arabic at 24px leading plus the active pill's border and padding
  // would not fit), since overflow-x scrolling clips the other axis too.
  // The frame owns the hairline; the list pulls itself down 1px so the
  // active 1.5px underline paints ON the hairline, not above it (the
  // -mb-px construction). Caller layout lands on the frame.
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
  // Pointer selection WITHOUT focus: Radix focuses the trigger
  // programmatically on mousedown, which trips Chrome's :focus-visible
  // heuristic and paints the global ring on every CLICK. preventDefault
  // stops both the focus and Radix's own selection, so we select
  // through the controlled mirror ourselves. Keyboard never comes this
  // way. Arrows/tab flow through Radix and keep the real focus ring.
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
        {/* Placed, not slid: only the active tab carries the thumb. */}
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
        // Width: full (justify-around row) below lg, hugging from
        // lg. px-4 keeps a tap target on narrow screens; from md
        // the full-width spread does the spacing (md:px-0).
        // h-full: the trigger fills the 40px rail so
        // the underline sits ON the hairline. Taller triggers
        // push it below the frame line where it reads as a
        // stray divider. pb-2 then lifts the pill off that line:
        // the indicator still belongs to the tab, but the label
        // is not sitting on top of it.
        "group/tabs-trigger relative inline-flex w-full items-center justify-center px-4 pb-2 whitespace-nowrap select-none md:px-0 lg:w-auto",
        /* Hover lifts the text to ink, and from lg washes the pill,
                   so a tab answers the pointer before it is chosen. Both
                   snap: the slide lives on the indicator alone. */
        "text-body text-muted-foreground hover:text-foreground data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    >
      {/* The pill: chrome-free below lg, a bordered rounded-lg
                capsule on the active tab from lg (a 10px radius, the
                on-grid rounded-lg default). */}
      <span
        data-slot="tabs-trigger-pill"
        className="lg:group-hover/tabs-trigger:bg-btn-ghost-surface-hover lg:group-data-[state=active]/tabs-trigger:border-gray-alpha-200 flex items-center rounded-lg border border-transparent lg:px-2.5 lg:py-1 lg:group-data-[state=active]/tabs-trigger:bg-transparent"
      >
        {children}
      </span>
      {/* The ink underline, sliding between tabs (Segmented's thumb
                recipe, useSlideFrom). Mounted only on the active trigger;
                bottom-0 lands it on the frame hairline through the list's
                -mb-px pull. */}
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

/** How far a resting panel sits off-centre, px. Small on purpose: the
    slide is a direction cue, not a journey. */
const SLIDE = 16;

function TabsContent({
  className,
  children,
  fitActive = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  /**
   * Opt out of the reserved-height rule for one set of panels: inactive
   * ones collapse to nothing, so the area is only as tall as what is on
   * screen. The default stands (a switch must not shift the page under the
   * cursor), but where one panel dwarfs another the reserved space becomes
   * a screen of nothing to scroll through, which reads as a broken page
   * rather than a steady one.
   */
  fitActive?: boolean;
}) {
  const { value, order, rtl } = React.useContext(TabsVariantContext);
  const active = value === props.value;
  // Panels rest on the side their TAB sits on, so the incoming one
  // always arrives from the direction you moved and the outgoing one
  // leaves the opposite way. Derived from position, not from switch
  // history, so it stays right however you got here.
  const index = order.indexOf(String(props.value));
  const activeIndex = order.indexOf(String(value));
  const known = index !== -1 && activeIndex !== -1;
  const logical = !known || active ? 0 : index < activeIndex ? -1 : 1;
  return (
    <TabsPrimitive.Content
      // forceMount keeps EVERY panel in the layout: stacked in one
      // grid cell they make the container as tall as the tallest,
      // so switching never resizes it. The cost is that all panels
      // render: keep heavy, data-fetching panels behind their own
      // lazy boundary.
      forceMount
      data-slot="tabs-content"
      // Inactive panels are layout-only: inert takes them out of
      // the a11y tree and the focus order (several visible
      // tabpanels would otherwise be announced), and
      // pointer-events-none lets clicks through to the live one.
      inert={!active}
      className={cn(
        "col-start-1 row-start-2 min-w-0",
        !active && "pointer-events-none",
        // Collapsed, not unmounted: the panel keeps its state and its
        // place in the grid, it just stops claiming height.
        !active && fitActive && "h-0 overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* The slide lives on an inner element so the panel's own box
                keeps its place in the grid: a transform never changes
                layout, so the container height stays put. The first paint
                is already in position, so nothing animates on page load. */}
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

/**
 * Usage:
 *
 *     <Tabs defaultValue="all">
 *         <TabsList aria-label="عرض المنتجات">
 *             <TabsTrigger value="all">الكل</TabsTrigger>
 *             <TabsTrigger value="drafts">المسودات</TabsTrigger>
 *         </TabsList>
 *         <TabsContent value="all">…</TabsContent>
 *         <TabsContent value="drafts">…</TabsContent>
 *     </Tabs>
 *
 *     <Tabs variant="segmented" defaultValue="settings">…</Tabs>
 *
 * variant lives on the ROOT and both List and Trigger read it. Never
 * mix triggers across variants. "underline" is the page-tabs default:
 * the sliding ink underline at every size, plus the bordered pill from
 * lg; "segmented" is the static track for pane switching inside a
 * view, every size. Deciding between this and the Segmented control:
 * Tabs show PANELS of content; Segmented picks a MODE (radio
 * semantics, sliding thumb). className is LAYOUT only: on TabsList it
 * lands on the underline variant's frame (the hairline row). RTL,
 * arrow keys, and roving focus come from Radix.
 */
export { Tabs, TabsContent, TabsList, TabsTrigger };
