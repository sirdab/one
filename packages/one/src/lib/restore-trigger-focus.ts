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

export function restoreTriggerFocus(event: Event): void {
  watchModality();
  if (event.defaultPrevented) return;
  if (lastModality === "keyboard") return;
  event.preventDefault();
}

export function trackFocusModality(): void {
  watchModality();
}
