import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";
import type { StatusTone } from "./badge";
import { Card } from "./card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "./item";

const GLYPH_CLASS: Record<StatusTone, string> = {
  neutral: "text-neutral-glyph",
  attention: "text-attention-glyph",
  warning: "text-warning-glyph",
  critical: "text-destructive-glyph",
  success: "text-success-glyph",
};

function Timeline({
  className,
  ...props
}: React.ComponentProps<"ol">): React.JSX.Element {
  return (
    <ol
      data-slot="timeline"
      role="list"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  );
}

export type TimelineDayProps = Omit<
  React.ComponentProps<"li">,
  "children" | "title"
> & {
  heading: React.ReactNode;
  children?: React.ReactNode;
};

function TimelineDay({
  heading,
  children,
  className,
  ...props
}: TimelineDayProps): React.JSX.Element {
  return (
    <li
      data-slot="timeline-day"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <h3
        data-slot="timeline-day-heading"
        className="text-body-quiet text-muted-foreground font-medium"
      >
        {heading}
      </h3>
      <Card>
        <ItemGroup className="divide-border divide-y">{children}</ItemGroup>
      </Card>
    </li>
  );
}

export type TimelineItemProps = Omit<
  React.ComponentProps<"div">,
  "title" | "children"
> & {
  icon?: IconComponent;
  tone?: StatusTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  time: React.ReactNode;
  children?: React.ReactNode;
  detail?: React.ReactNode;
  asChild?: boolean;
};

function TimelineItem({
  icon: GlyphComponent,
  tone = "neutral",
  title,
  description,
  time,
  children,
  detail,
  asChild = false,
  className,
  ...props
}: TimelineItemProps): React.JSX.Element {
  const well: React.ReactNode = asChild ? detail : (detail ?? children);
  const layout: React.ReactNode = (
    <>
      <ItemMedia
        variant="icon"
        aria-hidden="true"
        className={cn("shrink-0", GLYPH_CLASS[tone])}
      >
        {GlyphComponent ? <GlyphComponent aria-hidden="true" /> : null}
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="w-auto max-w-full">{title}</ItemTitle>
        {description ? <ItemDescription>{description}</ItemDescription> : null}
        {well ? (
          <div
            data-slot="timeline-item-detail"
            className="bg-surface-whisper text-body mt-1 rounded-xl px-4 py-3"
          >
            {well}
          </div>
        ) : null}
      </ItemContent>
      <ItemActions className="self-start">
        <time
          dir="ltr"
          className="tabular text-body-quiet text-muted-foreground"
        >
          {time}
        </time>
      </ItemActions>
    </>
  );

  if (
    asChild &&
    React.isValidElement<{ children?: React.ReactNode }>(children)
  ) {
    return (
      <Item asChild className={cn("min-h-11", className)} {...props}>
        {React.cloneElement(children, undefined, layout)}
      </Item>
    );
  }
  return (
    <Item className={className} {...props}>
      {layout}
    </Item>
  );
}

export { Timeline, TimelineDay, TimelineItem };
