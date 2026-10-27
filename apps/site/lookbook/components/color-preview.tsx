"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";

export function ColorPreview({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <div className="color-preview">
      <div className="color-preview-toolbar" lang="en" dir="ltr">
        <span className="text-label">Preview the color system</span>
        <Segmented
          dir="ltr"
          animated={false}
          value={theme}
          onValueChange={(value: string): void =>
            setTheme(value === "dark" ? "dark" : "light")
          }
          aria-label="Color preview theme"
        >
          <SegmentedItem value="light" label="Light" />
          <SegmentedItem value="dark" label="Dark" />
        </Segmented>
      </div>
      <div
        data-color-preview={theme}
        className={`color-preview-canvas ${theme}`}
      >
        {children}
      </div>
    </div>
  );
}
