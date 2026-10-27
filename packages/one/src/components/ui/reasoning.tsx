"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { ChevronDownIcon } from "../icons/catalogue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { useConversationHold } from "./conversation";
import { Icon } from "./icon";
import { Shimmer } from "./shimmer";

const AUTO_FOLD_MS = 1000;

interface ReasoningProps extends Omit<
  React.ComponentProps<typeof Collapsible>,
  "open" | "defaultOpen" | "onOpenChange" | "children"
> {
  streaming: boolean;

  label: string;

  auto?: boolean;
  children: React.ReactNode;
}

function Reasoning({
  streaming,
  label,
  auto = true,
  children,
  className,
  ...props
}: ReasoningProps): React.JSX.Element {
  const [choice, setChoice] = React.useState<boolean | null>(null);

  const [settled, setSettled] = React.useState(!streaming);

  React.useEffect(() => {
    if (streaming || settled) return;
    const timer = setTimeout(() => setSettled(true), AUTO_FOLD_MS);
    return () => clearTimeout(timer);
  }, [streaming, settled]);

  const open = choice ?? (auto && (streaming || !settled));
  const hold = useConversationHold();
  const toggle = (next: boolean): void => {
    hold();
    setChoice(next);
  };

  return (
    <Collapsible
      data-slot="reasoning"
      data-streaming={streaming || undefined}
      open={open}
      onOpenChange={toggle}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <CollapsibleTrigger
        data-slot="reasoning-trigger"
        className="text-body text-muted-foreground flex w-fit items-center gap-1.5 transition-colors duration-100 hover:text-foreground"
      >
        {streaming ? <Shimmer>{label}</Shimmer> : <span>{label}</span>}
        <Icon
          icon={ChevronDownIcon}
          className={cn(
            "size-4 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        data-slot="reasoning-content"
        className="bg-surface-sunken text-caption text-muted-foreground rounded-lg px-3 py-2.5"
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export { Reasoning };
export type { ReasoningProps };
