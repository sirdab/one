"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/*
 * shadcn's collapsible, unstyled, wrapping the Radix primitive the same way
 * `packages/ui`'s popover wraps its own.
 *
 * It belongs in `@sirdab/one` beside every other primitive, and that is where it
 * should end up. It sits here because the package is another lane's to touch
 * this round and the address section cannot ship its disclosure without it.
 * Nothing about it is app-specific: moving the file and repointing the two
 * imports is the whole migration.
 */
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>): React.JSX.Element {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>): React.JSX.Element {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

/* Grows and fades open in 180ms and shut in 150, both on --ease-drawer
   (after ElevenLabs; the keyframes are disclose-open/close in the
   foundation): quick off the mark with a long soft landing. Every
   disclosure gets it here rather than restating it at the call site. */
function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
>): React.JSX.Element {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        "data-[state=closed]:animate-disclose-close data-[state=open]:animate-disclose-open overflow-hidden motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
