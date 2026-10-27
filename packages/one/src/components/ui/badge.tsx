import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";

export const STATUS_TONES = [
  "neutral",
  "attention",
  "warning",
  "critical",
  "success",
] as const;

export type StatusTone = (typeof STATUS_TONES)[number];

export type TagVariant = "secondary" | "outline" | "ghost";

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
