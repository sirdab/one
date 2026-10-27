"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";
import { Button } from "./button";
import { Icon } from "./icon";

function Actions({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="actions"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

interface ActionProps extends Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size" | "children" | "aria-label" | "hint"
> {
  label: string;
  icon: IconComponent;
  pressed?: boolean;

  pressedIcon?: IconComponent;

  showHint?: boolean;
}

function Action({
  label,
  icon,
  pressed,
  pressedIcon,
  showHint = true,
  ...props
}: ActionProps): React.JSX.Element {
  return (
    <Button
      data-slot="action"
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={pressed}
      hint={showHint ? label : undefined}
      {...props}
    >
      {pressed && pressedIcon ? (
        <Icon icon={pressedIcon} />
      ) : (
        <Icon icon={icon} className={cn(pressed && "fill-current")} />
      )}
    </Button>
  );
}

export { Action, Actions };
export type { ActionProps };
