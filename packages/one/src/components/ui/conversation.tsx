"use client";

import * as React from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { cn } from "../../lib/utils";
import { ArrowDownIcon } from "../icons/general";
import { Button } from "./button";
import { Icon } from "./icon";

type ConversationProps = Omit<
  React.ComponentProps<typeof StickToBottom>,
  "children"
> & { children?: React.ReactNode };

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
