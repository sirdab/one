"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { useSlideFrom } from "../../lib/use-slide-from";
import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export const SEGMENTED_TRACK =
  "flex h-control-xl w-fit max-w-full items-center overflow-x-auto no-scrollbar rounded-xl bg-muted p-1 pointer-coarse:h-control-touch";
export const SEGMENTED_ITEM =
  "group relative touch-target h-8 shrink-0 rounded-md px-2.5 text-muted-foreground hover:text-foreground pointer-coarse:h-9";
export const SEGMENTED_THUMB =
  "absolute inset-0 rounded-md bg-background shadow-raised";

const SegmentedContext = React.createContext<{
  value: string | undefined;
  thumbRef: React.RefObject<HTMLSpanElement | null>;
  animated: boolean;
} | null>(null);

function Segmented({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  animated = true,
  concealed,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  animated?: boolean;

  concealed?: boolean;
}) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);

  const current = (isControlled ? valueProp : internal) ?? undefined;
  const thumbRef = useSlideFrom<HTMLSpanElement>(current, animated);
  return (
    <SegmentedContext.Provider value={{ value: current, thumbRef, animated }}>
      <RadioGroupPrimitive.Root
        data-slot="segmented"
        className={cn(
          SEGMENTED_TRACK,
          concealed === true && "invisible",
          concealed === false &&
            "animate-in fade-in-0 zoom-in-75 duration-200 ease-out",
          className,
        )}
        inert={concealed || undefined}
        aria-hidden={concealed || undefined}
        value={isControlled ? valueProp : undefined}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          if (!isControlled) setInternal(next);
          onValueChange?.(next);
        }}
        {...props}
      />
    </SegmentedContext.Provider>
  );
}

function SegmentedItem({
  className,
  icon,
  label,
  iconOnly,
  hint,
  mark,
  disabledReason,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "children"> & {
  icon?: React.ReactNode;

  label: string;

  iconOnly?: boolean;

  disabledReason?: React.ReactNode;

  hint?: React.ReactNode;

  mark?: string;
}) {
  const group = React.useContext(SegmentedContext);
  const checked = group?.value === props.value;
  const glyphOnly = iconOnly === true && icon != null;
  const alwaysLabel = !glyphOnly && (group?.animated === false || icon == null);
  const item = (
    <RadioGroupPrimitive.Item
      data-slot="segmented-item"
      className={cn(
        SEGMENTED_ITEM,
        icon != null && "px-2 pointer-coarse:min-w-11",
        glyphOnly && "w-8 px-0 pointer-coarse:w-11",

        icon != null &&
          !glyphOnly &&
          group?.animated !== false &&
          "transition-all duration-200 data-[state=checked]:ps-1.5",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      {checked ? (
        group?.animated === false ? (
          <span data-slot="segmented-thumb" className={SEGMENTED_THUMB} />
        ) : (
          <span
            ref={group?.thumbRef}
            data-slot="segmented-thumb"

            className={cn(
              SEGMENTED_THUMB,
              "transition-all duration-200 motion-reduce:transition-none",
            )}
          />
        )
      ) : null}
      <div className="z-raised relative flex h-full items-center justify-center">
        {icon != null ? (
          <span
            className={cn(
              "text-muted-foreground flex shrink-0 items-center group-hover:text-foreground group-data-[state=checked]:text-foreground [&_svg:not([class*='size-'])]:size-4",
              group?.animated !== false &&
                "[&_svg]:transition-colors [&_svg]:duration-200",
            )}
          >
            {icon}
          </span>
        ) : null}
        {alwaysLabel ? null : <span className="sr-only">{label}</span>}
        {glyphOnly ? null : alwaysLabel ? (
          <div
            data-slot="segmented-label"
            className={cn(
              "text-label overflow-hidden whitespace-nowrap",
              group?.animated !== false && "transition-colors duration-200",
              checked
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          >
            <span className={cn(icon != null && "ms-2")}>{label}</span>
          </div>
        ) : (
          <div
            aria-hidden
            data-open={checked ? "" : undefined}
            className="reveal-inline duration-200"
          >
            <div className="text-label whitespace-nowrap text-foreground">
              <span className="ms-2">{label}</span>
            </div>
          </div>
        )}
        {mark != null ? (
          <>
            <span
              aria-hidden
              data-slot="segmented-mark"
              className="bg-unread ms-1.5 size-1.5 shrink-0 rounded-full"
            />
            <span className="sr-only">{mark}</span>
          </>
        ) : null}
      </div>
    </RadioGroupPrimitive.Item>
  );

  if (disabledReason != null) {
    return withDisabledReason(item, disabledReason, "inline-flex shrink-0");
  }
  if (hint == null) return item;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0">{item}</span>
      </TooltipTrigger>

      <TooltipContent side="bottom">{hint}</TooltipContent>
    </Tooltip>
  );
}

export { Segmented, SegmentedItem };
