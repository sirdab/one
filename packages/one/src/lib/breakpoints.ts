/* The md breakpoint as a media query. The CSS switches on it (Tailwind's md is
   48rem), the dialog launcher goes full screen on it, the studio's preview
   chrome follows it, and a Select picks its tray over its popover by it: one
   string, so a mismatch is a typo and not a race between two readings of
   "phone". */
export const BELOW_MD = "(width < 48rem)";
