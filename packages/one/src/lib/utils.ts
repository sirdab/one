import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Stock tailwind-merge doesn't know the foundation's custom utilities, so it
// can't see their conflicts: `cn("text-body", "text-destructive")` dropped the
// role (misread as a color), and `cn("h-control-xl", "h-auto")` kept BOTH
// heights, leaving CSS order to decide. Register each custom utility in the
// group it actually belongs to.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: ["rounded-popover", "rounded-modal", "rounded-palette-item"],
      shadow: [
        "shadow-raised",
        "shadow-overlay",
        "shadow-modal",
        "shadow-popover-sm",
      ],
      "font-size": [
        "text-badge",
        "text-caption",
        "text-caption-quiet",
        "text-label",
        "text-body",
        "text-body-quiet",
        "text-body-lg",
        "text-heading-xs",
        "text-heading-sm",
        "text-heading-md",
        "text-display-sm",
        "text-display-md",
        "text-display-lg",
      ],
      h: [
        "h-control-xs",
        "h-control-sm",
        "h-control",
        "h-control-lg",
        "h-control-xl",
        "h-control-touch",
        "h-row",
        "h-shell-header",
        "h-tab-indicator",
      ],
      w: ["w-shell-rail"],
      z: [
        "z-behind",
        "z-raised",
        "z-raised-more",
        "z-dropdown",
        "z-sticky",
        "z-overlay",
        "z-modal",
        "z-popover",
        "z-toast",
        "z-tooltip",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
