# Dialog notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/dialog.tsx`'s header comment.

## Doctrine

The blocking layer. A modal REPLACES the stack: the frosted scrim behind
(gray-150 at 30% over a 2.5px blur, a light veil that brightens, never
a black dim), the panel on top at surface-modal + shadow-modal + the
24px modal radius, every size. In dark the panel is ink and the scrim +
border do all the separating. Enter: fade + zoom from 95%, 200ms.

The canonical shape: header (title + optional description), body, footer
with the actions end-aligned. The footer stacks column-reverse on mobile
so the primary stays on top, closest to the thumb.

An ordinary delete confirms with a PRIMARY button and an explicit verb.
Friction comes from the modal and the wording, never from a red fill.
The destructive outline variant is reserved for catastrophic,
irreversible confirmations.

className on DialogContent is for LAYOUT (a wider max-w for a big form);
colour, radius, and shadow come from the component. Never a dialog over
a dialog. A popover may open over one (the stacking rule's third
level), and anything bigger than a form belongs on its own page, not in
a modal.

## Usage

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sirdab/one/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="secondary">تعديل</Button>
  </DialogTrigger>
  <DialogContent closeLabel="إغلاق">
    <DialogHeader>
      <DialogTitle>تعديل الاسم</DialogTitle>
      <DialogDescription>يظهر على المتجر والفواتير.</DialogDescription>
    </DialogHeader>
    …form…
    <DialogFooter>
      <Button>حفظ</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```
