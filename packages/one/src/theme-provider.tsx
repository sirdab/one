"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export type ThemeDefault = "light" | "dark" | "system";

export function ThemeProvider({
  children,
  nonce,
  defaultTheme = "light",
}: {
  children: React.ReactNode;

  nonce?: string;

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
