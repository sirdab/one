"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";
import { Button } from "./button";
import { Icon } from "./icon";

function Artifact({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="artifact"
      className={cn(
        "border-border bg-card flex min-w-0 flex-col overflow-hidden rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function ArtifactHeader({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="artifact-header"
      className={cn(
        "border-border flex items-center justify-between gap-2 border-b px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}

function ArtifactTitle({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="artifact-title"
      className={cn("text-label text-foreground", className)}
      {...props}
    />
  );
}

function ArtifactDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="artifact-description"
      className={cn("text-caption-quiet text-muted-foreground", className)}
      {...props}
    />
  );
}

function ArtifactActions({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="artifact-actions"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

interface ArtifactActionProps extends Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size" | "children" | "aria-label" | "hint"
> {
  label: string;
  icon: IconComponent;
}

function ArtifactAction({
  label,
  icon,
  ...props
}: ArtifactActionProps): React.JSX.Element {
  return (
    <Button
      data-slot="artifact-action"
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      hint={label}
      {...props}
    >
      <Icon icon={icon} />
    </Button>
  );
}

function ArtifactContent({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="artifact-content"
      className={cn("min-w-0 overflow-auto p-3", className)}
      {...props}
    />
  );
}

export {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
};
export type { ArtifactActionProps };
