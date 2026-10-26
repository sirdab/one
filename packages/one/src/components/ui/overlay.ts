/* The shared vocabulary of every floating list: one recipe, several
   consumers (Select's panel, Command, the future DropdownMenu and
   FilterTrigger). Components add only their BEHAVIOUR-specific bits on
   top: highlight variant (focus: for Radix Select, aria-selected: for
   cmdk), positioning offsets, state machines.

   PANEL (the frosted popover): popover surface at 90% over
   the 8px backdrop blur, NO border (shadow-popover-sm paints its own
   hairline), 10px radius.

   ITEM (the picker row): 14/20/400 label at full
   ink, px-2 py-1.5, rounded-lg (10-in-10 with the panel, no nesting
   math), 16px leading icons via the composing component's text span.
   On a touch screen every row is at least 44px (pointer-coarse:min-h-11):
   the 36px desktop row is a mouse's, and a thumb scrolling a short list
   needs the house floor. */

/* The frost lives on a non-scrolling ::before layer: backdrop-filter on
   the scroller itself forces Chromium to re-composite the blur every
   scrolled frame (visible jank in long lists). The pseudo's backdrop is
   the static page behind the panel, so it caches; rows composite above. */
export const overlayPanelChrome =
  "text-popover-foreground shadow-popover-sm relative isolate rounded-lg before:absolute before:inset-0 before:z-behind before:rounded-lg before:bg-popover-surface before:backdrop-blur-popover";

export const overlayItemChrome =
  "text-body-quiet relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 outline-hidden select-none pointer-coarse:min-h-11 [&_svg]:shrink-0";

/* Every floating surface but the tooltip comes and goes the same way, after
   ElevenLabs: a fade and a scale from 0.95 about its own centre, on the
   same curve (--ease-overlay, CSS `ease`) both ways, no slide. Only the
   length differs. Only opacity and transform move: a frost's blur stays
   static. */
const overlayFade =
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";
const overlayZoom = `${overlayFade} data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`;

/* Popover, menus, select: 150ms in and out. A filter's panel takes
   duration-100 over it (filter-trigger, filter-chip): it is opened and
   dismissed over and over while narrowing a list. */
export const overlayPanelMotion = `duration-150 ease-overlay ${overlayZoom}`;

/* Dialog and palette: scrim and panel run 200ms both ways so they land
   and leave together. The scrim only fades, on --ease-standard. */
export const overlayScrimMotion = `duration-200 ease-standard ${overlayFade}`;
export const overlayDialogMotion = `duration-200 ease-overlay ${overlayZoom}`;
