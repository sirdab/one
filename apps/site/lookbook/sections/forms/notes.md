# Forms notes

Not rendered. The gallery page shows; this file explains. Component usage
stays canonical in `components/ui/field.tsx`'s header comment, and the page
recipe is `docs/patterns/form-page.md`.

## Doctrine

One recipe for every field: label, control, then help or an error, 6px
apart. What a field looks like is the field chrome (`field-chrome.ts`, one
12px corner, border and focus for Input, Textarea, Select and Combobox); the
`Field` family only lays it out.

- Labels name, in one to three words.
- Placeholders exemplify: an example value ("سارة", "50 123 4567",
  "RRRD2929", "G-XXXXXXXXXX"), never an instruction, never the label again,
  never "optional".
- Help explains the shape or the reason in one line, in the readable muted
  tone (`text-muted-foreground`; the quieter subtle tone is 3.4:1).
- Errors say the fix, in destructive caption text, under the field, read
  aloud when they appear. The border never turns red. They show after the
  field is left or a save is refused, never while typing and never on an
  untouched field. They replace the help in the same slot.
- Required is the unmarked majority; the minority carries its word in the
  label's hint ("(optional)"), never an asterisk. In a majority-optional form
  flip it and mark the required ones in text.
- Controls are 44px on a phone and 40px from sm, with the type at 16px on a
  phone (no iOS zoom). The `Field` carries that rung.

Side by side only for a pair that belongs together (first and last name, type
and amount, start and end, two analytics ids), by the width of the group (28rem)
so a side column and a phone both stack. Three across only for short numbers
(length, width, height), which stay three across on a phone.

## Save

There is no Save on the page. It lives in the topbar tail, appears (springing
in) once the page is edited and would save, and leaves when it does. Enter in a
field saves. No Discard beside it: these pages are always editable, and the
leave guard catches an accident. Dialogs keep Cancel and conceal their primary
until it can run. Instant controls (uploads, switches) save on change.
