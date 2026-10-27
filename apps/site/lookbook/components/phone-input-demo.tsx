"use client";

import { useState } from "react";

import { PhoneInput } from "@sirdab/one/components/phone-input";
import { isValidE164, parsePhone } from "@sirdab/one/lib/phone";

export function PhoneInputDemo({
  locale,
  countryLabelText,
  invalidText,
  initial = "",
  size,
  disabled,
}: {
  locale: string;
  countryLabelText: string;
  invalidText: string;
  initial?: string;
  size?: React.ComponentProps<typeof PhoneInput>["size"];
  disabled?: boolean;
}): React.JSX.Element {
  const [value, setValue] = useState(initial);
  const country = parsePhone(value, "SA").country;
  const invalid = value !== "" && !isValidE164(value, country);

  return (
    <div className="flex max-w-sm flex-col gap-1.5">
      <PhoneInput
        value={value}
        onChange={setValue}
        locale={locale}
        countryLabelText={countryLabelText}
        size={size}
        disabled={disabled}
        aria-label={countryLabelText}
        aria-invalid={invalid}
      />
      {invalid ? (
        <p className="text-caption text-destructive">{invalidText}</p>
      ) : (
        <p className="latin text-caption-quiet text-subtle" dir="ltr">
          {value === "" ? " " : value}
        </p>
      )}
    </div>
  );
}
