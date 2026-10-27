import * as React from "react";

import { cn } from "../../lib/utils";
import { LoaderIcon } from "../icons/general";
import type { IconComponent } from "../icons/house-icon";
import { Icon } from "./icon";

function Spinner({
  size = "default",
  className,
  ...props
}: Omit<React.ComponentProps<IconComponent>, "size"> & {
  size?: "sm" | "default";
}) {
  return (
    <Icon
      icon={LoaderIcon}
      data-slot="spinner"
      className={cn(
        "animate-spin text-foreground motion-reduce:animate-none",
        size === "sm" ? "size-3" : "size-4",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
