export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    return true;
  }

  const editableAttribute = target.getAttribute("contenteditable");
  return (
    target.isContentEditable ??
    (editableAttribute !== null && editableAttribute !== "false")
  );
}
