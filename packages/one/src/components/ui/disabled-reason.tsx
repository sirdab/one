import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const block = (event: React.SyntheticEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

type Refusal = {
  "aria-disabled"?: true;
  readOnly?: true;
  onClick?: (event: React.MouseEvent) => void;
};

export function refusalProps(
  reason: React.ReactNode | undefined,
  kind: "control" | "field" = "control",
): Refusal {
  if (reason == null) return {};
  return kind === "field"
    ? { "aria-disabled": true, readOnly: true }
    : { "aria-disabled": true, onClick: block };
}

export function withDisabledReason(
  control: React.ReactNode,
  reason: React.ReactNode | undefined,
  className = "inline-flex",
): React.ReactNode {
  if (reason == null) return control;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{control}</span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}
