import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

/* The Sirdab alert: an inline note that sits in the flow of a form or page,
   never a toast. Trued after the shadcn add: a flex row instead of stock's
   arbitrary grid template (the token lint refuses it), the body and label
   type roles instead of the stock small utility, and tone variants on the
   status ramps' subtle fills, never a solid status fill (status reports, it
   does not command). The tone fills carry no border: the fill is the edge,
   except success, which takes its ink as a hairline: it confirms something
   the person just did, and the edge is what makes it read as done rather
   than as one more note on the page.

   role="note" by default: most of these explain a field and must not be
   announced like an error. Pass role="alert" only for something the person
   has to act on right now.

       <Alert variant="warning">
           <Icon icon={CircleAlert} />
           <AlertDescription>...</AlertDescription>
       </Alert> */
const alertVariants = cva(
  "flex w-full items-start gap-3 rounded-lg px-4 py-3 text-body [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-border bg-card text-foreground [&>svg]:text-muted-foreground",
        warning: "bg-warning-subtle text-foreground [&>svg]:text-warning",
        destructive:
          "bg-destructive-subtle text-foreground [&>svg]:text-destructive",
        success:
          "border border-success bg-success-subtle text-foreground [&>svg]:text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  role = "note",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={role}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-label", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle, alertVariants };
