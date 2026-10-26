"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";

/* The lookbook's direction toggle. Chrome is English by rule and the
   sampler localizes what renders inside components, so the only job a
   locale control has HERE is showing the RTL side. Two states, mapped to
   real locales (LTR → en, RTL → ar) so the flip exercises the whole
   pipeline: dir, the Arabic font stacks and type knobs, Arabic-Indic
   numerals, not just a mirrored layout. (fr/tr routes still exist;
   the product's real language picker is a separate, flag-bearing
   control.)

   Locale rides as ?lang= (next-intl-free): the switch is a plain
   navigation to the same path with the param swapped. The container
   sets dir and the Arabic font triggers from it. */
export function LocaleSwitcher(): React.JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const direction = searchParams.get("lang") === "ar" ? "rtl" : "ltr";

  return (
    <Segmented
      value={direction}
      aria-label="Direction"
      onValueChange={(next) => {
        if (next === direction) return;
        const lang = next === "rtl" ? "ar" : "en";
        window.location.href = `${pathname}?lang=${lang}`;
      }}
    >
      <SegmentedItem value="ltr" label="LTR" className="latin" />
      <SegmentedItem value="rtl" label="RTL" className="latin" />
    </Segmented>
  );
}
