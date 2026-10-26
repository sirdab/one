/* When a Radix overlay closes it hands focus back to its trigger, and the
   trigger comes back wearing the global focus ring even when the user simply
   clicked somewhere else. That looks like the button lighting up as you
   dismiss it.

   The cause is not the timing of the refocus (the first version of this file
   assumed that, and it was wrong: refocusing synchronously inside the dismiss
   event still rings). It is the chain. While the menu is open, focus lives on
   the CONTENT, which is focus-visible; per the :focus-visible rules, focus
   moved programmatically from a focus-visible element stays focus-visible. So
   the ring is inherited from the panel, whatever we do about ordering.

   What actually decides whether a ring belongs is how the user is driving:

   - keyboard (Escape, Enter on an item): the ring MUST show. It is the only
     signal of where focus went, and taking it away strands keyboard users.
   - pointer: no ring. They can see where they clicked.

   So we track the real input modality and only take over from Radix in the
   pointer case, where we let focus fall away rather than dragging the ring
   back onto the trigger. That matches what Popover already does on click-away
   (verified in Chromium: focus lands on body, no ring, and nobody has ever
   filed it), so the shell stays internally consistent.

   Verified in Chromium via the shell's own avatar menu, not assumed. */

let lastModality: "pointer" | "keyboard" = "pointer";
let listening = false;

function watchModality(): void {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener(
    "pointerdown",
    () => {
      lastModality = "pointer";
    },
    true,
  );
  document.addEventListener(
    "keydown",
    () => {
      lastModality = "keyboard";
    },
    true,
  );
}

/** Pass to an overlay's `onCloseAutoFocus`. Keyboard dismissals keep Radix's
    own focus restore, ring and all; pointer dismissals do not pull the ring
    back onto the trigger. */
export function restoreTriggerFocus(event: Event): void {
  watchModality();
  if (event.defaultPrevented) return;
  if (lastModality === "keyboard") return;
  event.preventDefault();
}

/** Call once where an overlay mounts, so the very first dismissal is already
    classified rather than falling back to the default. */
export function trackFocusModality(): void {
  watchModality();
}
