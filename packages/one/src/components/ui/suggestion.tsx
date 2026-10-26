"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

/* The Sirdab suggestions: the quick asks under an empty conversation ("Which
   orders are late?"). Taken from the shadcn.io AI Elements suggestion and
   trued: they WRAP instead of scrolling sideways (the rail is 360px wide,
   and a hidden horizontal scroll there is a row of suggestions nobody
   sees; the scroll-area primitive it needed is not ours either), and each
   one is the house chip Button, the quiet one, never an outline pill.

   Usage:
       <Suggestions>
           {ids.map((id) => (
               <Suggestion key={id} suggestion={t(`suggestions.${id}`)} onPick={send} />
           ))}
       </Suggestions>
*/
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
  /** Defaults to the suggestion itself. */
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
