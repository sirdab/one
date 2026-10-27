"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@sirdab/one/components/sonner";
import { OneProvider } from "@sirdab/one/provider";

export function SiteProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const pathname: string = usePathname();
  const lookbook: boolean =
    pathname === "/lookbook" || pathname.startsWith("/lookbook/");
  return (
    <OneProvider defaultTheme="light">
      {children}

      {!lookbook && <Toaster />}
    </OneProvider>
  );
}
