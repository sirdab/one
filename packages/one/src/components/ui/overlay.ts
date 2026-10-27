export const overlayPanelChrome =
  "text-popover-foreground shadow-popover-sm relative isolate rounded-lg before:absolute before:inset-0 before:z-behind before:rounded-lg before:bg-popover-surface before:backdrop-blur-popover";

export const overlayItemChrome =
  "text-body-quiet relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 outline-hidden select-none pointer-coarse:min-h-11 [&_svg]:shrink-0";

const overlayFade =
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";
const overlayZoom = `${overlayFade} data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`;

export const overlayPanelMotion = `duration-150 ease-overlay ${overlayZoom}`;

export const overlayScrimMotion = `duration-200 ease-standard ${overlayFade}`;
export const overlayDialogMotion = `duration-200 ease-overlay ${overlayZoom}`;
