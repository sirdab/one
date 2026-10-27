"use client";

import * as React from "react";

import {
  Combobox,
  type ComboboxGroup,
  type ComboboxOption,
} from "@sirdab/one/components/combobox";

export function ComboboxDemo({
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  creatable,
  groups,
  fixed,
}: {
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  creatable: boolean;
  groups?: ComboboxGroup[];
  fixed?: string[];
}): React.JSX.Element {
  const [all, setAll] = React.useState(options);
  const [value, setValue] = React.useState<string[]>([]);
  return (
    <Combobox
      className="w-72"
      aria-label={placeholder}
      options={all}
      groups={groups}
      fixed={fixed}
      value={value}
      onValueChange={setValue}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyLabel={emptyLabel}
      createLabel={creatable ? (query) => query : undefined}
      onCreate={
        creatable
          ? async (query) => {
              const option = {
                value: `new-${query}`,
                label: query,
              };
              setAll((current) => [...current, option]);
              setValue((current) => [...current, option.value]);
            }
          : undefined
      }
    />
  );
}
