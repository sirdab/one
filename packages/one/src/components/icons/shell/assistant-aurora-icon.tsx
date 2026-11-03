"use client";

import { forwardRef, useId } from "react";
import { type IconProps } from "../house-icon";

export const AssistantAuroraIcon = /* @__PURE__ */ forwardRef<
  SVGSVGElement,
  IconProps & {
    texture?: string | null;
  }
>(({ size = 24, texture = null, ...props }, ref) => {
  const id = useId();
  const ramp = `${id}-ramp`;
  const fill = `${id}-fill`;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient
          id={ramp}
          x1="3"
          y1="3"
          x2="21"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.1" style={{ stopColor: "var(--aurora-mark-warm)" }} />
          <stop offset="0.4" style={{ stopColor: "var(--aurora-mark-cool)" }} />
          <stop offset="0.7" style={{ stopColor: "var(--aurora-mark-fold)" }} />
        </linearGradient>
        {texture ? (
          <pattern
            id={fill}
            patternUnits="userSpaceOnUse"
            width="24"
            height="24"
          >
            <image
              href={texture}
              width="24"
              height="24"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        ) : null}
      </defs>
      <path
        d="M5.9772 2.76754C3.98919 2.08778 2.08777 3.98917 2.76754 5.97719L7.68519 20.3592C8.43653 22.5565 11.5045 22.663 12.4064 20.523L14.7382 14.9899C14.786 14.8764 14.8764 14.786 14.9899 14.7382L20.523 12.4064C22.663 11.5045 22.5565 8.43653 20.3592 7.68519L5.9772 2.76754Z"
        fill={`url(#${texture ? fill : ramp})`}
      />
    </svg>
  );
});
AssistantAuroraIcon.displayName = "AssistantAuroraIcon";
