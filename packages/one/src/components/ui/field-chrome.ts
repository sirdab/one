export type FieldSize = "sm" | "md" | "default" | "search" | "touch";

export const FIELD_HEIGHT: Record<FieldSize, string> = {
  sm: "h-control",
  md: "h-control-lg",
  default: "h-control-xl",
  search: "h-control-xl",
  touch: "h-control-touch",
};

export const FIELD_RADIUS: Record<FieldSize, string> = {
  sm: "rounded-lg",
  md: "rounded-lg",
  default: "rounded-xl",
  search: "rounded-xl",
  touch: "rounded-xl",
};

export const FIELD_BORDER = "border border-input";

export const FIELD_VALUE = "text-body-lg sm:text-body-quiet";

export const FIELD_FOCUS_WITHIN =
  "focus-within:border-ring focus-within:ring-input-focus";

export const FIELD_FOCUS_VISIBLE =
  "focus-visible:border-ring focus-visible:ring-input-focus";

export const FIELD_OPEN =
  "data-[state=open]:border-ring data-[state=open]:ring-input-focus";

export const FIELD_HOVER_BORDER =
  "hover:not-focus-visible:not-data-[state=open]:border-input-border-hover";

export const FIELD_TRIGGER = [
  "relative touch-target inline-flex shrink-0 items-center justify-between gap-2 bg-transparent text-start whitespace-nowrap text-foreground transition-colors duration-100 select-none focus-visible:outline-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  FIELD_BORDER,
  FIELD_VALUE,
  FIELD_HOVER_BORDER,
  FIELD_FOCUS_VISIBLE,
  FIELD_OPEN,
].join(" ");
