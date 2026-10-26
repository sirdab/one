"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

/* The Sirdab confirmation: the card a paused turn shows before a write that
   matters ("Cancel order #1005 and restock it?"). Taken from the shadcn.io
   AI Elements confirmation and trued: the `ai` package's approval object
   and state strings became four states of our own, the Alert became a card
   on the stack recipe (bg-card + hairline, no tint: the words carry the
   weight, not a warning colour), and Approve/Deny are caller-worded.

   Buttons: deny is secondary, approve is THE action (the default primary);
   the card is the one decision in its view. Once decided, the buttons go and
   the resolution line stays: a decided card that still offered buttons
   would invite a second decision on a turn that already moved on. While a
   decision is in flight both hold, the chosen one shows the spinner.

   Usage:
       <Confirmation
           state={approval}
           title={t("approvals.cancel_order", params)}
           approveLabel={t("approve")}
           denyLabel={t("deny")}
           resolvedLabel={approval === "approved" ? t("approved") : t("denied")}
           onApprove={() => decide(id, "approve")}
           onDeny={() => decide(id, "deny")}
       />
*/
type ConfirmationState = "pending" | "approved" | "denied" | "expired";

interface ConfirmationProps extends Omit<
  React.ComponentProps<"div">,
  "title" | "children"
> {
  state: ConfirmationState;
  /** What will happen, in the caller's words. */
  title: React.ReactNode;
  description?: React.ReactNode;
  approveLabel: string;
  denyLabel: string;
  /** Shown instead of the buttons once the decision is made. */
  resolvedLabel?: React.ReactNode;
  onApprove(): void;
  onDeny(): void;
  /** A decision on its way to the api. */
  deciding?: "approve" | "deny" | null;
  /** WHY neither button can be pressed right now. */
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
        /* A card still waiting on her answer wears the aurora ring,
                   the same as a staged change: every "needs your yes" reads
                   as one kind of thing. Decided, it settles to the hairline. */
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
