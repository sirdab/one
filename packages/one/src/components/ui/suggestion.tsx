"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

function Suggestions({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="suggestions"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  );
}

interface SuggestionProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children" | "variant" | "size" | "value"
> {
  suggestion: string;
  onPick(suggestion: string): void;

  children?: React.ReactNode;
}

function Suggestion({
  suggestion,
  onPick,
  children,
  ...props
}: SuggestionProps): React.JSX.Element {
  return (
    <Button
      data-slot="suggestion"
      type="button"
      variant="chip"
      size="sm"
      onClick={() => onPick(suggestion)}
      {...props}
    >
      {children ?? suggestion}
    </Button>
  );
}

export { Suggestion, Suggestions };
export type { SuggestionProps };
