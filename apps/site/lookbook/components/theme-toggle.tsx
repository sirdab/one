"use client";

import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

import { MonitorIcon } from "@sirdab/one/icons/system";
import { ThemeMoon } from "@sirdab/one/icons/theme-moon";
import { ThemeSun } from "@sirdab/one/icons/theme-sun";
import { Icon } from "@sirdab/one/components/icon";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";

const emptySubscribe = (): (() => void) => () => {};

type ThemeMode = "light" | "dark" | "system";
const modes: readonly ThemeMode[] = ["light", "dark", "system"];

function ThemeModes({
  value,
  onValueChange,
}: {
  value: string | undefined;
  onValueChange?: (value: string) => void;
}): React.JSX.Element {
  return (
    <Segmented value={value} onValueChange={onValueChange} aria-label="Theme">
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

export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const active = useRef<ViewTransition | null>(null);
  function change(next: string): void {
    if (next === theme) return;
    const root: HTMLElement = document.documentElement;
    const dark: boolean =
      next === "dark" ||
      (next === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      dark === root.classList.contains("dark")
    ) {
      setTheme(next);
      return;
    }
    active.current?.skipTransition();
    root.setAttribute("data-theme-sweep", "");
    const transition: ViewTransition = document.startViewTransition(
      (): void => {
        flushSync((): void => setTheme(next));
      },
    );
    active.current = transition;
    const cleanup = (): void => {
      if (active.current === transition) {
        root.removeAttribute("data-theme-sweep");
        active.current = null;
      }
    };
    void transition.ready.catch((): void => {});
    void transition.finished.then(cleanup, cleanup);
  }
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="theme-initial" aria-hidden inert>
        {modes.map((mode: ThemeMode): React.JSX.Element => (
          <div key={mode} data-theme-initial={mode}>
            <ThemeModes value={mode} />
          </div>
        ))}
      </div>
    );
  }

  return <ThemeModes value={theme} onValueChange={change} />;
}
