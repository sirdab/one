"use client";

import { useEffect, useState } from "react";

const sections: readonly { id: string; label: string }[] = [
  { id: "installation", label: "Installation" },
  { id: "first-component", label: "Your first component" },
  { id: "nextjs", label: "Next.js" },
  { id: "theming", label: "Theming" },
  { id: "arabic", label: "Arabic and RTL" },
  { id: "customization", label: "Customization" },
  { id: "composition", label: "Live composition" },
];

export function DocsNavigation(): React.JSX.Element {
  const [activeId, setActiveId] = useState<string>("installation");

  useEffect((): (() => void) => {
    const elements: HTMLElement[] = sections.flatMap(
      ({ id }: { id: string }): HTMLElement[] => {
        const element: HTMLElement | null = document.getElementById(id);
        return element ? [element] : [];
      },
    );
    let frame: number = 0;
    const update = (): void => {
      frame = 0;
      const offset: number =
        Number.parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      let current: HTMLElement | undefined = elements[0];
      for (const element of elements) {
        if (element.getBoundingClientRect().top > offset + 1) break;
        current = element;
      }

      if (
        window.scrollY > 0 &&
        Math.ceil(window.scrollY + window.innerHeight) >=
          document.documentElement.scrollHeight
      ) {
        current = elements.at(-1);
      }
      if (current) setActiveId(current.id);
    };
    const schedule = (): void => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer: ResizeObserver = new ResizeObserver(schedule);
    const article: Element | null = document.querySelector(".docs-article");
    if (article) observer.observe(article);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    schedule();
    return (): void => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, []);

  return (
    <aside className="docs-nav">
      <p className="text-heading-xs">Getting started</p>
      <nav aria-label="On this page">
        {sections.map(
          ({ id, label }: { id: string; label: string }): React.JSX.Element => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={activeId === id ? "location" : undefined}
            >
              {label}
            </a>
          ),
        )}
      </nav>
    </aside>
  );
}
