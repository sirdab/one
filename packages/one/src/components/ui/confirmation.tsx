"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

type ConfirmationState = "pending" | "approved" | "denied" | "expired";

interface ConfirmationProps extends Omit<
  React.ComponentProps<"div">,
  "title" | "children"
> {
  state: ConfirmationState;

  title: React.ReactNode;
  description?: React.ReactNode;
  approveLabel: string;
  denyLabel: string;

  resolvedLabel?: React.ReactNode;
  onApprove(): void;
  onDeny(): void;

  deciding?: "approve" | "deny" | null;

  disabledReason?: React.ReactNode;
}

function Confirmation({
  state,
  title,
  description,
  approveLabel,
  denyLabel,
  resolvedLabel,
  onApprove,
  onDeny,
  deciding = null,
  disabledReason,
  className,
  ...props
}: ConfirmationProps): React.JSX.Element {
  const holding = deciding != null;
  return (
    <div
      data-slot="confirmation"
      data-confirmation-state={state}
      className={cn(
        "border-border bg-card flex flex-col gap-3 rounded-xl border p-3",

        state === "pending" && "aurora-ring border-transparent",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-body text-foreground">{title}</p>
        {description ? (
          <p className="text-caption-quiet text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {state === "pending" ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            loading={deciding === "deny"}
            disabled={holding}
            disabledReason={holding ? undefined : disabledReason}
            onClick={onDeny}
          >
            {denyLabel}
          </Button>
          <Button
            type="button"
            loading={deciding === "approve"}
            disabled={holding}
            disabledReason={holding ? undefined : disabledReason}
            onClick={onApprove}
          >
            {approveLabel}
          </Button>
        </div>
      ) : resolvedLabel ? (
        <p className="text-caption text-muted-foreground">{resolvedLabel}</p>
      ) : null}
    </div>
  );
}

export { Confirmation };
export type { ConfirmationProps, ConfirmationState };
