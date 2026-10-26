"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export type ThemeDefault = "light" | "dark" | "system";

export function ThemeProvider({
  children,
  nonce,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  /* For apps behind a nonce-based CSP (the console): next-themes injects an
       inline bootstrap script that would otherwise be blocked. */
  nonce?: string;
  /* Light unless the user explicitly picks otherwise (SAI-762): the OS
       preference never decides for the public apps, and "system" stays an
       explicit choice in the switcher. An internal tool may hand the first
       choice to the OS by passing "system". */
  defaultTheme?: ThemeDefault;
}): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  );
}
