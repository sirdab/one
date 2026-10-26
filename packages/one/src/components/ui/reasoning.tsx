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

/* The Sirdab reasoning disclosure: the model's summarized thinking, folded
   under one quiet line. Taken from the shadcn.io AI Elements reasoning and
   trued: it measures nothing (the caller owns the label, "Thinking" while
   live and "Thought for 8s" after, because the words and the number are
   the studio's), the body is a caller node rather than a hard-wired
   Streamdown, and the chrome is one quiet line (label and chevron, no
   glyph of its own) over a sunken well that sets the thought apart from
   the reply without a border.

   The state machine is the part worth knowing:
     streaming           open, the label shimmers
     streaming ends      stays open one beat (1s), then folds itself once,
                         so the reply below gets the room
     arrives finished    starts folded (a reload never replays a thought)
     opened by hand      the merchant's choice wins from then on; the
                         auto-fold never fires on it

   Usage:
       <Reasoning streaming={live} label={live ? t("thinking") : t("thought", { s })}>
           <Markdown variant="aside" streaming={live}>{summary}</Markdown>
       </Reasoning>
*/
const AUTO_FOLD_MS = 1000;

interface ReasoningProps extends Omit<
  React.ComponentProps<typeof Collapsible>,
  "open" | "defaultOpen" | "onOpenChange" | "children"
> {
  /** True while thinking deltas are still arriving. */
  streaming: boolean;
  /** The trigger's words, owned by the caller. */
  label: string;
  /** False: the disclosure never opens or folds on its own. It starts
   *  folded, live or saved, and only the trigger changes it, so a long
   *  thought never pushes the reply off the page and is always one press
   *  away. */
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
  /* Null until the merchant touches the trigger; after that their
       choice is the state and nothing automatic overrides it. */
  const [choice, setChoice] = React.useState<boolean | null>(null);
  /* Settled means "finished and folded". A thought that mounts finished
       is settled from the first frame; a live one settles one beat after
       it ends. Set from a timer callback, never synchronously in the
       effect body. */
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
