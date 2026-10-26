"use client";

import { FilterChip } from "@sirdab/one/components/filter-chip";

export function FilterChipDemo({
  items,
}: {
  items: string[];
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((label, index) => (
        <FilterChip key={label} defaultPressed={index === 0}>
          {label}
        </FilterChip>
      ))}
    </div>
  );
}
