"use client";

import { useRouter } from "next/navigation";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";
import { lookbookHref } from "../routing";
import type { LookbookLocale } from "../routing";

export function LocaleSwitcher({
  locale = "ar",
  section,
}: {
  locale?: LookbookLocale;
  section?: string;
}): React.JSX.Element {
  const router: ReturnType<typeof useRouter> = useRouter();
  return (
    <Segmented
      animated={false}
      value={locale}
      aria-label="Example language and direction"
      onValueChange={(next: string): void =>
        router.push(lookbookHref(section, next === "ar" ? "ar" : "en"))
      }
    >
      <SegmentedItem value="ar" label="العربية / RTL" lang="ar" />
      <SegmentedItem value="en" label="English / LTR" />
    </Segmented>
  );
}
