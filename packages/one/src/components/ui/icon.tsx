import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconComponent } from "../icons/house-icon";

/* The Sirdab icon. A thin wrapper over a house glyph (@sirdab/one/icons) that
   owns exactly one decision:
   whether the glyph MIRRORS in RTL. That is semantic, not automatic:
   direction-of-reading icons flip, everything else must not.

   FLIP (reading direction): back/forward arrows, external-link arrows,
   send, reply, breadcrumb and "go" chevrons, undo/redo, list indent.
   NEVER FLIP: symmetric glyphs (search, plus, bell, settings, trash),
   checkmarks, vertical chevrons, media playback (play stays ►, a global
   convention), clocks, anything containing text or numbers, logos.

   Renders the svg directly, so parent sizing rules ([&_svg]… in Button and
   Input) keep working. Unsized and outside such a context, pass a size
   class yourself. Decorative by default (aria-hidden); pass aria-label to
   make it meaningful.

   Usage:
       <Icon icon={Search} />                          // never flips
       <Icon icon={ArrowUpRight} flip />               // mirrors in RTL
       <Icon icon={Bell} aria-label="Notifications" /> // meaningful, announced
*/
function Icon({
  icon: IconComponent,
  flip = false,
  className,
  ...props
}: React.ComponentProps<IconComponent> & {
  icon: IconComponent;
  flip?: boolean;
}) {
  return (
    <IconComponent
      data-slot="icon"
      // An aria-label(ledby) on <svg> is skipped by VoiceOver & co.
      // without an explicit img role, and must never coexist with
      // aria-hidden.
      role={props["aria-label"] || props["aria-labelledby"] ? "img" : undefined}
      aria-hidden={
        props["aria-label"] || props["aria-labelledby"] ? undefined : true
      }
      className={cn(flip && "rtl:-scale-x-100", className)}
      {...props}
    />
  );
}

export { Icon };
