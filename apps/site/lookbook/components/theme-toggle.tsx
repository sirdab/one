"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import { MonitorIcon } from "@sirdab/one/icons/system";
import { ThemeMoon } from "@sirdab/one/icons/theme-moon";
import { ThemeSun } from "@sirdab/one/icons/theme-sun";
import { Icon } from "@sirdab/one/components/icon";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";

const emptySubscribe = (): (() => void) => () => {};

/* The theme mode picker: a MODE, one always active, so it is the
   Segmented control (animated icon variant: the thumb slides, the
   checked label expands). Wired to `theme`, not `resolvedTheme`:
   "system" is a real choice the user can hold. */
export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  // The server doesn't know the theme; hold the track's footprint until
  // hydration so the thumb never flashes on the wrong option.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div aria-hidden className="bg-muted h-10 w-32 rounded-xl" />;
  }

  return (
    <Segmented value={theme} onValueChange={setTheme} aria-label="Theme">
      <SegmentedItem
        value="light"
        icon={<Icon icon={ThemeSun} />}
        label="Light"
      />
      <SegmentedItem
        value="dark"
        icon={<Icon icon={ThemeMoon} />}
        label="Dark"
      />
      <SegmentedItem
        value="system"
        icon={<Icon icon={MonitorIcon} />}
        label="System"
      />
    </Segmented>
  );
}
