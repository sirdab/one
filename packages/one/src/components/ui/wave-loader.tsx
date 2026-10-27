import * as React from "react";

import { cn } from "../../lib/utils";

const BAR_HEIGHTS = ["50%", "75%", "100%", "75%", "50%"] as const;

const STAGGER_MS = 100;

const SIZE = {
  sm: "h-3 w-6",
  default: "h-4 w-8",
  lg: "h-8 w-16",
} as const;

function WaveLoader({
  size = "default",
  className,
  "aria-label": label,
  ...props
}: React.ComponentProps<"span"> & {
  size?: keyof typeof SIZE;
}): React.JSX.Element {
  return (
    <span
      data-slot="wave-loader"
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-foreground",
        SIZE[size],
        className,
      )}
      {...props}
    >
      {BAR_HEIGHTS.map((height, index) => (
        <span
          key={index}
          className="animate-wave-bar inline-block rounded-full bg-current motion-reduce:animate-none"

          style={{
            width: "12.5%",
            height,
            marginInline: "1.25%",
            animationDelay: `${index * STAGGER_MS}ms`,
          }}
        />
      ))}
    </span>
  );
}

export { WaveLoader };
