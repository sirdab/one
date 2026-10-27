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

const FIELD_SIZE_OF: Partial<Record<ButtonSizes, FieldSize>> = {
  lg: "md",
  xl: "default",
  touch: "touch",
};

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
  size?: ButtonSizes;
  variant?: Exclude<ButtonVariants, "destructive" | "default" | "link">;

  closed?: React.ReactNode;

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
          ? cn(
              FIELD_TRIGGER,
              FIELD_HEIGHT[fieldSize],
              FIELD_RADIUS[fieldSize],
              FIELD_LEADING_ICON[size],
              chevron ? "ps-3 pe-2" : "px-3",
            )
          : cn(
              buttonVariants({ variant, size }),

              "justify-between gap-1 disabled:text-foreground [&>svg:not(:only-child)]:me-1.5",
              chevron &&
                (size === "default" || size === "lg" || size === "xl") &&
                "pe-2",

              (variant === "secondary" || variant === "outline") &&
                "active:bg-btn-surface-hover",
            ),

        "group/select-trigger data-placeholder:text-subtle text-start disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",

        size.startsWith("icon") && "justify-center",
        closed != null && "pointer-events-none w-full opacity-50",

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
  tone?: "quiet";
}) {
  trackFocusModality();
  return (
    <>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          collisionPadding={16}
          data-slot="select-content"
          data-tone={tone}

          className={cn(
            overlayPanelChrome,
            "z-popover relative flex flex-col overflow-hidden data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            overlayPanelMotion,
            className,
          )}

          style={{
            maxHeight: "var(--radix-select-content-available-height)",
            minWidth: "8rem",
            ...style,
          }}
          position={position}

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

              "touch-pan-y overscroll-contain",
              position === "popper" && "w-full scroll-my-1",
            )}

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
      <SelectPrimitive.ItemText asChild>
        <span className="flex min-w-0 items-center gap-3 [&>svg:not([class*='size-'])]:size-4">
          {React.Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number" ? (
              <span className="truncate">{child}</span>
            ) : (
              child
            ),
          )}
        </span>
      </SelectPrimitive.ItemText>

      <span
        data-slot="select-item-indicator"
        className="ms-auto me-0.5 flex size-4 shrink-0 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

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
      <TooltipTrigger asChild>
        <span className="block">{item}</span>
      </TooltipTrigger>

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
