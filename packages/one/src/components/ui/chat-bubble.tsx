import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";

const chatBubbleVariants = cva(
  "text-body min-w-0 max-w-full rounded-md p-3 whitespace-pre-wrap wrap-anywhere",
  {
    variants: {
      role: {
        merchant: "self-end bg-muted text-foreground [[dir=rtl]_&]:self-start",
        assistant: "self-start [[dir=rtl]_&]:self-end",
      },
      surface: {
        background: "",
        sunken: "",
      },
    },
    compoundVariants: [
      {
        role: "assistant",
        surface: "background",
        class: "bg-surface-whisper",
      },
      { role: "assistant", surface: "sunken", class: "bg-background" },
    ],
    defaultVariants: { role: "assistant", surface: "background" },
  },
);

function ChatBubble({
  role,
  surface,
  asChild = false,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "role"> &
  VariantProps<typeof chatBubbleVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="chat-bubble"
      data-role={role ?? "assistant"}

      dir="auto"
      className={cn(chatBubbleVariants({ role, surface }), className)}
      {...props}
    />
  );
}

export { ChatBubble, chatBubbleVariants };
