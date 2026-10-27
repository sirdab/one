"use client";

import { useEffect, useRef, useState } from "react";

type Result = {
  latin: string;
  arabic: string;
  digitSpread: string;
  digitWidths: string;
};

const DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function MetricsProbe(): React.JSX.Element {
  const latinRef = useRef<HTMLParagraphElement>(null);
  const arabicRef = useRef<HTMLParagraphElement>(null);
  const digitsRef = useRef<HTMLSpanElement>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (cancelled) return;
      const latin = latinRef.current;
      const arabic = arabicRef.current;
      const digits = digitsRef.current;
      if (!latin || !arabic || !digits) return;

      const fmt = (el: HTMLElement): string => {
        const cs = getComputedStyle(el);
        return `${parseFloat(cs.fontSize).toFixed(2)}px / ${parseFloat(cs.lineHeight).toFixed(2)}px`;
      };

      const widths = Array.from(digits.children).map(
        (child) => child.getBoundingClientRect().width,
      );
      const spread = Math.max(...widths) - Math.min(...widths);

      setResult({
        latin: fmt(latin),
        arabic: fmt(arabic),
        digitSpread: `${spread.toFixed(3)}px`,
        digitWidths: widths.map((w) => w.toFixed(2)).join(" · "),
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <p ref={latinRef} className="text-body">
        Add your first product
      </p>
      <p ref={arabicRef} className="text-body" lang="ar" dir="rtl">
        أضف أول منتج إلى متجرك
      </p>
      <p className="text-display-lg" lang="ar" dir="rtl">
        بيع في كل مكان
      </p>
      <p className="tabular text-body" lang="ar" dir="rtl">
        <span ref={digitsRef}>
          {DIGITS.map((digit) => (
            <span key={digit} className="inline-block">
              {digit}
            </span>
          ))}
        </span>
      </p>
      <div className="border-border flex flex-col gap-1 border-t pt-3">
        {result ? (
          <>
            <p className="latin text-caption text-muted-foreground">
              latin computed: {result.latin}, expected 14 / 20
            </p>
            <p className="latin text-caption text-muted-foreground">
              arabic computed: {result.arabic}, expected ≈14.70 / ≈24.23 (1.05
              scale, +0.22 leading on the scaled size)
            </p>
            <p className="latin text-caption text-muted-foreground">
              arabic-indic digit spread: {result.digitSpread}, ~0 would mean
              tabular ٠-٩; Plex uses proportional Arabic-Indic digits.
            </p>
            <p className="latin text-caption-quiet text-subtle">
              widths: {result.digitWidths}
            </p>
          </>
        ) : (
          <p className="text-caption-quiet text-subtle">measuring…</p>
        )}
      </div>
    </div>
  );
}
