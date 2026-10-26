import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";
import { Icon } from "./icon";

/* The Sirdab empty state. The house "nothing here" treatment, promoted from
   the shell (notifications panel, search palette) so every empty surface
   speaks in one voice: a quiet icon WELL (--muted is the documented fill
   for wells), the message at body-quiet, an optional quieter line saying
   what will appear here, and an optional action slot for the one thing the
   person can do about it (see `action` below for what may sit in it).

   Deliberately NOT shadcn's Empty family (Empty/EmptyHeader/EmptyMedia/
   EmptyTitle/EmptyContent): that is a roomier page-level composition, and
   TOKENS.md's standing note applies: shadcn's default compositions are
   roomier and more boxed than dense tooling. Our empty states live inside
   popovers and command lists, so the compact single-component shape wins.

   The icon is decorative: <Icon> is aria-hidden by default and the title
   carries the meaning, so nothing is announced twice. Idle-vs-no-results
   phrasing is the CALLER's decision (an invitation is not a result);
   this component only owns the shape.

   `className` is layout-only: the surface hosting the state owns its own
   padding and borders (a popover's py-8, a command list's py-6).

   Two sizes. `default` is the whisper above, for a state that sits inside
   something else. `lg` is for a state that IS the surface (a whole panel
   with nothing else in it, like the assistant for an account with no
   store): there a body-quiet line reads as a leftover, so the message is a
   heading-xs statement in the foreground, the caption steps up to body in
   the muted tone, and the well grows with it. Pick by what surrounds the
   state, never to make one louder than its neighbours. */
const SIZES = {
  default: {
    root: "gap-3",
    well: "size-10",
    icon: "size-5",
    title: "text-body-quiet text-muted-foreground",
    caption: "text-caption-quiet text-subtle",
  },
  lg: {
    root: "gap-4",
    well: "size-12",
    icon: "size-6",
    title: "text-heading-xs text-balance text-foreground",
    caption: "text-body text-pretty text-muted-foreground",
  },
} as const;

function EmptyState({
  icon,
  title,
  caption,
  action,
  size = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon: IconComponent;
  title: React.ReactNode;
  /** The quieter second line: what will appear here, not what is missing. */
  caption?: React.ReactNode;
  /** The action that fills the state: one house Button, or one primary and
        at most one secondary inside a wrapper that owns the breakpoint
        layout; never a row of them. */
  action?: React.ReactNode;
  /** `lg` when the state is the whole surface, not a part of one. */
  size?: keyof typeof SIZES;
}) {
  const tier = SIZES[size];
  return (
    <div
      data-slot="empty-state"
      data-size={size}
      className={cn(
        "flex flex-col items-center text-center",
        tier.root,
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "bg-muted text-muted-foreground flex items-center justify-center rounded-full",
          tier.well,
        )}
      >
        <Icon icon={icon} className={tier.icon} />
      </span>
      <span className="flex flex-col gap-1">
        <span className={tier.title}>{title}</span>
        {caption ? <span className={tier.caption}>{caption}</span> : null}
      </span>
      {action}
    </div>
  );
}

export { EmptyState };
