"use client";

import { useEffect, useRef, useState } from "react";

/* The Arabic weight dial, read back from the rendered page.

   Weight is the one type knob that is set PER ROLE rather than as a
   single script scalar (foundation.css, the [lang="ar"] block), so the
   only honest way to show the ladder is to measure it: a hardcoded
   number here would drift the first time someone turns a dial.

   Each row renders the same role twice, once in a Latin island and once
   in an Arabic subtree, and reports what the browser actually computed.
   Rows where the two differ are marked, so the divergences read as a
   short list instead of something you have to diff by eye. */

const ROLES = [
  { cls: "text-caption", name: "caption" },
  { cls: "text-caption-quiet", name: "caption-quiet" },
  { cls: "text-label", name: "label" },
  { cls: "text-body", name: "body" },
  { cls: "text-body-quiet", name: "body-quiet" },
  { cls: "text-body-lg", name: "body-lg" },
  { cls: "text-heading-xs", name: "heading-xs" },
  { cls: "text-heading-sm", name: "heading-sm" },
  { cls: "text-heading-md", name: "heading-md" },
  { cls: "text-display-sm", name: "display-sm" },
  { cls: "text-display-md", name: "display-md" },
  { cls: "text-display-lg", name: "display-lg" },
] as const;

type Reading = { latin: string; arabic: string };

export function WeightLadder(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState<Record<string, Reading> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled || ref.current == null) return;
      const next: Record<string, Reading> = {};
      for (const role of ROLES) {
        const at = (script: string): string => {
          const el = ref.current?.querySelector<HTMLElement>(
            `[data-role="${role.name}"][data-script="${script}"]`,
          );
          return el ? getComputedStyle(el).fontWeight : "?";
        };
        next[role.name] = { latin: at("latin"), arabic: at("arabic") };
      }
      setRead(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={ref} className="flex flex-col">
      {ROLES.map((role) => {
        const reading = read?.[role.name];
        const diverges = reading != null && reading.latin !== reading.arabic;
        return (
          <div
            key={role.name}
            className="border-border flex items-baseline gap-4 border-b py-3 last:border-b-0"
          >
            <p className="text-caption-quiet text-subtle w-32 shrink-0">
              {role.name}
              {diverges ? (
                <span className="text-caption ms-1.5 text-foreground">✳</span>
              ) : null}
            </p>

            {/* The specimens ARE the probes: what you see is
                            the element the readout measured. */}
            <div className="flex min-w-0 flex-1 items-baseline gap-2">
              <span
                data-role={role.name}
                data-script="latin"
                lang="en"
                className={`latin truncate ${role.cls}`}
              >
                Sell everywhere
              </span>
              <span className="latin text-caption-quiet text-subtle shrink-0">
                {reading?.latin ?? "…"}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 items-baseline gap-2">
              <span
                data-role={role.name}
                data-script="arabic"
                lang="ar"
                dir="rtl"
                className={`truncate ${role.cls}`}
              >
                بيع في كل مكان
              </span>
              <span
                className={`latin text-caption-quiet shrink-0 ${
                  diverges ? "text-foreground" : "text-subtle"
                }`}
              >
                {reading?.arabic ?? "…"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
