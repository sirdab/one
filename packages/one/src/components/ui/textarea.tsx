import * as React from "react";

import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";
import {
  FIELD_BORDER,
  FIELD_FOCUS_VISIBLE,
  FIELD_RADIUS,
  FIELD_VALUE,
} from "./field-chrome";

function Textarea({
  className,
  bare = false,
  disabledReason,
  dir,
  ...props
}: React.ComponentProps<"textarea"> & {
  bare?: boolean;

  disabledReason?: React.ReactNode;
}) {
  const field = (
    <textarea
      data-slot="textarea"
      data-bare={bare || undefined}
      className={cn(
        "placeholder:text-subtle disabled:placeholder:text-subtle/50 w-full resize-none bg-transparent outline-hidden transition-colors duration-100 disabled:cursor-not-allowed disabled:text-foreground/50",
        bare
          ? FIELD_VALUE
          : cn(
              "field-sizing-content min-h-16 px-3 py-2",
              FIELD_RADIUS.default,
              FIELD_BORDER,
              FIELD_VALUE,
              FIELD_FOCUS_VISIBLE,
            ),
        className,
      )}

      dir={dir === "auto" && props.value === "" ? undefined : dir}
      {...props}
      {...refusalProps(disabledReason, "field")}
    />
  );

  return withDisabledReason(field, disabledReason, "block w-full");
}

export { Textarea };
