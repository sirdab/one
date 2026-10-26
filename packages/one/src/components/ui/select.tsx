"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Direction, Select as SelectPrimitive } from "radix-ui";

import {
  restoreTriggerFocus,
  trackFocusModality,
} from "../../lib/restore-trigger-focus";
import { cn } from "../../lib/utils";
import { CheckIcon, ChevronDownIcon } from "../icons/catalogue";
import { ChevronUpIcon } from "../icons/general";
import { buttonVariants } from "./button";
import {
  FIELD_HEIGHT,
  FIELD_RADIUS,
  FIELD_TRIGGER,
  type FieldSize,
} from "./field-chrome";
import { Icon } from "./icon";
import {
  overlayItemChrome,
  overlayPanelChrome,
  overlayPanelMotion,
} from "./overlay";
import {
  opensAsTray,
  SelectLabelsProvider,
  SelectStateContext,
  SelectTray,
  titleOf,
  TrayGroup,
  TrayItem,
  TrayLabel,
  TrayRowsContext,
  TraySeparator,
  type SelectState,
  type TrayState,
} from "./select-tray";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/* The Sirdab select: a field that discloses a menu.

   TWO FLAVOURS, picked by the props and reported on the trigger as
   data-flavour (there is no flag of their own to forget):

   FIELD [decision]. A bordered variant (secondary, the default,
   or outline) at a field size: xl 40 (the default), touch 44, lg 36. Every
   form select is this one. It wears the INPUT'S chrome, read from the same
   place the Input, Textarea and Combobox read it (field-chrome.ts): the
   alpha-200 border that deepens to alpha-400 on hover and never takes a
   fill or a press wash, the ink border plus 0.5px ring on keyboard focus
   and while the panel is open (never the global offset outline), the
   Input's value type (16px on a phone, 400 weight, 16.8px in Arabic) and
   its corner per size (12px at 40 and 44, 10px at 36). A Button-chrome
   select (hover wash, offset outline, 14px/500 type, a calmer corner)
   made the price Input and the category Select side by side disagree
   about hover, focus, corner and value size, which is the reason a form
   select is a field and not a button. The white field stays white: no fill
   is ever drawn on it.

   TOOLBAR. Ghost and chip at any size, and any variant at 32 and below. A
   menu trigger, not a field: it renders buttonVariants whole, with Button's
   hover/active rungs, the data-[state=open] pairs (Radix stamps the open
   state, Button's classes answer), leading-icon optical pull and per-size
   scaling, and Button's own corner. NOT offered: destructive
   (Button-only), primary ink and link (a select is never THE action nor
   inline text [decision]). Secondary here repeats its hover pair on active,
   so the press stays calm.

   Default variant is SECONDARY and default SIZE is xl (40) [decision],
   matching the Input default; Button's own default (32) stays a size word
   away, and is a toolbar trigger. The trigger HUGS its content [Sirdab,
   global width rule]: a form gives it width at the call site (w-full,
   w-56); the component never sets one. A field select carries the 44px
   `touch-target` box (a phone taps a 44px square around the 40px look).

   ONE UNAVAILABLE STATE: CLOSED. A select that cannot be used says why,
   always, so there is nothing left for a bare `disabled` to express. Closed
   is unavailable-until-a-prerequisite (pick a language before an accent):
   the rest chrome dimmed, with the WHY in two places. An empty closed
   select SHOWS the reason as its placeholder, because a tooltip is not
   enough (touch has no hover); the reason reaches the SelectValue inside
   the trigger by context (so it works however the value is nested or
   wrapped, including children handed over from a server component), and a
   picked value is never replaced. The tooltip repeats it on hover. pointer-events-none
   lands the mouse on a wrapper that keeps the plain arrow and carries the
   reason; the wrapper takes focus (tabIndex 0) for keyboard users while the
   button leaves the tab order, and the caller's layout width moves to the
   wrapper so the tooltip anchors on the visible control. The button carries
   aria-disabled so AT announces the state (the HTML `disabled` attribute
   stays OFF; it would strip the element from interaction semantics
   entirely).

   The disabled: classes below are the MACHINERY fallback, not a state you
   choose: a <fieldset disabled> or react-hook-form can still switch the
   underlying button off, and it must not then look live. They paint the
   same rest-chrome-at-half-opacity closed paints, so the two are
   indistinguishable, which is the point. If you are the one deciding,
   there is exactly one option and it explains itself.

   THE FILTER IS NOT THIS COMPONENT [decision]: a select SETS A VALUE for a
   form field; a filter NARROWS A VIEW, and a filter is not a select
   (aria-haspopup="dialog", cmdk panel, multi-value avatar stacking,
   label-not-placeholder semantics). Clearable/applied chrome/search/multi
   all belong to FilterTrigger (Button + Popover + cmdk) and FilterChip,
   which keep Button's family chrome; a form select never clears (its empty
   state is an error, not an answer).

   The CHEVRON: 50% at rest, 70% on hover and while open (plain opacity on
   currentColor; single-stroke, no double-paint risk), turns over 180 in
   200ms ease-out while open (a rotation, not a colour tick), and NEVER
   flips. Disclosure is vertical in both directions. chevron={false} drops
   it: a ghost text select, or an icon-only trigger (icon size + aria-label,
   no SelectValue).

   PANEL is the first consumer of the frosted-popover treatment: the popover
   surface at 90% over an 8px backdrop blur, so content ghosts through
   faintly. NO border: shadow-popover-sm paints its own hairline. A border
   on top would double it. Panel AND items are 10px: 10-in-10 by design, no
   nesting math. Panels animate at 100ms, one step slower than controls.
   Item rows are PICKER rows, not nav-menu rows: 16px leading icons, 12px
   icon-to-label gap, 400-weight labels at full ink, and 44px tall on a
   touch screen (overlayItemChrome). The check reserves an IN-FLOW box at
   the row's end (ms-auto), never absolute positioning, so selection cannot
   shift the row's text. tone="quiet" on the content is the opt-in menu
   recipe (items at muted-foreground rising to ink on highlight), the pair
   for a chip trigger; ink at rest is the norm.

   BELOW MD IT IS A TRAY [decision]. On a phone a floating panel drops over
   the next card and ends a few pixels off the bottom edge, so below md
   (BELOW_MD, (width < 48rem), the dialog launcher's own breakpoint) a Select
   opens the house Sheet from the bottom instead (select-tray.tsx), titled
   with the field's label and holding the same options as 44px rows, the
   chosen one marked with a check. No consumer changes. The choice is made
   once, inside Radix's onOpenChange(true), from the tap or key that opened
   it: the tray when the window is below md and the trigger sits inside no
   role="dialog" (a Dialog, a Sheet, a Popover, or a hand-set dialog such as
   the record preview all count; a panel over a panel is never the answer, so
   those keep the popover), the popover otherwise. There is no hook and no
   server branch, so the server and hydration render the same trigger and
   nothing corrects a first paint. A caller-controlled `open` pins the
   popover. Radix stays CLOSED while the tray is up, which is why this
   component owns `open` and the value and hands Radix a defined value and a
   boolean: SelectValue, typeahead and the form's bubble input are untouched.
   The tray's title is read from the trigger: its aria-label, else its
   aria-labelledby, else the label that points at it. Past 12 options it
   offers a search (folded, so «سارة» finds «ساره»), never autofocused. It has
   no Done: a row, the scrim, a drag or Escape closes it. A row's `action` is
   not drawn there and `disabledReason` becomes a caption line. The words
   (search, no match, clear, close) come from SelectLabelsProvider, set once
   at an app's root. The tray keeps the Sheet's own slide.

   Positioning is popper (menu drops below the trigger), never Radix's
   item-aligned macOS mode. The highlighted item takes the ghost fill:
   shadcn's bg-accent resolves to nothing here; foundation has no --accent
   on purpose (accent never earned a place as a role). Radix's own
   close-refocus lands with keyboard modality, so the focus ring flashed on
   the trigger even after a mouse click-away. The content refocuses the
   trigger synchronously inside the dismiss event instead: pointer closes
   stay ringless; Escape keeps the ring, keyboard users must see where focus
   went. (One known exception: a cmdk panel with a sticky search header
   stamps itself solid (bg-popover, important) while the frosted default
   stays for plain menus.) */

function Select({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [ownValue, setOwnValue] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : ownValue;
  const [popoverOpen, setPopoverOpen] = React.useState(defaultOpen ?? false);
  const [tray, setTray] = React.useState<TrayState | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const listboxId = React.useId();
  const open = openProp ?? popoverOpen;

  const commit = React.useCallback(
    (next: string): void => {
      if (valueProp === undefined) setOwnValue(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );

  const closeTray = React.useCallback((): void => {
    setTray((current) =>
      current?.open ? { ...current, open: false } : current,
    );
    onOpenChange?.(false);
  }, [onOpenChange]);

  const pick = React.useCallback(
    (next: string): void => {
      if (next !== (value ?? "")) commit(next);
      closeTray();
    },
    [value, commit, closeTray],
  );

  function handleOpenChange(next: boolean): void {
    const trigger = triggerRef.current;
    if (next && openProp === undefined && opensAsTray(trigger)) {
      // A closed select keeps its pointer events off in a browser; this
      // is the same refusal for a click that arrives some other way.
      if (trigger?.getAttribute("aria-disabled") === "true") return;
      setTray((current) => ({
        open: true,
        title: titleOf(trigger),
        session: (current?.session ?? 0) + 1,
      }));
      onOpenChange?.(true);
      return;
    }
    if (openProp === undefined) setPopoverOpen(next);
    onOpenChange?.(next);
  }

  const state = React.useMemo<SelectState>(
    () => ({
      value: value ?? "",
      pick,
      tray,
      closeTray,
      triggerRef,
      listboxId,
    }),
    [value, pick, tray, closeTray, listboxId],
  );

  return (
    <SelectStateContext.Provider value={state}>
      <SelectPrimitive.Root
        data-slot="select"
        value={value ?? ""}
        onValueChange={commit}
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </SelectStateContext.Provider>
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  if (React.useContext(TrayRowsContext))
    return <TrayGroup className={props.className}>{props.children}</TrayGroup>;
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

/* The reason a closed trigger is closed, for the SelectValue inside it. By
   context and not by inspecting the trigger's children: a child's type is
   not the SelectValue function when the children arrive from a server
   component, so a type check silently never matched there. */
const ClosedReasonContext = React.createContext<React.ReactNode>(null);

function SelectValue({
  placeholder,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  const closed = React.useContext(ClosedReasonContext);
  const shown = closed != null ? closed : placeholder;
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      // The value row is a flex container (icon plus text), which an
      // ellipsis cannot reach, so the text is its own truncating box.
      placeholder={
        typeof shown === "string" || typeof shown === "number" ? (
          <span className="truncate">{shown}</span>
        ) : (
          shown
        )
      }
      {...props}
    />
  );
}

type ButtonSizes = NonNullable<VariantProps<typeof buttonVariants>["size"]>;
type ButtonVariants = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

/* The sizes that make a select a FIELD, and the field size each one reads
   its height and corner from: lg is the Input's md (36, 10px), xl its
   default (40, 12px), touch its touch (44, 12px). Any other size is a
   toolbar trigger. */
const FIELD_SIZE_OF: Partial<Record<ButtonSizes, FieldSize>> = {
  lg: "md",
  xl: "default",
  touch: "touch",
};

/* The leading icon on the Input's scale: 16 at 36, 20 at 40 and 44. */
const FIELD_LEADING_ICON: Partial<Record<ButtonSizes, string>> = {
  lg: "[&>svg:first-child:not([class*='size-'])]:size-4",
  xl: "[&>svg:first-child:not([class*='size-'])]:size-5",
  touch: "[&>svg:first-child:not([class*='size-'])]:size-5",
};

function SelectTrigger({
  className,
  variant = "secondary",
  size = "xl",
  closed,
  chevron = true,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  // destructive is Button-only; a primary-ink or link select is not a
  // thing we make [decision]. Icon squares pair with chevron={false} +
  // aria-label and no SelectValue: an icon-only select.
  size?: ButtonSizes;
  variant?: Exclude<ButtonVariants, "destructive" | "default" | "link">;
  /** The reason this select is unavailable ("اختر اللغة أولاً"): the
        designed unavailable state. Rest look at half opacity, arrow
        cursor. The reason is the placeholder of an empty select (no
        hover on touch) and repeats on a tooltip. */
  closed?: React.ReactNode;
  /** false drops the trailing chevron: a ghost text select or an
        icon-only trigger discloses without announcing it. */
  chevron?: boolean;
}) {
  const fieldSize =
    variant === "secondary" || variant === "outline"
      ? FIELD_SIZE_OF[size]
      : undefined;
  const { triggerRef, tray, listboxId } = React.useContext(SelectStateContext);
  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null): void => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, triggerRef],
  );
  /* Radix is closed while the tray is up, so it cannot say the field is
       open. These spread after Radix's own attributes, and only while the tray
       is open: an undefined here would overwrite what Radix wrote. */
  const trayOpenProps = tray?.open
    ? {
        "data-state": "open",
        "aria-expanded": true,
        "aria-controls": listboxId,
      }
    : null;
  const trigger = (
    <SelectPrimitive.Trigger
      ref={setRefs}
      data-slot="select-trigger"
      data-flavour={fieldSize !== undefined ? "field" : "toolbar"}
      data-variant={variant}
      data-size={size}
      className={cn(
        fieldSize !== undefined
          ? // The Input's chrome, shared through field-chrome.ts.
            // ps-3 pe-2: the chevron's own 4px inset puts its stroke
            // 12px from the edge, the Input's text inset.
            cn(
              FIELD_TRIGGER,
              FIELD_HEIGHT[fieldSize],
              FIELD_RADIUS[fieldSize],
              FIELD_LEADING_ICON[size],
              chevron ? "ps-3 pe-2" : "px-3",
            )
          : cn(
              buttonVariants({ variant, size }),
              // Button's machine, snug on the chevron side (the
              // 32-40 rungs) with a 4px gap for the chevron. A
              // LEADING icon (the only direct svg child) gets
              // me-1.5 on top of the gap, landing icon-to-text on
              // the system's 8px rhythm. (The field's own gap is
              // already 8.)
              "justify-between gap-1 disabled:text-foreground [&>svg:not(:only-child)]:me-1.5",
              chevron &&
                (size === "default" || size === "lg" || size === "xl") &&
                "pe-2",
              // Bordered toolbar triggers repeat the HOVER pair on
              // active (alpha-50, not Button's deeper alpha-100):
              // calm under the press. Ghost/chip keep Button's
              // deeper active: the menu-trigger flavour presses
              // like a button.
              (variant === "secondary" || variant === "outline") &&
                "active:bg-btn-surface-hover",
            ),
        // Both flavours: placeholder tone, the value's own icon+text
        // row, and the machinery fallback that dims like a field.
        "group/select-trigger data-placeholder:text-subtle text-start disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        // Icon squares recenter their lone icon (justify-between
        // parks a single child at the start). WIDTH RULE [Sirdab,
        // global]: EVERY trigger hugs its content. Forms opt into
        // w-full/w-56 at the call site (a form's w-full is exactly
        // that: a form-column width, owned by the layout).
        size.startsWith("icon") && "justify-center",
        closed != null && "pointer-events-none w-full opacity-50",
        // When closed, the caller's layout width moves to the
        // tooltip's wrapper span: the anchor must be exactly the
        // visible control, and the trigger fills it.
        closed == null && className,
      )}
      tabIndex={closed != null ? -1 : undefined}
      aria-disabled={closed != null ? true : undefined}
      {...props}
      {...trayOpenProps}
    >
      <ClosedReasonContext.Provider value={closed ?? null}>
        {children}
      </ClosedReasonContext.Provider>
      {chevron ? (
        <SelectPrimitive.Icon asChild>
          {/* The chevron's ladder: 50% at rest, 70% on trigger hover
                       and while open, turning 180 over 200ms ease-out on
                       open. Only the ROTATION animates: the opacity step
                       snaps (transition-transform, no opacity in the list).
                       Plain opacity on currentColor: a chevron is
                       single-stroke, so the icon-quiet double-paint
                       mechanism isn't needed. No flip: disclosure is
                       vertical in LTR and RTL alike. */}
          <span
            aria-hidden
            className="flex size-4 shrink-0 rotate-0 items-center justify-center opacity-50 transition-transform duration-200 ease-out group-hover/select-trigger:opacity-70 group-data-[state=open]/select-trigger:rotate-180 group-data-[state=open]/select-trigger:opacity-70 motion-reduce:transition-none"
          >
            <Icon icon={ChevronDownIcon} className="size-4" />
          </span>
        </SelectPrimitive.Icon>
      ) : null}
    </SelectPrimitive.Trigger>
  );

  if (closed == null) return trigger;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-slot="select-trigger-closed"
          tabIndex={0}
          className={cn("inline-flex cursor-default", className)}
        >
          {trigger}
        </span>
      </TooltipTrigger>
      <TooltipContent>{closed}</TooltipContent>
    </Tooltip>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  tone,
  style,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  /** "quiet" renders items at muted-foreground rising to ink on
        highlight: the menu recipe, the natural pair for a
        chip trigger. Default items are ink. */
  tone?: "quiet";
}) {
  trackFocusModality();
  return (
    <>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          // The Popover's own gutter: a nested select's last row
          // clears the screen edge.
          collisionPadding={16}
          data-slot="select-content"
          data-tone={tone}
          // No border: shadow-popover-sm paints the hairline.
          // flex column + overflow-hidden: the VIEWPORT is the
          // scroller (Radix hides its scrollbar and drives it from
          // the chevron strips). overflow on the content made the
          // panel itself scroll: the strips scrolled away with the
          // list and a scrollbar appeared beside them.
          className={cn(
            overlayPanelChrome,
            "z-popover relative flex flex-col overflow-hidden data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            overlayPanelMotion,
            className,
          )}
          // Radix measurement vars are structural, not design values; the token
          // lint bans var-shorthand utilities, so they live in style.
          style={{
            maxHeight: "var(--radix-select-content-available-height)",
            minWidth: "8rem",
            ...style,
          }}
          position={position}
          /* Click-away must not leave a focus ring on the trigger; see
                   restoreTriggerFocus. Escape still rings. */
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            restoreTriggerFocus(event);
          }}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              "p-1",
              // The viewport is the scroller, so it is where the
              // touch guards belong: on a phone a select can open
              // inside a body vaul has pinned with `position: fixed`,
              // and iOS Safari gives the drag to that body instead.
              "touch-pan-y overscroll-contain",
              position === "popper" && "w-full scroll-my-1",
            )}
            // No height pin (a shadcn leftover that fought the
            // flex scroller); the panel never renders narrower
            // than its trigger.
            style={
              position === "popper"
                ? {
                    minWidth: "var(--radix-select-trigger-width)",
                  }
                : undefined
            }
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
      <SelectTray className={className}>{children}</SelectTray>
    </>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  if (React.useContext(TrayRowsContext))
    return <TrayLabel className={className}>{props.children}</TrayLabel>;
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "text-caption text-muted-foreground px-2 py-1.5",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  action,
  disabled,
  disabledReason,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
  action?: React.ReactNode;
  /** Why this option is unavailable (implies disabled). Radix keeps the
        option unselectable, but pointer events come back ON so hovering
        the row can show the reason (a disabled row normally swallows
        hover, which would eat the tooltip). The tooltip sits OUTSIDE the
        panel on the LEADING side (direction-resolved: popper sides are
        physical). */
  disabledReason?: React.ReactNode;
}) {
  const dir = Direction.useDirection();
  if (React.useContext(TrayRowsContext))
    return (
      <TrayItem
        value={props.value}
        disabled={disabled}
        disabledReason={disabledReason}
        className={className}
      >
        {children}
      </TrayItem>
    );
  const item = (
    <SelectPrimitive.Item
      disabled={disabled === true || disabledReason != null}
      data-slot="select-item"
      className={cn(
        overlayItemChrome,
        "group/select-item focus:bg-btn-ghost-surface-hover in-data-[tone=quiet]:text-muted-foreground in-data-[tone=quiet]:focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        disabledReason != null &&
          "data-disabled:pointer-events-auto data-disabled:cursor-default",
        className,
      )}
      {...props}
    >
      {/* ItemText wraps children in its own span: icons passed as
                children land INSIDE it, so the row layout and the 16px
                direct-child icon rule (the picker's, not the nav menu's
                20px) live here via asChild. SelectValue mirrors this span
                into the trigger, sizing carried along. */}
      <SelectPrimitive.ItemText asChild>
        <span className="flex min-w-0 items-center gap-3 [&>svg:not([class*='size-'])]:size-4">
          {/* Plain text is its own truncating box: this row is a flex
                        container, which an ellipsis cannot reach, and the
                        same span is mirrored into the trigger. */}
          {React.Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number" ? (
              <span className="truncate">{child}</span>
            ) : (
              child
            ),
          )}
        </span>
      </SelectPrimitive.ItemText>
      {/* In-flow, always-reserved box: the check mounting can never
                shift the row's text. */}
      <span
        data-slot="select-item-indicator"
        className="ms-auto me-0.5 flex size-4 shrink-0 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {/* Row action (a pin, say): REVEALED on row highlight
                (focus follows the pointer in a select), instantly, no
                transition. Its events stop here so pressing it
                never selects. POINTER-ONLY by construction: an open Radix
                Select owns the keyboard (roving item focus, no Tab path
                into a row), so the action must never be the sole route to
                its operation. Offer a keyboard-reachable equivalent
                elsewhere. The full pattern lands with DropdownMenu, which
                does support focusable row controls. The control is
                icon-xs (24): the nearest on-grid step (22 sits off the
                control grid). */}
      {action != null ? (
        <span
          data-slot="select-item-action"
          className="flex shrink-0 items-center opacity-0 group-focus/select-item:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {action}
        </span>
      ) : null}
    </SelectPrimitive.Item>
  );

  if (disabledReason == null) return item;
  return (
    <Tooltip>
      {/* The trigger goes on a WRAPPER: asChild would merge Radix
                Tooltip's own data-state onto the item and overwrite
                data-state="checked". It is invisible here (a disabled
                item is never the checked one) but it also took the
                item's data-slot, which the guard tests and any future
                styling select on. */}
      <TooltipTrigger asChild>
        <span className="block">{item}</span>
      </TooltipTrigger>
      {/* sideOffset clears the panel's own inset so the chip sits
                outside the frosted edge. */}
      <TooltipContent side={dir === "rtl" ? "right" : "left"} sideOffset={8}>
        {disabledReason}
      </TooltipContent>
    </Tooltip>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  if (React.useContext(TrayRowsContext))
    return <TraySeparator className={className} />;
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

/**
 * Usage:
 *
 *     <Select value={category} onValueChange={setCategory}>
 *         <SelectTrigger className="w-56">
 *             <Icon icon={Tag} />
 *             <SelectValue placeholder="اختر التصنيف" />
 *         </SelectTrigger>
 *         <SelectContent>
 *             <SelectItem value="apparel">ملابس</SelectItem>
 *             <SelectItem value="beauty">عناية</SelectItem>
 *         </SelectContent>
 *     </Select>
 *
 * The trigger takes Button's variant and size props (no destructive).
 * The default (secondary, xl 40) is the FIELD: it matches the Input beside
 * it, so a form row is one family. variant="ghost" for toolbars, "chip" for
 * filter-flavoured pickers, size="default" (32) for dense toolbars: those
 * are the TOOLBAR flavour and keep Button's chrome. chevron={false} drops
 * the trailing chevron: with an icon size, an aria-label and no SelectValue
 * that is the icon-only select. A leading icon is a child before
 * SelectValue and scales per size like any button icon.
 *
 * Pair with a Label via the trigger's id. Width: every trigger HUGS its
 * content [global rule]. Form rows pass w-full (or a column width) as
 * call-site layout; hugging triggers change width with the value, so pin
 * a width wherever that jump would distract. The panel never renders
 * narrower than the trigger. Group with SelectGroup
 * + SelectLabel, divide with SelectSeparator. className is for LAYOUT
 * only. Colour, radius, and sizing come from the component.
 */
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectLabelsProvider,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
