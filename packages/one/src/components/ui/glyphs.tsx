"use client";

import * as React from "react";

import type { IconComponent, IconProps } from "../icons/house-icon";

/* A stroke-only glyph from path data, drawn to the house icon shape (size,
   currentColor stroke, 24px box), for a component's one-off drawings (the
   photo editor's rotate and flips). The house set is in ../icons. */
export function strokeGlyph(
  displayName: string,
  paths: readonly string[],
): IconComponent {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-icon={displayName}
        {...props}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    ),
  );
  Component.displayName = displayName;
  return Component;
}
