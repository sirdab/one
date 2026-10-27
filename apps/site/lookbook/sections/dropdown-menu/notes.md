# Dropdown menu notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/dropdown-menu.tsx`'s header
comment.

## Doctrine

It does THINGS: Edit, Duplicate, Delete. The third leg of the disclosure
split (Select sets a value, Filter narrows a view, a menu acts). Rows
rest in INK: a menu the merchant opened is the focus of the screen, so
its choices read as primary text, not secondary grey. Highlight adds the
ghost fill; row colours snap while the frosted panel enters at 200ms,
the menu tier. Group labels stay quiet: they name rows, they are not
choices.

Row actions: The canonical trigger: a ghost icon button ('⋯') on a table
row or card. Icons ride along at 16px; the separator fences the
destructive action, which is still ink text here, never red (red
reports, it does not command).

Marking a current choice: RadioGroup rows mark the current pick with a
STATIC alpha-100 fill and ink text. No check glyph; the fill is the
mark. For language menus, density menus, sort orders.

## Usage

Trigger via asChild: ghost icon button for row actions, secondary for
labelled menus. Never for setting a form value (that is Select) and
never for filters (that is the filter chip family). Submenus go ONE
level deep and no further: the account menu genuinely needs to
park theme and language behind a row rather than laying every option
out at once. A menu that wants a second level of nesting still needs a
redesign, not a third component.

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,
         DropdownMenuSeparator, DropdownMenuTrigger } from "@sirdab/one/components/ui/dropdown-menu";

<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="خيارات"><Icon icon={Ellipsis} /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuItem onSelect={…}><Icon icon={PenLine} /> تعديل</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={…}><Icon icon={Trash2} /> حذف</DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>

// current-choice menus: RadioGroup + RadioItem, static fill, no check
<DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
    <DropdownMenuRadioItem value="newest">الأحدث</DropdownMenuRadioItem>
</DropdownMenuRadioGroup>
```
