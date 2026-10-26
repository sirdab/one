"use client";

import { useState } from "react";

import { Button } from "@sirdab/one/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubmit,
  DialogTitle,
  DialogTrigger,
} from "@sirdab/one/components/dialog";
import { Field, FieldLabel } from "@sirdab/one/components/field";
import { Input } from "@sirdab/one/components/input";
import { sampler } from "./samples";

const STORED = "Sara Alqahtani";

/* The form dialog as the studio builds it: Cancel is always there, and the
   primary is not on the sheet until the draft would save. Type a different
   name and Save arrives above Cancel on a phone, beside it from sm; type it
   back and it goes. The sheet is the same height either way. */
export function DialogFormDemo({
  locale = "en",
}: {
  locale?: string;
}): React.JSX.Element {
  const s = sampler(locale);
  const initial = s(STORED);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initial);
  const ready = draft.trim() !== "" && draft.trim() !== initial;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(initial);
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">{s("Edit name")}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={s("Close")}>
        <DialogHeader>
          <DialogTitle>{s("Edit name")}</DialogTitle>
          <DialogDescription>
            {s("Shown on your storefront and receipts.")}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) setOpen(false);
          }}
        >
          <Field>
            <FieldLabel htmlFor="dlg-name">{s("Name")}</FieldLabel>
            <Input
              id="dlg-name"
              value={draft}
              placeholder={s("Sara")}
              onChange={(event) => setDraft(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {s("Cancel")}
            </Button>
            <DialogSubmit ready={ready}>{s("Save")}</DialogSubmit>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
