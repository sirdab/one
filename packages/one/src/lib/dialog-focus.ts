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

export function focusDialogTarget(content: HTMLElement): boolean {
  const target =
    content.querySelector<HTMLElement>(TYPING_TARGET) ??
    content.querySelector<HTMLElement>(PRIMARY_ACTION) ??
    content.querySelector<HTMLElement>(FIRST_CONTROL);
  if (!target) return false;
  target.focus();
  return true;
}
