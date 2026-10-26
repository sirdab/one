"use client";

import { useState } from "react";

import { Field, FieldError, FieldLabel } from "@sirdab/one/components/field";
import { PhoneInput } from "@sirdab/one/components/phone-input";
import { isValidE164, parsePhone } from "@sirdab/one/lib/phone";

/* A phone field as a form builds it: the label, the box, and the fix under it
   once the number is left half-typed. The PhoneInput is controlled, so the
   gallery's server pages hand it to this wrapper. `explain` shows the error
   straight away for a number that starts invalid, so the specimen has
   something to show without a click; a live form shows it after blur. */
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
