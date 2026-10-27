import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";

function Icon({
  icon: IconComponent,
  flip = false,
  className,
  ...props
}: React.ComponentProps<IconComponent> & {
  icon: IconComponent;
  flip?: boolean;
}) {
  return (
    <IconComponent
      data-slot="icon"

      role={props["aria-label"] || props["aria-labelledby"] ? "img" : undefined}
      aria-hidden={
        props["aria-label"] || props["aria-labelledby"] ? undefined : true
      }
      className={cn(flip && "rtl:-scale-x-100", className)}
      {...props}
    />
  );
}

export { Icon };
