"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@sirdab/one/components/icon";
import { GitHubIcon } from "@sirdab/one/icons/github";
import { SiteLogo } from "./site-logo";
import { ThemeToggle } from "../lookbook/components/theme-toggle";

export function SiteHeader({
  leading,
  className = "",
}: {
  leading?: ReactNode;
  className?: string;
}): React.JSX.Element {
  const pathname: string = usePathname();
  return (
    <header className={`site-header ${className}`} lang="en" dir="ltr">
      <Link className="wordmark" href="/" aria-label="Sirdab One home">
        <SiteLogo />
      </Link>
      {leading}
      <nav aria-label="Main navigation" className="site-nav text-label">
        <Link
          href="/docs"
          aria-current={pathname.startsWith("/docs") ? "page" : undefined}
        >
          Docs
        </Link>
        <Link
          href="/lookbook"
          aria-current={pathname.startsWith("/lookbook") ? "page" : undefined}
        >
          Lookbook
        </Link>
        <a
          className="nav-source touch-target"
          href="https://github.com/sirdab/one"
          aria-label="Sirdab One on GitHub"
          title="GitHub"
        >
          <Icon icon={GitHubIcon} />
        </a>
      </nav>
      <div className="header-theme">
        <ThemeToggle />
      </div>
    </header>
  );
}
