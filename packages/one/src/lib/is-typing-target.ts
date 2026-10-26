/** Whether a keyboard event's target is somewhere text entry already owns:
 * a real input, a textarea, or a contenteditable region. Global chords
 * (⌘B for the rail, ⌘K for the palette) must leave it alone rather than
 * firing over someone's typing. Defined once so the two cannot disagree
 * about what a typing context is. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    return true;
  }
  // isContentEditable resolves inheritance in a browser; jsdom leaves it
  // undefined, so the attribute is the fallback there.
  const editableAttribute = target.getAttribute("contenteditable");
  return (
    target.isContentEditable ??
    (editableAttribute !== null && editableAttribute !== "false")
  );
}
