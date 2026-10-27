import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  type ReactNode,
} from "react";

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
