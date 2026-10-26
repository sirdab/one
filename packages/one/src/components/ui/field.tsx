import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Label } from "./label";

/* The Sirdab field: the form layout, one recipe for every form in the studio.
   Taken from shadcn's `field` and trued; what a field LOOKS like is
   field-chrome.ts (Input, Textarea, Select and Combobox all read it), so this
   file only decides how a field is laid out, labelled and explained.

   The stack, 6px apart, always in this order:

       <Field>
           <FieldLabel htmlFor="email">Contact email</FieldLabel>
           <Input id="email" aria-describedby="email-help" placeholder="hello@matjar.sa" />
           <FieldDescription id="email-help">Shown in the footer of your policy pages.</FieldDescription>
       </Field>

   LABELS name (1 to 3 words), PLACEHOLDERS exemplify (an example value, never
   "optional", never an instruction, never the label again), HELP explains the
   shape or the reason in one line, ERRORS say the fix. Required is the
   unmarked majority; the minority carries its word in the label's `hint`
   ("(optional)"), never an asterisk (label.tsx has the rule and its flip for a
   majority-optional form).

   FieldDescription is the quiet caption in `text-muted-foreground`: help is
   read, so it takes the readable tone, not the quieter subtle one.
   FieldError is destructive caption text, `role="alert"` so it is read when it
   appears, and replaces the description in the same slot. The border never
   turns red (invalid colours nothing; the text under the field carries it):
   show an error after the field is left or a save is refused, never on an
   untouched field. Wire both to the control with aria-describedby.

   Every control inside a Field is 44px tall below sm (Input's touch rung,
   --control-touch), 40px from sm: a thumb needs the floor, and a form that
   asks for 16px type on a phone should not hand it a 40px box. The rung is
   here rather than at each call site so a field never has to be told.

   GROUPING. FieldGroup is a 16px stack and the container FieldRow queries.
   FieldRow is the two-up pair that belongs together (first and last name, type
   and amount, start and end, GA4 and Meta ids): two columns once the GROUP is
   28rem wide, one below, so a side column and a phone both stack. Three-up
   (`columns={3}`) is for short numbers only (length, width, height) and stays
   three across on a phone. FieldSet with a FieldLegend names a group; past
   five fields, split into sections (a Separator between CardContent blocks)
   or into cards.

   A switch or checkbox row is `orientation="horizontal"`: the control and its
   text on one axis, 12px apart. */
const fieldVariants = cva("group/field flex w-full", {
  variants: {
    orientation: {
      vertical:
        "flex-col gap-1.5 [&>*]:w-full [&>.sr-only]:w-auto max-sm:[&_[data-slot=input-wrapper]]:h-control-touch max-sm:[&_[data-slot=select-trigger]]:h-control-touch max-sm:[&_[data-slot=combobox-trigger]]:h-control-touch",
      horizontal: [
        "flex-row items-center gap-3",
        "[&>[data-slot=field-label]]:flex-auto",
        "has-[>[data-slot=field-content]]:items-start",
      ],
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

/* A legend is not a flex item (the browser renders it on the fieldset's top
   edge), so the gap does not reach it: its own bottom margin stands in for it,
   and a description straight after it pulls back up to sit 4px under, the
   title and description rhythm of a card header. */
function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-4 font-medium text-foreground",
        "data-[variant=legend]:text-body-lg",
        "data-[variant=label]:text-body",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-4",
        className,
      )}
      {...props}
    />
  );
}

/* Two fields that belong together, side by side by the width of their
   FieldGroup (28rem, the container query), one column under it. The house
   addition to shadcn's set. */
function FieldRow({
  className,
  columns = 2,
  ...props
}: React.ComponentProps<"div"> & { columns?: 2 | 3 }) {
  return (
    <div
      data-slot="field-row"
      className={cn(
        "grid gap-4",
        columns === 3 ? "grid-cols-3" : "@md/field-group:grid-cols-2",
        className,
      )}
      {...props}
    />
  );
}

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

/* Our Label, so the name, the hint and the control-row alignment are one
   implementation. */
function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("group-data-[disabled=true]/field:opacity-50", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-caption-quiet text-muted-foreground group-has-data-[orientation=horizontal]/field:text-balance [[data-variant=legend]+&]:-mt-3",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  if (!children) return null;
  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-caption text-destructive", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRow,
  FieldSet,
};
