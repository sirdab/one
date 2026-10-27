"use client";

import * as React from "react";
import { Direction, Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";

function Switch({
  className,
  disabledReason,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  disabledReason?: React.ReactNode;
}) {
  const direction = Direction.useDirection(
    props.dir === "rtl" || props.dir === "ltr" ? props.dir : undefined,
  );
  const control = (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch touch-target data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-alpha-300 hover:data-[state=unchecked]:bg-gray-alpha-350 relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      <SwitchPrimitive.Thumb
        key={direction}
        style={{ transitionProperty: "translate, width" }}
        data-slot="switch-thumb"
        className={cn(
          "shadow-raised pointer-events-none block size-4 rounded-full bg-background duration-150 ease-in-out data-[state=unchecked]:translate-x-0",

          "group-active/switch:w-5 data-[state=checked]:translate-x-4 group-active/switch:data-[state=checked]:translate-x-3 rtl:data-[state=checked]:-translate-x-4 rtl:group-active/switch:data-[state=checked]:-translate-x-3",
        )}
      />
    </SwitchPrimitive.Root>
  );

  return withDisabledReason(control, disabledReason);
}

export { Switch };
