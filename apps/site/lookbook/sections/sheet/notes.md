# Sheet notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/sheet.tsx`'s header comment.

## Doctrine

The blocking layer for the mobile nav drawer, side panels and bottom
trays, and it IS the shadcn DRAWER pattern (vaul): a floating panel
inset 8px from the viewport, rounded on every corner, with
drag-to-dismiss physics; the bottom tray keeps the grab handle. Not a
flush edge-attached panel. Same frosted scrim as Dialog (one scrim for
every blocking layer). The panel is bg-background (floating layers
return to background; the rail's tint belongs to the docked rail only)
with shadow-modal-lg, and in dark the shadow computes to none so the
panel carries a border instead. House type roles throughout.

No built-in X: it closes by drag, scrim, Escape, or an explicit Cancel
(SheetClose) in the footer, where actions sit side by side, end-aligned.
Sides stay logical (start/end/bottom) and map to vaul's physical
directions through the direction provider, so RTL mirrors for free.

Drawer (side='start'): the nav-drawer shape; the drawer content owns
its own chrome. Bottom tray (side='bottom'): full-width, for pickers and
quick actions on mobile.

## Usage

className on SheetContent is for layout (padding, width overrides);
surface, border, and motion come from the component. A sheet's content
must include a SheetTitle (screen readers announce it); hide it visually
with sr-only if the design has no heading.

```tsx
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@sirdab/one/components/ui/sheet";

<Sheet side="start">                     // the nav drawer
    <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="القائمة"><Icon icon={Menu} /></Button>
    </SheetTrigger>
    <SheetContent>
        <SheetTitle className="sr-only">التنقل</SheetTitle>
        …the drawer content owns its chrome, incl. <SheetClose />…
    </SheetContent>
</Sheet>

<Sheet side="bottom">…</Sheet>   // mobile tray
```
