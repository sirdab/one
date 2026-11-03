"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

type FormSheetFormProps =
  | {
      onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
      formId?: string;
      noValidate?: boolean;
    }
  | {
      onSubmit?: undefined;
      formId: string;
      noValidate?: undefined;
    };

type FormSheetProps = FormSheetFormProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  cancelLabel: React.ReactNode;
  submitLabel: React.ReactNode;
  pending?: boolean;
  submitDisabled?: boolean;
  onCloseAutoFocus?: (event: Event) => void;
  className?: string;
  children: React.ReactNode;
};

function FormSheet({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  cancelLabel,
  submitLabel,
  pending = false,
  submitDisabled = false,
  onCloseAutoFocus,
  className,
  children,
  ...form
}: FormSheetProps): React.JSX.Element {
  const generatedId = React.useId();
  const formId = form.formId ?? `form-sheet-${generatedId}`;

  const body =
    form.onSubmit === undefined ? (
      children
    ) : (
      <form
        id={formId}
        noValidate={form.noValidate}
        onSubmit={form.onSubmit}
        className="flex flex-col gap-4"
      >
        {children}
      </form>
    );

  return (
    <Sheet open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        data-slot="form-sheet"
        className={cn("max-sm:start-2 max-sm:w-auto", className)}
        onCloseAutoFocus={onCloseAutoFocus}
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <SheetHeader
          data-slot="form-sheet-header"
          className="border-b border-border"
        >
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div
          data-slot="form-sheet-body"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
          {body}
        </div>
        <SheetFooter
          data-slot="form-sheet-footer"
          className="border-t border-border"
        >
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              {cancelLabel}
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form={formId}
            loading={pending}
            disabled={submitDisabled}
          >
            {submitLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { FormSheet };
export type { FormSheetProps };
