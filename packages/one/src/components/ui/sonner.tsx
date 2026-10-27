"use client";

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
