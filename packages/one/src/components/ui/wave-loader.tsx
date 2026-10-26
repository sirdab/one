import * as React from "react";

import { cn } from "../../lib/utils";

/* The Sirdab wave loader: five rounded bars, tallest in the middle, each
   squashing to 60% of its height and back a beat after the one before. For
   the spaces that want more presence than the Spinner: a panel's own
   loading state (the Alerts panel), a waiting surface with room around it.
   Inline beside text, in a button, in an input: that stays the Spinner.

   After loading-ui's Wave (MIT, loading-ui.com), rebuilt here rather than
   installed: the motion is the foundation's `animate-wave-bar` (the loop
   speed, `--duration-spin`, on `--ease-in-out`), the bars are INK like the
   Spinner (TOKENS.md: activity, not decoration), and motion-reduce stills
   them in their wave shape.

   Sizes keep the original's 2:1 box: `sm` 12x24 beside a caption, the
   default 16x32, `lg` 32x64 for a whole page waiting. Decorative by default
   (aria-hidden); the surrounding region names the activity. Pass
   aria-label only when it stands alone, and it reads as one image. */

const BAR_HEIGHTS = ["50%", "75%", "100%", "75%", "50%"] as const;

/** The beat between one bar and the next. */
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
          /* Structural fractions of the box, not design values:
                       the bars and their gaps scale with whichever size
                       the box is. */
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
