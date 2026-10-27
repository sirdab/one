"use client";

import { useState } from "react";

import { toWesternDigits } from "@sirdab/one/foundation";

import { InfoIcon } from "@sirdab/one/icons/shell";
import { Icon } from "@sirdab/one/components/icon";
import { Input } from "@sirdab/one/components/input";

export function DigitInputDemo({
  placeholder = "Type ٢٤٩ or 249: order number",
}: {
  placeholder?: string;
}): React.JSX.Element {
  const [value, setValue] = useState("");

  return (
    <div className="flex max-w-md flex-col gap-1.5">
      <Input
        size="search"
        leading={<Icon icon={InfoIcon} />}
        dir="ltr"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(toWesternDigits(event.target.value))}
        inputClassName="latin tabular"
      />
      <p className="text-caption-quiet text-subtle">
        Stored value: <span className="latin">{value || "–"}</span>
      </p>
    </div>
  );
}
