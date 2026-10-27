"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteLogo } from "./site-logo";

export function SiteFrame({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const pathname: string = usePathname();
  if (pathname === "/lookbook" || pathname.startsWith("/lookbook/"))
    return <>{children}</>;
  return (
    <>
      <SiteHeader />
      {children}
      <footer className="site-footer" lang="en" dir="ltr">
        <div>
          <Link className="wordmark" href="/" aria-label="Sirdab One home">
            <SiteLogo />
          </Link>
          <p>The design system by Sirdab.</p>
        </div>
        <div className="footer-links">
          <a href="https://ui.shadcn.com/">Built on shadcn/ui</a>
          <a href="https://github.com/sirdab/one">Source on GitHub</a>
          <Link href="/docs">Alpha preview</Link>
        </div>
      </footer>
    </>
  );
}
