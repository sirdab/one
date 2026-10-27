import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";
import { Icon } from "./icon";

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

  caption?: React.ReactNode;

  action?: React.ReactNode;

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
