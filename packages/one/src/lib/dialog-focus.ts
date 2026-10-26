/* Where a dialog puts focus when it opens, in order: a field (typing starts
   there), else the primary action (so Enter confirms, the way a press would),
   else the first control that is not the corner X. Radix's own default is
   the first tabbable element, and the X sits first in the DOM (it rides a
   sticky strip above the header), so without this every confirm opened on
   Close and Enter dismissed it. An explicit autoFocus needs nothing here:
   Radix leaves focus alone when it is already inside. The primary is the
   footer's filled button (default or destructive), skipped while it is
   disabled or refusing with a reason. */
const TYPING_TARGET =
  "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [contenteditable=true]";
const PRIMARY_ACTION = [
  '[data-slot="dialog-footer"] [data-slot="button"][data-variant="default"]',
  '[data-slot="dialog-footer"] [data-slot="button"][data-variant="destructive"]',
]
  .map((selector) => `${selector}:not(:disabled):not([aria-disabled="true"])`)
  .join(", ");
const FIRST_CONTROL =
  'button:not([data-slot="dialog-close"]):not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

/** Focuses the dialog's opening target; false when it has none. */
export function focusDialogTarget(content: HTMLElement): boolean {
  const target =
    content.querySelector<HTMLElement>(TYPING_TARGET) ??
    content.querySelector<HTMLElement>(PRIMARY_ACTION) ??
    content.querySelector<HTMLElement>(FIRST_CONTROL);
  if (!target) return false;
  target.focus();
  return true;
}
