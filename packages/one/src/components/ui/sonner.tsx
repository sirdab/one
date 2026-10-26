"use client";

/* shadcn's sonner wrapper (missing component → shadcn, per the house
   rule) with the chrome forced onto our tokens. Sonner injects its own
   stylesheet at runtime, AFTER ours, so plain utilities lose the
   cascade; the classNames below carry the important suffix so the system
   always wins.

   A toast is always dark, whatever the page: a translucent ink wash (the
   gray-alpha ramp's 800 rung, an owner ruling over COLORS.md's "no wash
   as a surface") with a blur behind it, and solid white type, since alpha
   never touches Arabic glyphs. Sonner's own theme is pinned to dark to
   match, for the parts it draws itself (close button, spinner); the
   action button inverts to a white pill.

   Toasts stack at the bottom END corner: bottom-right in English, bottom-left
   in Arabic. Sonner speaks physical corners and reads nothing from the page,
   so the corner is picked off the Radix direction the app already provides.
   A caller's `position` still wins (the console centres its toasts). */
import { Direction } from "radix-ui";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ position, ...props }: ToasterProps): React.JSX.Element {
  const dir = Direction.useDirection();
  return (
    <Sonner
      theme="dark"
      dir={dir}
      position={position ?? (dir === "rtl" ? "bottom-left" : "bottom-right")}
      className="light toaster group"
      style={
        {
          "--normal-bg": "var(--gray-alpha-800)",
          "--normal-text": "var(--primary-foreground)",
          "--normal-border": "transparent",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // duration-200!: sonner's own enter/lift transition runs
          // at 400ms, twice the 200ms tier toasts belong to. The
          // important transition-duration beats its shorthand.
          toast:
            "bg-gray-alpha-800! backdrop-blur-md! text-primary-foreground! border-transparent! shadow-popover-sm! rounded-lg! text-body! duration-200!",
          title: "text-body!",
          description: "text-body-quiet! text-primary-foreground/70!",
          actionButton:
            "bg-primary-foreground! text-primary! text-caption! rounded-md!",
          cancelButton:
            "bg-transparent! text-primary-foreground/70! text-caption! rounded-md!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
