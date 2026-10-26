"use client";

import * as React from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { cn } from "../../lib/utils";
import { ArrowDownIcon } from "../icons/general";
import { Button } from "./button";
import { Icon } from "./icon";

/* The Sirdab conversation: the scrolling log a chat lives in. Taken from the
   shadcn.io AI Elements conversation (use-stick-to-bottom underneath) and
   trued: no empty state (a transcript with no turns is the studio's
   EmptyState, not this), the scroll button is a house overlay Button on the
   popover frost with a caller-worded label and hint, and its placement uses
   standard fractions instead of arbitrary values.

   Sticking is the whole point: while the reader is at the bottom, new
   tokens pull the view down with them; the moment they scroll up to reread,
   it lets go and the button appears. Never replace it with a scrollTop
   effect: that yanks a reader back down mid-sentence on every delta.

   Usage:
       <Conversation className="min-h-0 flex-1">
           <ConversationContent>{turns}</ConversationContent>
           <ConversationScrollButton label={t("jumpToLatest")} />
       </Conversation>
*/
type ConversationProps = Omit<
  React.ComponentProps<typeof StickToBottom>,
  "children"
> & { children?: React.ReactNode };

/* A disclosure the reader opens by hand (a thought, a step's detail) must
   open downward where it is. At the bottom of the log, sticking would
   instead slide the whole view to keep the bottom pinned, so the thing
   they clicked seems to fold up. Calling the hold lets go of the bottom
   for that toggle; scrolling back down picks it up again. Outside a
   conversation it does nothing. */
const ConversationHold = React.createContext<() => void>(() => undefined);

function useConversationHold(): () => void {
  return React.useContext(ConversationHold);
}

function HoldFromScroller({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { stopScroll } = useStickToBottomContext();
  return (
    <ConversationHold.Provider value={stopScroll}>
      {children}
    </ConversationHold.Provider>
  );
}

function Conversation({
  className,
  children,
  ...props
}: ConversationProps): React.JSX.Element {
  return (
    <StickToBottom
      data-slot="conversation"
      className={cn("relative flex-1 overflow-y-hidden", className)}
      initial="smooth"
      resize="smooth"
      role="log"
      {...props}
    >
      <HoldFromScroller>{children}</HoldFromScroller>
    </StickToBottom>
  );
}

type ConversationContentProps = React.ComponentProps<
  typeof StickToBottom.Content
>;

function ConversationContent({
  className,
  scrollClassName,
  ...props
}: ConversationContentProps): React.JSX.Element {
  return (
    <StickToBottom.Content
      data-slot="conversation-content"
      /* overflow-y-auto from the first byte: the hairline gutter is
               stable on both edges and only exists on an element that
               scrolls, and the library sets the overflow from script, so
               without the class a server render draws the column 4px wider
               on each side until hydration. */
      scrollClassName={cn(
        "scrollbar-hairline overflow-y-auto",
        scrollClassName,
      )}
      className={cn("flex flex-col gap-6 px-4 py-6", className)}
      {...props}
    />
  );
}

interface ConversationScrollButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children" | "aria-label" | "hint" | "variant" | "size"
> {
  label: string;
}

function ConversationScrollButton({
  label,
  className,
  ...props
}: ConversationScrollButtonProps): React.JSX.Element | null {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <Button
      data-slot="conversation-scroll-button"
      type="button"
      variant="overlay"
      size="icon"
      aria-label={label}
      hint={label}
      /* It floats over the reply, so it takes the popover frost
               (COLORS.md: a floating layer is the frosted popover) and the
               popover hairline lifts it. The overlay variant, because its
               hover and press lay a wash OVER the frosted paper instead of
               swapping the paper for a translucent fill: under the pointer
               the reply behind never shows through. */
      className={cn(
        "z-raised bg-popover-surface shadow-popover-sm backdrop-blur-popover absolute bottom-4 left-1/2 -translate-x-1/2",
        className,
      )}
      onClick={() => {
        void scrollToBottom();
      }}
      {...props}
    >
      <Icon icon={ArrowDownIcon} />
    </Button>
  );
}

export {
  Conversation,
  ConversationContent,
  ConversationHold,
  ConversationScrollButton,
  useConversationHold,
};
export type {
  ConversationContentProps,
  ConversationProps,
  ConversationScrollButtonProps,
};
