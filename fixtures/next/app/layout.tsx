import type { JSX, ReactNode } from "react";
import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css";
import "../shared/layout.css";

export const metadata = { title: "One isolated Next consumer" };

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
