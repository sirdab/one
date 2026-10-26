import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab badge: a status MARKER, never an action. It says one of two
   things, and the API makes you pick, so a status can never be mistaken for
   a tag again.

   A STATUS takes a `tone`: the tone's wash, its text step, a 6px dot at the
   start of the reading direction, and the word. The tone says WHOSE MOVE IT
   IS, one meaning per colour (the scale and its contrast pairs are in
   foundation.css, section 4, and pinned by status-tones.test.ts):

     neutral    nothing for you to do: done, closed, off, or in someone
                else's hands. A finished queue item (fulfilled, paid,
                accepted, cancelled) lands here so the eye goes to what is
                left; the dot takes --subtle so a done chip fades while its
                word stays foreground.
     attention  your move, and nothing is wrong. A draft is here, a pending
                order, a step waiting on your signature.
     warning    something is off and needs you soon. Rare by design.
     critical   failed or refused; it will not fix itself.
     success    live, on the shelf, switched on (a product, a page, the
                store, a connection).

   A TAG takes a `variant` and never a dot: `outline` is a hairline for an
   attribute (Digital, Package, Credit note, a customer's tag), `secondary`
   the quiet fill for a count or a code, `ghost` bare quiet text. No prop
   paints a badge as ink: a chip that shouts like the primary button teaches
   her to read the wrong thing first.

   The word is the accessible name; the dot is `aria-hidden` and CSS, never
   an icon. The studio does not choose tones at call sites: every status
   union maps to a tone in `app/_components/status/status-tones.ts`, and a
   test fails on a status passed as a look. A badge is not interactive: no
   hover, no focus ring, no 44px target.

   `StatusNote` is the same wash as a centred sentence about a record (a
   draft's "only you can see it"): no dot, it wraps, it sits centred in its
   row.

   `LegacyBadge` keeps the old look names (success, warning, destructive,
   default) available to existing consumers. New projects use tones or tag variants.

   Trued after the shadcn add: the caption type role replaces the stock
   x-small utility, the focus ring classes go (the global focus-visible
   outline owns focus), bg-accent hovers go (shadcn-compat token, never
   ours). The bridge carries the density (control-xs height, padding). */

export const STATUS_TONES = [
  "neutral",
  "attention",
  "warning",
  "critical",
  "success",
] as const;

export type StatusTone = (typeof STATUS_TONES)[number];

export type TagVariant = "secondary" | "outline" | "ghost";

/* Wash + text step per tone. The chip and the note share this one map, so a
   tone is retuned in one place. Text and wash come from the same hue's 700
   and 100 steps: the pair clears 4.5:1 in every tone and in a .dark scope. */
const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted text-foreground",
  attention: "bg-attention-subtle text-attention",
  warning: "bg-warning-subtle text-warning",
  critical: "bg-destructive-subtle text-destructive",
  success: "bg-success-subtle text-success",
};

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-caption whitespace-nowrap transition-colors duration-100 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        secondary: "bg-muted text-foreground",
        outline: "border-border text-foreground",
        ghost: "text-muted-foreground",
      },
      tone: TONE_CLASS,
    },
  },
);

type BadgeBaseProps = React.ComponentProps<"span">;

export type BadgeProps =
  | (BadgeBaseProps & { tone: StatusTone; variant?: never; asChild?: false })
  | (BadgeBaseProps & {
      tone?: never;
      variant?: TagVariant;
      asChild?: boolean;
    });

function Badge({
  className,
  tone,
  variant,
  asChild = false,
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "span";

  if (tone !== undefined) {
    return (
      <Comp
        data-slot="badge"
        data-tone={tone}
        className={cn(badgeVariants({ tone }), "gap-1.5", className)}
        {...props}
      >
        <span
          data-slot="badge-dot"
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            tone === "neutral" ? "bg-subtle" : "bg-current",
          )}
        />
        {children}
      </Comp>
    );
  }

  const look: TagVariant = variant ?? "secondary";
  return (
    <Comp
      data-slot="badge"
      data-variant={look}
      className={cn(badgeVariants({ variant: look }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

function StatusNote({
  tone,
  className,
  ...props
}: React.ComponentProps<"p"> & { tone: StatusTone }): React.JSX.Element {
  return (
    <p
      data-slot="status-note"
      data-tone={tone}
      className={cn(
        "text-caption inline-flex min-h-7 w-fit max-w-full items-center justify-center rounded-full px-3 py-1 text-center whitespace-normal",
        TONE_CLASS[tone],
        className,
      )}
      {...props}
    />
  );
}

const LEGACY_TONES = {
  success: "success",
  warning: "warning",
  destructive: "critical",
} as const satisfies Record<string, StatusTone>;

type LegacyVariant = TagVariant | "default" | keyof typeof LEGACY_TONES;

/** @deprecated Pick a `tone` (a status) or a tag variant. */
function LegacyBadge({
  variant = "default",
  className,
  asChild,
  ...props
}: BadgeBaseProps & {
  variant?: LegacyVariant;
  asChild?: boolean;
}): React.JSX.Element {
  if (variant === "default") {
    return (
      <Badge
        variant="secondary"
        asChild={asChild}
        className={cn("bg-primary text-primary-foreground", className)}
        {...props}
      />
    );
  }
  if (
    variant === "success" ||
    variant === "warning" ||
    variant === "destructive"
  ) {
    return (
      <Badge tone={LEGACY_TONES[variant]} className={className} {...props} />
    );
  }
  return (
    <Badge
      variant={variant}
      asChild={asChild}
      className={className}
      {...props}
    />
  );
}

export { Badge, LegacyBadge, StatusNote, badgeVariants };
