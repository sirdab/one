"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  disabledReason,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  disabledReason?: React.ReactNode;
}) {
  const control = (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer border-border-interactive data-[state=checked]:border-primary hover:data-[state=unchecked]:border-input-border-hover-form aspect-square size-4 shrink-0 cursor-pointer rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        forceMount
        className="grid place-content-center"
      >
        <span className="bg-primary block size-2 rounded-full opacity-0 transition-opacity duration-100 in-data-[state=checked]:opacity-100" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );

  return withDisabledReason(control, disabledReason);
}

export { RadioGroup, RadioGroupItem };
