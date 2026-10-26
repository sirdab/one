import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  type ReactNode,
} from "react";

/* A caller's strokeWidth reaches every stroked path. The drawings set their
   own weight on each path (an attribute on the svg would lose to it), so an
   override is written onto the paths themselves; fills are left alone. */
function restroke(node: ReactNode, width: number | string): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement<{ children?: ReactNode; stroke?: string }>(child)) {
      return child;
    }
    if (child.type === Fragment) {
      return cloneElement(child, {}, restroke(child.props.children, width));
    }
    return child.props.stroke
      ? cloneElement(
          child as React.ReactElement<{
            strokeWidth?: number | string;
          }>,
          {
            strokeWidth: width,
          },
        )
      : child;
  });
}

/* What every icon in the product takes, and what every icon is: the house
   set, and anything else drawn to the same shape. <Icon> and every
   component with an icon prop is typed by these, not by a library's. */
export type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  size?: string | number;
};
export type IconComponent = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

export const shellIcon = (
  displayName: string,
  children: React.ReactNode,
): IconComponent => {
  const Component = forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        /* Which glyph this is, the way lucide's class names it: a
                   test (or a stylesheet) can ask for the tick by name. */
        data-icon={displayName}
        {...props}
      >
        {strokeWidth === undefined ? children : restroke(children, strokeWidth)}
      </svg>
    ),
  );
  Component.displayName = displayName;
  return Component;
};
