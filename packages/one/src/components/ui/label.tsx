"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

const CONTROL_ROW = [
  "has-[>:is([role=checkbox],[role=radio],[role=switch])]:items-start",
  "[&>[role=checkbox]]:mt-0.5 [&>[role=radio]]:mt-0.5",
  "rtl:[&>[role=checkbox]]:mt-1 rtl:[&>[role=radio]]:mt-1 rtl:[&>[role=switch]]:mt-0.5",
  "pointer-coarse:[&>[role=checkbox]]:mt-0 rtl:pointer-coarse:[&>[role=checkbox]]:mt-0.5",
  "pointer-coarse:has-[>:is([role=checkbox],[role=radio],[role=switch])]:min-h-11",
  "pointer-coarse:has-[>:is([role=checkbox],[role=radio],[role=switch])]:py-3",
].join(" ");

function Label({
  className,
  hint,
  stacked = false,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  hint?: React.ReactNode;

  stacked?: boolean;
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-body flex items-stretch gap-1.5 font-medium text-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[button]:cursor-pointer has-[button:disabled]:cursor-not-allowed",
        CONTROL_ROW,
        stacked && "flex-col",
        className,
      )}
      {...props}
    >
      {children}
      {hint != null ? (
        <span className="text-caption-quiet text-muted-foreground">{hint}</span>
      ) : null}
    </LabelPrimitive.Root>
  );
}

export { Label };
