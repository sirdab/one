"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { toggleVariants, type ToggleVariantProps } from "./toggle";

const ToggleGroupContext = React.createContext<ToggleVariantProps>({});

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  ToggleVariantProps & { required?: boolean };

function ToggleGroup({
  className,
  variant,
  size,
  required = false,
  children,
  ...props
}: ToggleGroupProps) {
  const guarded =
    required && props.type === "single"
      ? {
          ...props,
          onValueChange: (value: string): void => {
            if (value !== "") props.onValueChange?.(value);
          },
        }
      : props;
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...(guarded as React.ComponentProps<typeof ToggleGroupPrimitive.Root>)}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  ToggleVariantProps) {
  const context = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({
          variant: context.variant ?? variant,
          size: context.size ?? size,
        }),
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
