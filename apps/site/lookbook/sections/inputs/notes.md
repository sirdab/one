# Inputs notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/input.tsx`'s header comment.

## Doctrine

The Sirdab input is composite: the wrapper owns the border, radius, and
focus; the field inside is bare. That is what lets a leading icon, the
text, and a trailing button share one box, and focus lights the whole
unit. Form fields sit at 40px, search shares the rung, and invalid
never colours the border.

State matrix: every size walks the same ladder. Hairline rest
(alpha-200) → hover alpha-400 (`--input-border-hover`) on every size;
the gentler `-form` rung (alpha-300) belongs to checkbox and radio only →
focus is an ink border plus a half-pixel ink ring (~1.5px of ink, not
the 2px global outline) → disabled dims the whole unit. Hover/focus
columns are pinned via className so the matrix reads at a glance (a
lookbook-only exemption; product code must never pass state colours
through className). Every cell is live too.

Invalid is text, never a border: invalid fields keep untouched chrome.
The error is destructive caption text under the field, wired with
aria-describedby. Do not colour the border, the label, or the
placeholder.

Compositions: leading icons light with focus; trailing content is a
ghost icon button sharing the box; the spinner docks at the field's end.
readOnly keeps focus and selection (copyable) but drops the hover
affordance: hover promises editability. Uploads are a ghost button over
a hidden file input, never a styled file control.

The field recipe: label (14px medium, foreground) → field → helper in
subtle caption, error in destructive caption. Stack gap is 6px. This is
a recipe, not a component. Compose it inline until a real repeated need
says otherwise.

Numbers in fields: identifiers are matched outside the app, so numeric
inputs normalize Arabic-Indic and Extended digits to Western on every
keystroke: a search for order ٢٤٩ must find 249. The field itself runs
LTR with tabular Latin digits.

The global search trigger: the ⌘K affordance is a BUTTON dressed as an
input: secondary chrome, placeholder-toned text (passed via className,
an accepted exemption until a real SearchTrigger component earns its
place), a search icon, and keycaps on dedicated tokens (15% ink border,
gray-50 surface, snapped to a 16px box). It opens the command palette;
the palette's own field is a bare input on the modal surface.

Usage: className on the wrapper is for layout only (width, margins,
grid placement); size and chrome come from the props. If a field needs
chrome no prop covers, that is a design-system conversation.

## Usage

```tsx
import { Input } from "@sirdab/one/components/ui/input";

<Input placeholder="اسم المنتج" />                       // 40px: THE form default, rounded-xl
<Input size="md" … />                                   // 36px: compact forms
<Input size="sm" … />                                   // 32px: dense rows, toolbars
<Input size="search" leading={<Icon icon={Search}  />} … />          // 40px, rounded-xl
<Input size="touch" … />                                // 44px: auth, mobile

<Input size="search" leading={<Icon icon={Search}  />} loading />    // icon lights with focus; spinner docks

// Trailing button pairs with the field size: sm/md take size="icon-sm" (28px),
// default/search/touch take size="icon" (32px). This bare Input is the 40px default:
<Input
    trailing={<Button variant="ghost" size="icon" aria-label="Show"><Icon icon={Eye}  /></Button>}
/>
```

```tsx
// The field recipe: label, field, helper/error. 6px stack gap.
<div className="flex flex-col gap-1.5">
    <Label htmlFor="price">{s("Price")}</Label>
    <Input id="price" aria-invalid aria-describedby="price-err"
           dir="ltr" inputClassName="latin tabular" />
    <p id="price-err" className="text-caption text-destructive">…</p>
</div>
// Invalid NEVER colours the border; the error is the text.

// Numeric fields normalize digits on every keystroke:
onChange={(e) => setValue(toWesternDigits(e.target.value))}

// Uploads: ghost button + hidden file input, never a styled file control.
<input type="file" hidden ref={fileRef} />
<Button variant="ghost" size="icon" aria-label="Upload"
        onClick={() => fileRef.current?.click()}><Icon icon={FileUp}  /></Button>
```
