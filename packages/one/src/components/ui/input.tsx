"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { LoaderIcon } from "../icons/general";
import { CloseIcon } from "../icons/shell";
import { Button } from "./button";
import { refusalProps, withDisabledReason } from "./disabled-reason";
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

const SIZE_CLASSES: Record<FieldSize, string> = {
  sm: `${FIELD_HEIGHT.sm} ${FIELD_RADIUS.sm} px-2.5 ${INPUT_HOVER}`,
  md: `${FIELD_HEIGHT.md} ${FIELD_RADIUS.md} px-3 ${INPUT_HOVER}`,
  default: `${FIELD_HEIGHT.default} ${FIELD_RADIUS.default} px-3 ${INPUT_HOVER}`,
  search: `${FIELD_HEIGHT.search} ${FIELD_RADIUS.search} px-3 ${INPUT_HOVER}`,
  touch: `${FIELD_HEIGHT.touch} ${FIELD_RADIUS.touch} px-3 ${INPUT_HOVER}`,
};

const LEADING_ICON = {
  sm: "[&_svg]:size-4",
  md: "[&_svg]:size-4",
  default: "[&_svg]:size-5",
  search: "[&_svg]:size-5",
  touch: "[&_svg]:size-5",
} as const;

function Input({
  className,
  inputClassName,
  type,
  bare = false,
  size = "default",
  leading,
  leadingControl,
  trailing,
  loading = false,
  disabledReason,
  clearLabel,
  floatingLabel,
  dir,
  ref,
  ...props
}: Omit<React.ComponentProps<"input">, "size" | "children"> & {
  floatingLabel?: string;

  clearLabel?: string;

  disabledReason?: React.ReactNode;
  inputClassName?: string;

  bare?: boolean;
  size?: FieldSize;
  leading?: React.ReactNode;

  leadingControl?: React.ReactNode;
  trailing?: React.ReactNode;
  loading?: boolean;
}) {
  const inner = React.useRef<HTMLInputElement | null>(null);
  const autoId = React.useId();
  const fieldId = props.id ?? autoId;
  const floating = floatingLabel !== undefined && !bare;
  const setRef = (node: HTMLInputElement | null): void => {
    inner.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const clearable =
    type === "search" &&
    clearLabel !== undefined &&
    trailing == null &&
    !props.disabled &&
    typeof props.value === "string" &&
    props.value !== "";

  function clear(): void {
    const node = inner.current;
    if (!node) return;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(node, "");
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.focus();
  }
  const trailingSlot = clearable ? (
    <Button
      type="button"
      variant="ghost"
      size={size === "sm" || size === "md" ? "icon-sm" : "icon"}
      aria-label={clearLabel}
      onClick={clear}
    >
      <CloseIcon />
    </Button>
  ) : (
    trailing
  );
  const field = (
    <div
      data-slot="input-wrapper"
      data-size={size}

      dir={dir === "auto" ? undefined : dir}
      className={cn(
        "group flex w-full min-w-0 cursor-text items-center gap-2 bg-transparent transition-colors duration-100",
        bare ? "" : cn(FIELD_BORDER, SIZE_CLASSES[size], FIELD_FOCUS_WITHIN),
        (trailingSlot != null || loading) && "pe-1",
        leadingControl != null && "ps-1",
        "has-disabled:cursor-not-allowed",
        !floating && className,
      )}

      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("input, button, a, [role=button]")) return;
        const field = event.currentTarget.querySelector<HTMLInputElement>(
          'input[data-slot="input-field"]',
        );
        if (!field || field.disabled) return;
        event.preventDefault();
        field.focus();
      }}
    >
      {leadingControl != null ? (
        <span
          data-slot="input-leading-control"
          className="flex shrink-0 items-center"
        >
          {leadingControl}
        </span>
      ) : null}
      {leading ? (
        <span
          className={cn(
            "icon-quiet group-has-disabled:icon-quiet-disabled flex shrink-0 items-center transition-opacity duration-100 group-focus-within:opacity-100",
            LEADING_ICON[size],
          )}
        >
          {leading}
        </span>
      ) : null}

      <span className="relative flex min-w-0 grow self-stretch">
        <input
          ref={setRef}
          type={type}
          data-slot="input-field"
          className={cn(
            "selection:bg-primary selection:text-primary-foreground placeholder:text-subtle size-full min-w-0 bg-transparent disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:appearance-none",
            FIELD_VALUE,

            bare ? "rounded-sm" : "outline-hidden focus-visible:outline-hidden",
            floating &&
              "focus:placeholder:text-subtle placeholder:text-transparent",
            inputClassName,
          )}

          dir={dir === "auto" && props.value === "" ? undefined : dir}
          {...props}

          {...(floating
            ? {
                id: fieldId,
                placeholder: props.placeholder ?? " ",
              }
            : {})}
          {...refusalProps(disabledReason, "field")}
        />
      </span>

      {loading ? (
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center text-foreground"
        >
          <LoaderIcon className="size-4 animate-spin" />
        </span>
      ) : null}
      {trailingSlot}
    </div>
  );

  if (!floating) {
    return withDisabledReason(field, disabledReason, "block w-full");
  }

  const floated = (
    <div className={cn("group/float relative w-full", className)}>
      {field}

      <label
        htmlFor={fieldId}
        className={cn(
          "bg-card text-muted-foreground pointer-events-none absolute start-3 top-0 max-w-4/5 origin-left -translate-y-1/2 scale-75 truncate px-1 transition-all duration-150 ease-out motion-reduce:transition-none rtl:origin-right",
          FIELD_VALUE,

          "group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:text-subtle group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:start-2 group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:top-1/2 group-not-focus-within/float:group-has-[[data-slot=input-field]:placeholder-shown]/float:scale-100",
          "group-focus-within/float:text-foreground",
          "group-has-disabled/float:opacity-50",
        )}
      >
        {floatingLabel}
      </label>
    </div>
  );
  return withDisabledReason(floated, disabledReason, "block w-full");
}

export { Input };
