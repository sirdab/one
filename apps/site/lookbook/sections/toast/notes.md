# Toast notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/sonner.tsx`'s header comment.

## Doctrine

Sonner, taken from shadcn as-is per the house rule (a missing component
comes from shadcn, never a hand build). Its three --normal-\* hooks point
at our popover tokens, so toasts land on the popover surface in both
themes with zero local styling. The Toaster is mounted once in the
locale layout.

Live: Every toast on the page is the stock sonner render wearing our
tokens. Flip the theme and fire them again.

## Usage

Call toast() from anywhere; never mount a second Toaster. Keep messages
to a word or two plus an optional description, and prefer action over a
second toast when the user can undo.

```tsx
import { toast } from "sonner";

toast("Draft saved"); // default
toast.success("Product published"); // status: reports, never commands
toast.error("Payment failed"); // the only red that is allowed

toast("Store created", {
  description: "Your storefront is being generated.",
});

toast("Product deleted", {
  action: { label: "Undo", onClick: undo }, // recovery beats apology
});
```
