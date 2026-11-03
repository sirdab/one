import * as React from "react";

import { cn } from "../../lib/utils";

function DetailList({
  className,
  ...props
}: React.ComponentProps<"dl">): React.JSX.Element {
  return (
    <dl
      data-slot="detail-list"
      className={cn("flex min-w-0 flex-col gap-2.5", className)}
      {...props}
    />
  );
}

function DetailItem({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      data-slot="detail-item"
      className={cn("grid min-w-0 grid-cols-3 gap-3", className)}
    >
      <dt className="text-body-quiet text-muted-foreground">{label}</dt>
      <dd className="col-span-2 min-w-0 text-body break-words">{children}</dd>
    </div>
  );
}

function FactStrip({
  className,
  ...props
}: React.ComponentProps<"dl">): React.JSX.Element {
  return (
    <dl
      data-slot="fact-strip"
      className={cn(
        "grid min-w-0 grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-6",
        className,
      )}
      {...props}
    />
  );
}

function FactStripItem({
  label,
  children,
  wide = false,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      data-slot="fact-strip-item"
      className={cn(
        "flex min-w-0 flex-col gap-1 bg-background px-4 py-3",
        wide && "col-span-2",
        className,
      )}
    >
      <dt className="text-caption-quiet text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-body break-words">{children}</dd>
    </div>
  );
}

export { DetailItem, DetailList, FactStrip, FactStripItem };
