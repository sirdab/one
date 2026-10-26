import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab chat bubble. One turn in a transcript, promoted from the shell's
   chat surfaces (Builder rail, dashboard Assistant) so every conversation
   paints its turns the same way. Not a shadcn take because there is nothing
   to take: core shadcn ships no chat primitive (chat lives in community
   blocks, whole opinionated compositions), and a bubble is pure paint with
   no structure or behavior to borrow.

   Roles (pick by who is speaking, never restyle at the call site):
     merchant     the person's turn: the quiet --muted fill, on the right
                  in every language (below), never the ink primary, because
                  a transcript reports, it does not command.
     assistant    the product's turn: on the left, painted per the backing
                  surface (below).

   Sides are physical on purpose, the one place in the system they are.
   Merchants read their own words on the right in both Arabic and English,
   as in the chat apps they know; `end` alone put them on the LEFT in the
   Arabic studio. `rtl:` cannot say "in an Arabic page" here: it also matches
   the bubble's OWN direction (the dir="auto" below), so an Arabic sentence
   typed in the English studio would cross sides. The ancestor-only variant
   asks the page, never the bubble.

   Surface (what the transcript sits ON, which decides the assistant fill):
     background   a white rail: assistant bubbles take --surface-whisper,
                  the tonal card for recessed content on the page tone.
     sunken       the shell's --surface-sunken backdrop (the assistant
                  dock): bubbles return to the page tone (bg-background),
                  the COLORS.md whisper sandwich inverted one level.

   COLORS.md exception, deliberate: merchant bubbles sit on --muted, an
   alpha WASH, where doctrine says washes are never surfaces. Blessed
   because no solid step exists at that lightness, and bubbles never stack
   over tints, so the wash cannot compound into a false tone.

   `className` stays layout-only (max-width, margins, flex placement);
   `asChild` renders the bubble as the caller's element (an <li> in a
   semantic transcript list). The HTML `role` attribute is deliberately
   absent from the props: the prop named `role` is the SPEAKER. */
/* min-w-0 and max-w-full keep a bubble inside its column at any rail width,
   and wrap-anywhere breaks a long unbroken run (a link, a pasted id) that
   would otherwise push it past the rail. */
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
      /* Each bubble reads its own direction off its first strong
               character, rather than inheriting the page's. A conversation is
               the one surface where the two scripts genuinely mix: the agent
               answers in English inside an Arabic studio, and a merchant types
               a brand name in Latin, and an English sentence laid out RTL puts
               its full stop at the FRONT of the line ("It'll show in the
               .header once the change lands"). Before {...props} so a caller
               that knows better can still say so. */
      dir="auto"
      className={cn(chatBubbleVariants({ role, surface }), className)}
      {...props}
    />
  );
}

export { ChatBubble, chatBubbleVariants };
