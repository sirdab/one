"use client";

import * as React from "react";

import type { IconComponent, IconProps } from "../icons/house-icon";

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
