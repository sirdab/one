import * as React from "react";

import { cn } from "../../lib/utils";
import {
  FIELD_BORDER,
  FIELD_FOCUS_WITHIN,
  FIELD_HEIGHT,
  FIELD_RADIUS,
  FIELD_VALUE,
  type FieldSize,
} from "./field-chrome";

const INPUT_HOVER =
  "hover:not-focus-within:not-has-[:is(input,textarea,select):read-only]:border-input-border-hover";

export const INPUT_SIZE_CLASSES: Record<FieldSize, string> = {
  sm: `${FIELD_HEIGHT.sm} ${FIELD_RADIUS.sm} px-2.5 ${INPUT_HOVER}`,
  md: `${FIELD_HEIGHT.md} ${FIELD_RADIUS.md} px-3 ${INPUT_HOVER}`,
  default: `${FIELD_HEIGHT.default} ${FIELD_RADIUS.default} px-3 ${INPUT_HOVER}`,
  search: `${FIELD_HEIGHT.search} ${FIELD_RADIUS.search} px-3 ${INPUT_HOVER}`,
  touch: `${FIELD_HEIGHT.touch} ${FIELD_RADIUS.touch} px-3 ${INPUT_HOVER}`,
};

export const INPUT_LEADING_ICON: Record<FieldSize, string> = {
  sm: "[&_svg]:size-4",
  md: "[&_svg]:size-4",
  default: "[&_svg]:size-5",
  search: "[&_svg]:size-5",
  touch: "[&_svg]:size-5",
};

export const INPUT_FIELD_CLASSES = cn(
  "selection:bg-primary selection:text-primary-foreground placeholder:text-subtle size-full min-w-0 bg-transparent outline-hidden focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:appearance-none",
  FIELD_VALUE,
);

/**
 * Input without the tooltip, clear button and floating label machinery, for
 * public pages that count every kilobyte. Draws the same field as Input.
 */
function InputBase({
  className,
  inputClassName,
  size = "default",
  leading,
  trailing,
  dir,
  ...props
}: Omit<React.ComponentProps<"input">, "size" | "children"> & {
  inputClassName?: string;
  size?: FieldSize;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      data-slot="input-wrapper"
      data-size={size}
      dir={dir === "auto" ? undefined : dir}
      className={cn(
        "group flex w-full min-w-0 cursor-text items-center gap-2 bg-transparent transition-colors duration-100",
        FIELD_BORDER,
        INPUT_SIZE_CLASSES[size],
        FIELD_FOCUS_WITHIN,
        trailing != null && "pe-1",
        "has-disabled:cursor-not-allowed",
        className,
      )}
    >
      {leading ? (
        <span
          className={cn(
            "icon-quiet group-has-disabled:icon-quiet-disabled flex shrink-0 items-center",
            INPUT_LEADING_ICON[size],
          )}
        >
          {leading}
        </span>
      ) : null}
      <span className="relative flex min-w-0 grow self-stretch">
        <input
          data-slot="input-field"
          className={cn(INPUT_FIELD_CLASSES, inputClassName)}
          dir={dir === "auto" && props.value === "" ? undefined : dir}
          {...props}
        />
      </span>
      {trailing}
    </div>
  );
}

export { InputBase };
