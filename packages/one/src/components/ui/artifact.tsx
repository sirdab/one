"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";
import { Button } from "./button";
import { Icon } from "./icon";

/* The Sirdab artifact: the card a tool step opens onto, the thing the
   assistant actually produced (a table of orders, the top products chart,
   a list of what it found). Taken from the shadcn.io AI Elements artifact
   and trued to the dashboard-card recipe: bg-card + hairline, no shadow,
   and the header is separated by a hairline, not the stock muted wash
   (a wash is never a surface). Actions are ghost icon Buttons labelled by
   aria-label AND hint, the house rule for icon-only controls.

   Content is layout-only: the caller puts a table, a chart or a list in
   ArtifactContent and owns its padding if it needs to bleed to the edges.

   Usage:
       <Artifact>
           <ArtifactHeader>
               <div>
                   <ArtifactTitle>{t("artifact.topProducts")}</ArtifactTitle>
                   <ArtifactDescription>{t("artifact.last30Days")}</ArtifactDescription>
               </div>
               <ArtifactActions>
                   <ArtifactAction icon={Copy} label={t("copy")} onClick={copy} />
               </ArtifactActions>
           </ArtifactHeader>
           <ArtifactContent>{chart}</ArtifactContent>
       </Artifact>
*/
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
