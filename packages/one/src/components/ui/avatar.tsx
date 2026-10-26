"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab avatar: a person's picture in a circle, and when there is none
   (or it has not arrived) their initial in the same circle. Added from
   shadcn and trued: the badge and the group are not part of the house look,
   the ink circle and the hairline are.

   The fallback is the INK circle, the same one the account button wore before
   there were pictures, carrying ONE grapheme (the caller cuts it; this
   primitive never decides what an initial is). One hairline ring sits over
   the whole circle, picture included, and nothing here casts a shadow: a face
   in a ring is a mark, not a card.

   `delayMs` is on the fallback, and it is the caller's to pass only when a
   picture exists. Radix shows a fallback until the image has loaded; with a
   picture already cached that flashes the initial for a frame on every
   reload. A short delay lets a cached image win, while an account with no
   picture passes none and shows its initial at once.

       <Avatar size="xl">
           <AvatarImage src={url} alt="" />
           <AvatarFallback delayMs={url ? 600 : undefined}>S</AvatarFallback>
       </Avatar>

   Sizes are 24, 32 (the topbar and the menu), 40 and 56 (the settings row).
   The picture is decorative beside the name it always sits next to, so its
   alt is empty. */
const SIZE_CLASS = {
  sm: "size-6 text-caption",
  default: "size-8 text-label",
  lg: "size-10 text-body",
  xl: "size-14 text-heading-sm",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASS;

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize;
}): React.JSX.Element {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full select-none",
        // The ring is painted over the picture, not under it.
        "after:ring-border after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:ring-1 after:ring-inset",
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>): React.JSX.Element {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>): React.JSX.Element {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-primary text-primary-foreground flex size-full items-center justify-center rounded-full font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
