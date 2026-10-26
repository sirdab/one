# Tabs notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/tabs.tsx`'s header comment.

## Doctrine

Two variants, picked on the root. "underline" is the responsive
PAGE-TABS recipe: full-width rows below lg, hugging bordered pills
from lg (10px radius, gray-alpha-200 border on the active tab). And
at EVERY size the active tab carries the underline: a 2px ink bar
(the minted h-tab-indicator) that SLIDES between tabs on a shared
layout animation, Segmented's thumb recipe (2px ink, wider and darker
than a 1.5px gray-alpha-800 bar, animated like the shadcn underline
tabs). Quiet text rises to ink; rows scroll
horizontally with no scrollbar. "segmented" is the static track for
pane switching inside a view, and it is the SAME shape as the Segmented
control: the track, item and thumb are the constants `segmented.tsx`
exports, read here. A 4% wash track 40 high (44 on touch) at 12px holding
32px tabs (36 on touch) at 8px, the active one carrying the white thumb
with the soft contact shadow; the thumb is PLACED on the active tab (the
panel slide is this variant's motion), where Segmented slides it. Quiet
text rises to ink on hover and when active, and inactive tabs carry no
chrome so nothing moves on selection.

Trigger colours snap; the indicator slide is the underline variant's
one animated piece. Segmented stays fully static.

Tabs vs Segmented (the control): Tabs show PANELS of content with tab
semantics; Segmented picks a MODE with radio semantics and the sliding
thumb. If the choice changes what the page below is, it is Tabs.

## Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sirdab/one/components/ui/tabs";

<Tabs defaultValue="all">
    <TabsList aria-label="عرض المنتجات">
        <TabsTrigger value="all">الكل</TabsTrigger>
        <TabsTrigger value="drafts">المسودات</TabsTrigger>
    </TabsList>
    <TabsContent value="all">…</TabsContent>
    <TabsContent value="drafts">…</TabsContent>
</Tabs>

<Tabs variant="segmented" defaultValue="general">…</Tabs> // static track, all sizes
```
