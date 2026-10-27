"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Direction } from "radix-ui";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@sirdab/one/components/sidebar";
import { Toaster } from "@sirdab/one/components/sonner";
import { SiteHeader } from "../../components/site-header";
import { LookbookNav } from "./nav";
import { LocaleSwitcher } from "./locale-switcher";
import { lookbookHref } from "../routing";
import type { LookbookLocale } from "../routing";

export function LookbookShell({
  locale,
  section,
  children,
}: {
  locale: LookbookLocale;
  section?: string;
  children: ReactNode;
}): React.JSX.Element {
  const contentRef = useRef<HTMLElement | null>(null);
  useEffect((): void => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [section, locale]);
  const [open, setOpen] = useState<boolean>(true);
  const direction: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";
  useEffect((): (() => void) => {
    const root: HTMLElement = document.documentElement;
    const previous: [string, string | null][] = [
      ["lang", root.getAttribute("lang")],
      ["dir", root.getAttribute("dir")],
    ];
    root.lang = locale;
    root.dir = direction;
    return (): void => {
      for (const [attribute, value] of previous) {
        if (value === null) root.removeAttribute(attribute);
        else root.setAttribute(attribute, value);
      }
    };
  }, [locale, direction]);
  return (
    <Direction.Provider dir="ltr">
      <SidebarProvider
        open={open}
        onOpenChange={setOpen}
        className="lookbook-layout"
        data-rail-open={open}
        lang="en"
        dir="ltr"
      >
        <SiteHeader
          className="lookbook-site-header"
          leading={
            <SidebarTrigger
              className="cursor-pointer"
              aria-label="Toggle lookbook navigation"
              aria-controls="lookbook-sidebar"
            />
          }
        />
        <Sidebar
          className="lookbook-rail"
          lang="en"
          dir="ltr"
          aria-label="Lookbook navigation"
          id="lookbook-sidebar"
        >
          <LookbookNav locale={locale} current={section} />
        </Sidebar>
        <div className="lookbook-main">
          <main
            ref={contentRef}
            id="main-content"
            className="lookbook-content"
            tabIndex={-1}
          >
            <div className="lookbook-controls">
              <Link
                href={lookbookHref("", locale)}
                className="text-body-quiet text-muted-foreground"
              >
                Lookbook
              </Link>
              <LocaleSwitcher locale={locale} section={section} />
            </div>
            <Direction.Provider dir={direction}>
              <Toaster dir={direction} />
              <div className="lookbook-specimens" dir={direction} lang={locale}>
                {children}
              </div>
            </Direction.Provider>
          </main>
        </div>
      </SidebarProvider>
    </Direction.Provider>
  );
}
