# Combobox notes

Not rendered. The gallery page shows; this file explains. Component usage
stays canonical in `components/ui/combobox.tsx`'s header comment.

## Doctrine

The Popover + Command composition that `command.tsx` describes, named once:
a select-trigger field that reads the picked labels, a panel the trigger's
width, toggling picks that keep the panel open. Filtering is the
component's own (contains, case-insensitive) so it knows when nothing
matched; with `onCreate` that search becomes an "add" row, a real item that
Enter picks. The product form's sections field is the first user.

A pick-one with few options is `Select`; a pick-one row of chips is
`ToggleGroup type="single"`.

## Groups, fixed values, the tray

`groups` heads sets of options by value (an option in none follows them,
unheaded). `fixed` values are always selected: they lead the trigger's
summary and are never rows, so they cannot be unpicked. Below md the panel
is a bottom tray on `Sheet` titled from `title` (else the aria-label), read
once when it opens; a row toggles and keeps it open (several picks are one visit); the
scrim, a drag or Escape closes it, and there is no Done button. The search field shows past twelve options, or whenever `onCreate`
is set, because a short list needs no keyboard in the way.
