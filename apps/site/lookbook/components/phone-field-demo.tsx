"use client";

import { useState } from "react";

import { Field, FieldError, FieldLabel } from "@sirdab/one/components/field";
import { PhoneInput } from "@sirdab/one/components/phone-input";
import { isValidE164, parsePhone } from "@sirdab/one/lib/phone";

export function PhoneFieldDemo({
  id,
  locale,
  label,
  countryLabelText,
  invalidText,
  initial = "",
  explain = false,
}: {
  id: string;
  locale: string;
  label: string;
  countryLabelText: string;
  invalidText: string;
  initial?: string;
  explain?: boolean;
}): React.JSX.Element {
  const [value, setValue] = useState(initial);
  const [left, setLeft] = useState(explain);
  const country = parsePhone(value, "SA").country;
  const invalid = value !== "" && !isValidE164(value, country);
  const errorId = `${id}-error`;
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <PhoneInput
        id={id}
        value={value}
        onChange={setValue}
        locale={locale}
        countryLabelText={countryLabelText}
        placeholder="50 123 4567"
        aria-invalid={left && invalid}
        aria-describedby={left && invalid ? errorId : undefined}
        onBlur={() => setLeft(true)}
      />
      {left && invalid ? (
        <FieldError id={errorId}>{invalidText}</FieldError>
      ) : null}
    </Field>
  );
}
