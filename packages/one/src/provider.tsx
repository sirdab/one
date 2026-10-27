"use client";

import type { ReactNode, JSX } from "react";
import { Direction } from "radix-ui";

import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider, type ThemeDefault } from "./theme-provider";

export interface OneProviderProps {
  children: ReactNode;
  dir?: "ltr" | "rtl";
  defaultTheme?: ThemeDefault;
  nonce?: string;
}

export function OneProvider({
  children,
  dir = "ltr",
  defaultTheme = "light",
  nonce,
}: OneProviderProps): JSX.Element {
  return (
    <ThemeProvider defaultTheme={defaultTheme} nonce={nonce}>
      <Direction.Provider dir={dir}>
        <TooltipProvider>{children}</TooltipProvider>
      </Direction.Provider>
    </ThemeProvider>
  );
}
