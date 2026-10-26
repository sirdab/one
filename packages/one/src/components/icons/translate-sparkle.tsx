import * as React from "react";

import type { IconProps } from "./house-icon";

/* A translate mark with a sparkle: the language switcher's glyph.
 *
 * Custom art, and checked against the set first: lucide ships `Languages`, but
 * it is a different drawing (straight strokes, no spark) and the spark is the
 * half that carries the meaning here. Everything else in the product still comes
 * from lucide; this is the exception, not a second icon set.
 *
 * SHAPED LIKE A LUCIDE ICON ON PURPOSE. It takes IconProps, forwards its ref
 * and defaults to a 24 box, so it is assignable to IconComponent and drops into
 * <Icon icon={TranslateSparkle} /> like any other. That matters for more than
 * tidiness: Icon owns the RTL-mirroring decision and the aria-hidden/role
 * pairing, and a raw <svg> at a call site silently opts out of both.
 *
 * CURRENTCOLOR, NOT BLACK. The source art hardcoded stroke="black" and
 * fill="black" on every path. On our buttons the glyph is currentColor and the
 * VARIANT paints it: the trigger reads black today because `outline` sets
 * text-foreground, and a literal black would have gone on being black through
 * a variant change, an ink surface, or the brand tint of a hover.
 *
 * It does NOT mirror in RTL. Icon's rule: never flip anything containing
 * letterforms, and the counter of an A is a letterform.
 *
 * The strokes are 1.5 rather than lucide's 2 because that is how the art is
 * drawn; an explicit strokeWidth still wins, the same as any lucide icon.
 */
const TranslateSparkle = React.forwardRef<SVGSVGElement, IconProps>(
  function TranslateSparkle({ size = 24, strokeWidth = 1.5, ...props }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M2.75 6.81665L11.25 6.81665" />
        <path d="M7 6.75V4.75" />
        <path d="M11 15.25C6.93498 14.1983 4.84489 11.6138 4.25 7" />
        <path d="M3 15C7.06352 13.9798 9.15382 11.4735 9.75 7" />
        <path d="M13.3438 18.1249H18.6562M20.25 20.2499L16.9355 11.4762C16.6098 10.6141 15.3902 10.6141 15.0645 11.4762L11.75 20.2499" />
        {/* The spark is a FILLED shape, so it takes the fill and must
                    opt out of the stroke it would otherwise inherit from the
                    root, or it thickens by a stroke width at every size. */}
        <path
          d="M19.5655 3.86018L18.9756 2.32667C18.8999 2.12986 18.7109 2 18.5 2C18.2891 2 18.1001 2.12986 18.0244 2.32667L17.4345 3.86018C17.333 4.12427 17.1243 4.33297 16.8602 4.43455L15.3267 5.02436C15.1299 5.10005 15 5.28914 15 5.5C15 5.71086 15.1299 5.89995 15.3267 5.97564L16.8602 6.56545C17.1243 6.66703 17.333 6.87573 17.4345 7.13982L18.0244 8.67333C18.1001 8.87014 18.2891 9 18.5 9C18.7109 9 18.8999 8.87014 18.9756 8.67333L19.5655 7.13982C19.667 6.87573 19.8757 6.66703 20.1398 6.56545L21.6733 5.97564C21.8701 5.89995 22 5.71086 22 5.5C22 5.28914 21.8701 5.10005 21.6733 5.02436L20.1398 4.43455C19.8757 4.33297 19.667 4.12427 19.5655 3.86018Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  },
);

export { TranslateSparkle };
