"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { CheckIcon } from "../icons/catalogue";
import { MinusIcon } from "../icons/general";
import { refusalProps, withDisabledReason } from "./disabled-reason";

const CHECKBOX_BOX =
  "size-4 shrink-0 rounded-xs border border-border-interactive transition-colors duration-150 ease-out pointer-coarse:size-5 pointer-coarse:rounded-sm motion-reduce:transition-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground";

const GLYPH_BOX = "relative block size-3.5 pointer-coarse:size-4.5";
const GLYPH =
  "absolute inset-0 size-full scale-75 opacity-0 transition duration-150 ease-out motion-reduce:transition-none";

function Checkbox({
  className,
  disabledReason,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  disabledReason?: React.ReactNode;
}) {
  const control = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        CHECKBOX_BOX,
        "peer touch-target hover:data-[state=unchecked]:border-input-border-hover-form relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        forceMount
        className="grid place-content-center text-current"
      >
        <span className={GLYPH_BOX}>
          <CheckIcon
            strokeWidth={3}
            className={cn(
              GLYPH,
              "in-data-[state=checked]:scale-100 in-data-[state=checked]:opacity-100",
            )}
          />
          <MinusIcon
            strokeWidth={3}
            className={cn(
              GLYPH,
              "in-data-[state=indeterminate]:scale-100 in-data-[state=indeterminate]:opacity-100",
            )}
          />
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  return withDisabledReason(control, disabledReason);
}

function CheckboxMark({
  checked,
  className,
}: {
  checked: boolean | "indeterminate";
  className?: string;
}): React.JSX.Element {
  const state =
    checked === "indeterminate"
      ? "indeterminate"
      : checked
        ? "checked"
        : "unchecked";
  return (
    <span
      aria-hidden
      data-slot="checkbox-mark"
      data-state={state}
      className={cn("grid place-content-center", CHECKBOX_BOX, className)}
    >
      <span className={GLYPH_BOX}>
        <CheckIcon
          strokeWidth={3}
          className={cn(
            GLYPH,
            "in-data-[state=checked]:scale-100 in-data-[state=checked]:opacity-100",
          )}
        />
        <MinusIcon
          strokeWidth={3}
          className={cn(
            GLYPH,
            "in-data-[state=indeterminate]:scale-100 in-data-[state=indeterminate]:opacity-100",
          )}
        />
      </span>
    </span>
  );
}

export { Checkbox, CheckboxMark };
