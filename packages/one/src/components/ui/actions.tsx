"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";
import { Button } from "./button";
import { Icon } from "./icon";

/* The Sirdab message actions: copy, thumbs up, thumbs down under a finished
   reply. Taken from the shadcn.io AI Elements actions and trued: each
   action is a ghost icon Button whose label is BOTH the aria-label and the
   hint by default (the house rule for icon-only controls: a screen reader
   gets the name, everyone else gets the tooltip; `showHint={false}` keeps
   only the name), with no hand-rolled tooltip
   wrapper, and the icon arrives as a value so <Icon> owns flip and
   labelling. Pressed (the thumb the merchant chose) fills the glyph, or
   swaps in `pressedIcon` when the set draws its own solid twin, rather
   than tinting the button: a ghost has no "on" rung and status colours
   report, they never mark a choice.

   Usage:
       <Actions>
           <Action icon={Copy} label={t("copy")} onClick={copy} />
           <Action icon={ThumbsUp} label={t("good")} pressed={rating === 1} onClick={() => rate(1)} />
       </Actions>
*/
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
  /** The solid twin shown while pressed, for a set whose outline cannot
        simply be filled. */
  pressedIcon?: IconComponent;
  /** False drops the tooltip where the glyph says it all (the thumbs);
        the label stays the accessible name. */
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
