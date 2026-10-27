import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Label } from "./label";

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
