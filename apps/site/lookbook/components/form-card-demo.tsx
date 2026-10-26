"use client";

import { useState } from "react";

import { Button } from "@sirdab/one/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sirdab/one/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@sirdab/one/components/field";
import { Input } from "@sirdab/one/components/input";
import { Reveal } from "@sirdab/one/components/reveal";
import { sampler } from "./samples";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Where Save goes, working: a bar standing in for the studio's topbar, and a
   card form under it. Save is not on the page at all. It springs into the
   bar's tail once the field differs from what is stored AND would save, and
   leaves again when it does. A bad address says why under the field after the
   field is left (never while it is being typed), and Save stays away. Enter in
   the field saves. */
export function FormCardDemo({
  locale = "en",
}: {
  locale?: string;
}): React.JSX.Element {
  const s = sampler(locale);
  const [stored, setStored] = useState("hello@matjar.sa");
  const [email, setEmail] = useState(stored);
  const [left, setLeft] = useState(false);
  const trimmed = email.trim();
  const invalid = trimmed !== "" && !EMAIL.test(trimmed);
  const ready = trimmed !== stored && !invalid;

  function save(): void {
    if (!ready) return;
    setStored(trimmed);
    setEmail(trimmed);
  }

  return (
    <div className="border-border flex max-w-xl flex-col overflow-hidden rounded-xl border">
      <div className="border-border bg-header-surface flex h-12 items-center justify-between gap-2 border-b px-3">
        <span className="text-label">{s("Store settings")}</span>
        <Reveal open={ready}>
          <Button concealed={!ready} onClick={save}>
            {s("Save")}
          </Button>
        </Reveal>
      </div>
      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{s("Contact details")}</CardTitle>
            <CardDescription>
              {s("Shown in the footer of your store's policy pages.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="lb-demo-email">
                    {s("Contact email")}
                  </FieldLabel>
                  <Input
                    id="lb-demo-email"
                    type="email"
                    dir="ltr"
                    value={email}
                    placeholder="hello@matjar.sa"
                    aria-invalid={left && invalid}
                    aria-describedby="lb-demo-email-note"
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => setLeft(true)}
                  />
                  {left && invalid ? (
                    <FieldError id="lb-demo-email-note">
                      {s("That email doesn't look right.")}
                    </FieldError>
                  ) : (
                    <FieldDescription id="lb-demo-email-note">
                      {s("Customers write here about their orders.")}
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
