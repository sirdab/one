"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { toggleVariants, type ToggleVariantProps } from "./toggle";

/* A row of toggles that answer one question together. type="single" is a
   pick-one (ratios, sizes): Radix gives it radio semantics and arrow-key
   movement between the items. type="multiple" is a set of independent
   switches. Trued after the shadcn add: the items are separate chips 8px
   apart, wrapping, not shadcn's joined bar (a joined, sliding pick-one is
   Tabs variant="segmented"), so the spacing prop is gone.

   A single group lets Radix clear the value when the pressed item is pressed
   again. `required` keeps a pick-one picked: the second press is ignored,
   which is what a pick-one with a default means. */
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
