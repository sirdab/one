# Building a page: read this once and you know

This is the whole system in one sitting. If you remember nothing else,
remember the four bold rules.

## Surfaces, and THE STACKING RULE

**The page is WHITE (`oklch(100% 0 0)`), and every surface on it is a
neutral step off that white.** `--surface-flat` shares the page's white,
the whisper sits a half-step below (`#FCFCFC`), the rail at `--gray-50`;
depth comes from those tone steps AND the hairline, never from a hairline
alone. The ramp is chroma-zero, so there is no tint to lean on.

The light ladder, bottom to top:

| Tone              | Token               | What                                      |
| ----------------- | ------------------- | ----------------------------------------- |
| `#F4F4F4`         | `--surface-sunken`  | the plane behind a lifted shell card      |
| `#FAFAFA`         | `--surface-rail`    | sidebar / navbar, docked (gray-50)        |
| `#FCFCFC`         | `--surface-whisper` | the recessed tonal card                   |
| `oklch(100% 0 0)` | `--background`      | the page                                  |
| `oklch(100% 0 0)` | `--surface-flat`    | cards, popovers, modals: the page's white |

Card and page share the white, so the card's edge is the hairline ring that
leads its shadow (`--shadow-card`; a card wearing it has no border); the
tone steps only go DOWN from there (whisper, rail, sunken), which is what
lets a well or a rail read as structure without a border. The rail sits
deliberately between the page and a card: docked only, since as the
mobile drawer the same sidebar returns to plain background like every
floating layer.

The WHISPER panel (`--surface-whisper`) is the tonal card for recessed
group surfaces (preview, media, code) where a border would fight the
content, and it follows the ground. A recessed surface has to be darker
than what it is recessed into, and that is a white card, so it sits a
half-step below white (`#FCFCFC` light, `#121212` dark). The sandwich reads
the same way round: white page, white card, whisper well inside it, white
element on top of the well.

Alpha washes are fills INSIDE components (tracks, hovers), never a
surface.

The shell adds a fourth: `--surface-sunken` (`#F4F4F4` light, `#191919`
dark), the plane the workspace card sits ON when the assistant lifts it.
Light is ramp step 62, minted for this: 50 sits too close to the page to
read as below it and 75 too far. Dark stays hand-authored off-ramp, see
the comment on the
declaration. It is a BACKDROP, never a card and never content:
the only thing allowed on it is a lifted surface. In dark it is the one
surface that does not mirror light: `#191919` sits ABOVE the ink page,
between the rail (`#171717`) and gray-75's flip (`#212121`), so the ink
card on it reads as cut into the plane and the border finishes the edge.

The shell adds one more deliberate pair: the HEADER frosts
(`bg-header-surface` + `backdrop-blur-header`: background at 90% over
an 8px blur, both themes) so page content dissolves under it as it
scrolls, while the rail stays solid tint. Rail solid, header frosted:
that asymmetry is the shell's surface story; never swap them.

**A screen is never more than three deep: background + card + popover.**

1. **Background**: white.
2. **Card**: white, lifted once by `--shadow-card`, whose first layer is
   the hairline, so a page card wears no border. Anything INSIDE a card is a
   `border-border` hairline (12px) or a whisper well, never a second shadow
   and never a shadow plus a border. `shadow-raised` is a hover/drag state.
3. **Popover**, everything that floats: menus, select panels,
   comboboxes, filter dialogs. White, frosted at 90% over the 8px blur,
   `shadow-popover-sm`. Its 1px ring IS the border; floating panels never
   carry `border`. The tooltip is the one floating exception: an ink chip
   (`--primary`, text only, never a target; COLORS.md, "Ink commands"),
   because a hint has to read at a glance over a photo or a table.
4. **Modal** REPLACES the stack: the frosted scrim behind
   (`bg-scrim-surface` + `backdrop-blur-scrim`: gray-150 at 30% over a
   2.5px blur, a light veil that brightens, not a black dim), the white
   modal on top. ONE scrim for every blocking layer: dialogs, sheets,
   and the mobile nav drawer (the stock drawer ships a dark veil;
   patched). A popover may open over a modal (three again).
   Never background + card + modal + popover; never a panel over a
   panel. If a flow seems to need four, the middle surface is wrong.

**Sirdab supports optional light, dark and system theme switching.**
The provider applies `.dark` to the root for whole-page dark mode, including
when the system preference selects it. `.dark` and `.light` also work on
subtrees: a shell can use a dark frame around a light page card. Portals
inherit their container's theme, normally the document body.

**Inside a `.dark` scope it is the same pair, swapped.** The ground is INK (`#0F0F0F`,
16.8% lightness, deeper than the ramp's 20.5% floor) and `--ink` goes to
white, so text and the primary button are paper-on-ink where light was
ink-on-paper. The surfaces climb off the page as hand-tuned tones a
whisper apart rather than ramp steps: cards stay at ink plus border,
whisper `#121212` is the tonal card, the rail rides dark gray-50
(`#171717`), the frosted popover is gray-100
(`#2E2E2E`) at 90% (about `#2B2B2B` over the card), and the modal is back
at ink with the scrim and its border doing the separating. Dark paints
zero elevation shadows: depth is surface and border, full stop.

The ramp itself is one list of numbers read from both ends: light maps
`--gray-N` to ramp step N, dark to step (1000 - N). Both `.dark` and
`.light` work on ANY element: every alias that reads a flipping token is
declared on `:root, .light, .dark`, so it re-resolves on the nearest scope
element, and each `.dark` block overrides only what differs. Nesting is
free (a `.light` card inside a `.dark` frame, and back). The `dark:`
Tailwind variant means "inside a `.dark` scope and not inside a `.light`
island", never the OS preference. The contract is written up at THEME
SCOPES in `foundation.css` and pinned by `src/tests/theme-scopes.test.ts`;
a new alias that reads a flipping token goes in a scoped block, never a
bare `:root`.

Sirdab keeps its teal ramp and semantic brand aliases in this package.
App-specific landing treatments stay in the app. The default page and action
remain `--background` and `--primary`; see COLORS.md for brand-primary rulings.
`--surface-raised` remains available for existing consumers: gray-50 in light,
#151515 in dark.

## Sizes, one number to remember: 40

**Everything everyday is 40px**: secondary Button `size="xl"`, Input
default, Select trigger default. They align in a row by default.

**The PRIMARY action is 32px**: the default primary Button, one per
view. That size contrast (big calm fields, one compact ink action) is the
look; don't flatten it.

Everything else is situational: 32 ghosts in toolbars, 24 chips, 44 on
touch/auth. Table rows are `--row-height` (52px, `h-row`). Rows are
DATA, not controls, and get the taller rhythm; the 40px rule is for
interactive controls only. Never pick a size by
taste. Pick it by
surface.

## Which button

- **primary**: THE action. Ink (the foreground inverted), 32px, one per
  view. It flips with the foreground: white on ink inside a `.dark` scope.
- **secondary**: the workhorse. Bordered, on white, 40px.
- **outline**: secondary's twin for TINTED surfaces only. Its
  transparent base sits IN the tint; secondary's opaque bg would punch a
  card-shaped hole. Never on white.
- **ghost**: icon-only actions and toolbars. No border.
- **chip**: filters and toggles; the quiet one (muted label, quiet
  icon). Hugs.
- **destructive**: red OUTLINE, never a fill. Catastrophic
  confirmations only.
- **link**: inline text action.

## Which disclosure

Ask one question: **does it set a value, or do a thing?**

- **Select**: sets ONE value in a form. In a form it is a FIELD, in the
  Input's chrome (secondary trigger at 36, 40 or 44; outline on a tint);
  ghost in toolbars and chip for filter-flavoured pickers keep Button's
  chrome. Triggers HUG; a form gives width at the call site (`w-full`,
  `w-56`). Never clearable: an empty form field is an error, not an
  answer. ONE unavailable state, `closed`: not available yet, and the
  reason is the field's placeholder (touch has no hover) repeated on a
  tooltip. There is no disabled select to choose;
  the `disabled:` styling that remains is a fallback for machinery (a
  `<fieldset disabled>`) and paints identically. Below md a Select opens
  the house tray (the Sheet from the bottom, titled with the field's
  label) instead of the popover, unless it sits inside a dialog, sheet or
  popover already.
- **Filter chips**: narrow a view. `FilterChip` toggles;
  `FilterChipSelect` opens choices and animates the pick into itself;
  both invert to ink when applied and hug. `FilterTrigger` is the 40px
  multi-value version: it keeps Button's family chrome (a bordered
  ghost-wash trigger, because a filter narrows a view and is not a form
  field), not the form select's field chrome, and summarises its picks in
  the trigger.
- **Segmented**: picks a MODE (one always active). Animated icon
  variant, text-only (stable width), or `animated={false}`. Not for
  filters, not for form values.
- **DropdownMenu** does THINGS: Edit, Duplicate, Delete. Menu
  rows rest QUIET (muted) and rise to ink on hover: the one place quiet
  text is the default.

## Explaining a terse control

**We lean on tooltips, structurally.** Every label in this system is
deliberately short: a glyph, a word, a noun. That terseness is the look
and it is only honest if the explanation is one hover away.

**The rule: the label NAMES, the hint EXPLAINS.** Any control whose
visible label is shorter than its meaning carries a `hint`.

**The test, applied to the control in front of you:** read its label
and ask "compared to what?" or "what will this do to what I am looking
at?". If the label cannot answer, it needs a hint. Two controls sitting
side by side almost always fail this, because adjacency implies a
difference that one-word labels do not carry. So do controls that act
on a view rather than on a value: the label says what the thing is
called, never what applying it does.

That test, not a list, decides. It already catches every picker,
filter, mode switch and icon button we ship, including the ones added
after this was written, and it catches the next one too. A control that
abbreviates and has nowhere to put a hint is a gap in the component,
not permission to skip the hint: add the prop.

**Refusal is the same rule, and it is not optional.** A control that
will not work is a question the person cannot answer by looking, so
**anything disabled says WHY**. Every control that can refuse takes
`disabledReason`; a Select trigger's version is called `closed` and is
its only unavailable state. Greying something out and
walking away is the one failure this system will not forgive, because
the user is left guessing at the exact moment they are already stuck.
If you cannot articulate the reason, the control should not be
disabled: hide it, or let it fail with a real message.

Saying why has a mechanical cost, and the components pay it for you.
The HTML `disabled` attribute drops an element from the tab order and
suppresses hover, which puts the explanation out of reach of the two
ways anyone would look for it. So a control with a reason is
`aria-disabled` instead: focusable, announced disabled, hoverable, with
activation blocked in the handler. A FIELD refuses differently, with
`readOnly`, because aria-disabled alone still accepts typing. Both
shapes live in `components/ui/disabled-reason.tsx` so they cannot drift;
never hand-roll either with the real attribute plus a tooltip, because
the tooltip will simply never open.

**The boundary, and it is hard:** a tooltip may EXPLAIN, it may never
CARRY. There is no hover on touch and we are mobile-heavy, so anything
a user needs in order to act correctly belongs in the label, in helper
text under the field, or in the empty state. If removing every tooltip
would leave someone stuck, the design is wrong, not under-tooltipped.
Hints are also short: a phrase, not a sentence. A sentence is helper
text wearing a disguise.

**Never hand-wire one with `TooltipTrigger asChild` onto a control that
has state.** Radix Tooltip publishes its own `data-state`, and
`asChild` merges it onto the child, overwriting `data-state="checked"`,
`="on"`, or a disclosure's `="open"`. Those attributes drive every
checked, inverted and open style we have, so the control keeps working
while silently losing its look. That is why the hint is a PROP: the
component renders the tooltip on a wrapper where the collision cannot
happen. Guard tests pin the attribute wherever a hint exists.

## Text, icons, states

- Text is `foreground`; de-emphasis is `muted-foreground`; placeholders
  and timestamps are `subtle`. All SOLID (Arabic joins double-paint
  alpha); fills/borders stay alpha.
- Errors are destructive TEXT under the field, never a red border,
  never a fill.
- Icons render through `<Icon>`; quiet icons use the `icon-quiet`
  utility. Spinners are INK: activity, not decoration.
- Motion is a tier ladder written as literal `duration-*` utilities:
  snap/0 (nav rows, menu highlights; no transition class), 75 buttons'
  colours, 100 every other colour change (the DEFAULT, write nothing;
  hover is instant on enter, no delay, and leaves at the speed it came),
  150 floating panels in and out (popover, menus, select; a filter's panel
  100), tooltip exits, collapsible closes and sidebar slides, 180
  collapsible opens, 200 tooltip ENTER, dialog, palette and scrim ENTER
  and EXIT, chips, rotations, 300 drawers and sheets. There are no
  named duration tokens for transitions on purpose; loops use
  `--duration-spin`/`--duration-pulse`.
  Where enter and exit sit on different rungs (the tooltip), so do their
  curves: entrances run `ease-out` (`--ease-out`, `cubic-bezier(0.16, 1, 0.3, 1)`,
  strong, it lands early and settles), short exits run `ease-exit`
  (`--ease-exit`, `cubic-bezier(0.4, 0, 1, 1)`: it leaves at once without
  the long dead start of `--ease-in`, which stays for drawers and rails).
  Four curves are matched to ElevenLabs: `ease-standard`
  (`cubic-bezier(0.4, 0, 0.2, 1)`) is the default for every transition
  that names none (hover, press) and the scrim; `ease-pop`
  (`cubic-bezier(0, 0, 0.2, 1)`) the tooltip enter; `ease-overlay` (CSS
  `ease`) every floating panel and dialog both ways; `ease-drawer`
  (`cubic-bezier(0.32, 0.72, 0, 1)`) collapsibles, vaul's own curve for
  sheets. Never `linear` outside loops, never a spring on chrome (`--ease-spring`
  exists for deliberate playful moments, nothing in the shell uses it).
  Floating surfaces animate opacity and transform only.
  The recipes are written once in `components/ui/overlay.ts`:
  `overlayPanelMotion` (popover, dropdown, select: a fade and a 0.95
  scale about the panel's own centre, no slide, 150 in and out on
  `ease-overlay`), `overlayScrimMotion` and
  `overlayDialogMotion` (scrim fades only, dialog and palette add a 0.95
  scale and no slide, 200 in and out, so they land and leave together).
  Tooltips open after 200ms, and a neighbour inside a `TooltipProvider`
  opens at once for 400ms after the last one closed. Every tooltip open is
  200 in on `ease-pop` from 0.75, every close 150 out on `ease-exit` to
  0.75, scaling from the trigger-facing edge with no slide, so switching
  neighbours crossfades one shrinking into its trigger while the next
  grows out of its own. Never override these at a call site: retune the
  constant. Reduced motion collapses every duration to 1ms globally.
  300 is the CEILING. The shell rail and the assistant lift both run
  there rather than at the 150 rung (at the rail's full width 150 reads
  like a snap, and the lift moves the whole workspace, so it wants the
  drawer weight). Nothing goes slower, with one exception: the
  assistant's rail <-> full morph covers two to five times the rail's
  distance, so it scales from 300 by the square root of that ratio (capped
  at 500, `morphDuration` in the assistant's `mode.ts`) on the same
  `--ease-out`, to read at the rail's pace rather than dart. The other
  exception is the Sheet's own 0.5 s eased slide (vaul's, with no
  overshoot), kept as it is for the bell, the links sheet and the Select
  tray alike. And the prompt bar opens into its card on ElevenLabs' layout
  spring (stiffness 320, damping 40, no overshoot) over 700ms, a `linear()`
  easing in `prompt-bar.tsx`: most of the move lands by 260ms and the tail
  is the settling.
- `className` is for LAYOUT only: widths, margins, grid placement.
  Colour, radius, and size come from variants and props, always.

# Token rules: read before writing any component

This file governs every use of `foundation.css`. If a rule here conflicts with
your instinct, the rule wins; the reasoning lives in `foundation.css`'s own
comments and renders live in the lookbook. (An older standalone spec page
was deleted: two sources of truth for the same content is how token
collisions happen.)

Choosing colors specifically (which token for a card, a section, a popover,
a layout) has its own short read: `COLORS.md` beside this file. The decision order
there beats hunting through this file.

The short version: **a token existing in the CSS is not permission to use it.**
Roughly half the tokens in `foundation.css` are internal plumbing. The lookup
table below is the complete list of what you may reference from a component.

---

## Lookup: I want to… → use

| I want to…                                | Use                                                                                                 | Never                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| the main action button                    | `--primary` on `--primary-foreground` (ink, the foreground inverted)                                | a STATUS-coloured button of any kind, a gray step       |
| the brand somewhere that is not an action | `--brand`, `--brand-subtle`, `--brand-subtle-foreground`, sparingly                                 | raw brand steps for small text; a second primary        |
| a secondary button                        | transparent + the `--btn-*` ladder                                                                  | `--secondary` (that's a text colour)                    |
| a **destructive** action                  | the `destructive` Button variant (red OUTLINE via `--btn-destructive`), inside a confirmation modal | a red FILL of any kind                                  |
| body text                                 | `--foreground`                                                                                      | `--ink` directly                                        |
| de-emphasised text a user must still read | `--secondary`                                                                                       | `--subtle`                                              |
| placeholder / timestamp / redundant label | `--subtle`                                                                                          | anywhere task-critical                                  |
| a quiet fill (icon well, skeleton, chip)  | `--muted`                                                                                           | as a text colour                                        |
| a divider                                 | `--border`                                                                                          | -                                                       |
| an input outline                          | `--input`, `--input-border-hover`                                                                   | -                                                       |
| a page card (form, settings group, tile)  | `--shadow-card` (its first layer is the hairline: no border); parts pad 24px, 16px on a phone       | a border beside the shadow, padding on the card itself  |
| a box, tile or row inside a card          | `--shadow-none` + `--border`, `rounded-xl`; a recessed block is `--surface-whisper`                 | a second shadow, `--shadow-raised`                      |
| a list row                                | `--shadow-none` + `--border`                                                                        | `--shadow-raised`                                       |
| hover lift, drag                          | `--shadow-raised`                                                                                   | -                                                       |
| a dropdown, popover                       | `--shadow-popover-sm` + `--popover` (`--shadow-overlay` is the composed variant)                    | -                                                       |
| a tooltip                                 | the ink chip: `--primary` + `--primary-foreground` + `--shadow-popover-sm`, text only               | a frosted panel, a target inside it                     |
| a dialog, sheet, command palette          | `--shadow-modal`                                                                                    | -                                                       |
| an error message / a failed chip          | `--destructive`, `--destructive-subtle` (a chip is `Badge tone="critical"`)                         | on a button                                             |
| a success, warning or attention banner    | `--success-subtle`, `--warning-subtle`, `--attention-subtle` (status fills) + `--foreground`        | as button fills                                         |
| an impersonation warning strip            | `--impersonation` + `--impersonation-foreground`, saturated amber and dark ink in both scopes       | general statuses or button fills                        |
| a status chip                             | `Badge tone`: the tone's `-subtle` fill, its text step, a dot                                       | `Badge variant` for a status, any ink fill              |
| a status note about a record              | `StatusNote tone`: the same fill as a centred sentence                                              | a chip with call-site padding                           |
| a status icon on a card                   | the tone's `-glyph` step (`text-warning-glyph`, `fill-success-glyph`)                               | the 700 text step, `icon-quiet`, `bg-*-glyph`           |
| to lift an element above its siblings     | `--z-raised`                                                                                        | a literal `z-index`                                     |
| a portal (modal, toast, tooltip)          | a named `--z-*` layer                                                                               | a literal `z-index`                                     |
| quiet helper/meta text                    | `text-caption-quiet` (400) with `--subtle`                                                          | `text-caption` (500: chips, labels that hold their own) |
| help under a field, a card's description  | `text-caption-quiet` / `text-body-quiet` with `text-muted-foreground` (`--secondary`: it is read)   | `--subtle` (3.4:1 on a card)                            |
| type in prose                             | `--text-{role}` shorthand                                                                           | -                                                       |
| type containing numerals                  | the four `--text-{role}-*` longhands                                                                | the shorthand                                           |
| any spacing                               | `--space-{n}`                                                                                       | an arbitrary value                                      |
| any radius                                | `--radius-{name}`                                                                                   | an arbitrary value                                      |

---

## The logo is not the palette

The mark has its own three colours, and only one of them is also a product
token:

| token          | value              | what it is                                                    |
| -------------- | ------------------ | ------------------------------------------------------------- |
| `--logo-teal`  | `var(--brand-500)` | the mark's fill; the ramp step it was drawn in                |
| `--logo-ink`   | `#151e28`          | the guidelines' navy; the mark on a page that wants no colour |
| `--logo-paper` | `#ffffff`          | the mark on a brand or dark ground                            |

**Nothing outside the mark reads these.** The ink is deliberately not
`--foreground`: the mark is a fixed artefact that has to hold on a business
card and on a partner's site, so it carries its literal instead of drifting
with a theme retune. `--logo-teal` reads the brand ramp because the ramp IS
the brand's authored values, so the two cannot drift.

The logotype is drawn letterforms, not a font: there is no `--font-logo-*`
and nothing to load. If a wordmark ever appears as live text in a display
face, it is the wrong logo.

Rendering the mark: use `SirdabMark` / `SirdabLogo` from `@sirdab/one/brand`
rather than an `<img>`. `tone="brand" | "ink" | "paper"` picks the colour
(ink flips to paper in dark, via `.sirdab-mark[data-tone]` in
foundation.css); `script="bilingual" | "latin" | "arabic"` picks the
logotype. Static assets (favicons, app icons) should be exported from the
same outlines so the two agree.

## Forbidden, with the reason

### 1. No STATUS-coloured action buttons

There is no red button, no green button, no amber button in this system.
Status ramps **report**; they never **command**. The primary fill commands and never reports. It defaults to ink; a product
may adopt a brand primary only under the ruling described in COLORS.md.

```jsx
// WRONG
<button className="bg-destructive text-destructive-foreground">Delete</button>

// RIGHT: friction comes from the modal and the verb, not the colour
<ConfirmModal
  title="Delete this store?"
  body="This removes 412 products and cannot be undone."
  confirmLabel="Delete store"        // never "Confirm" / "Yes" / "OK"
/>                                    // confirm button renders --primary
```

`--destructive` never paints as a FILL, in either theme. Red appears in
error text and in one exception: "Delete Account"-grade actions get a red OUTLINE
(`--btn-destructive` border/text, translucent red washes on hover/active).
That is the `destructive` Button variant, reserved for catastrophic
confirmations only, and it is still never a red fill.

### 2. Never reference internal tokens

`--ramp-*`, `--darken-*`, `--lighten-*` are marked `@internal` in the CSS.
`--darken-*`/`--lighten-*` do **not** flip with the theme, and using one
directly produces black-on-black inside a `.dark` scope.

```css
/* WRONG */
border-color: var(--darken-150);
/* RIGHT */
border-color: var(--border);
```

### 3. Never use the `font:` shorthand where numerals appear

It resets `font-variant-numeric` and `font-feature-settings`, silently killing
tabular figures. On an ecommerce product that means misaligned price columns.

```css
/* WRONG */
.price {
  font: var(--text-body);
  font-variant-numeric: tabular-nums;
}

/* RIGHT */
.price {
  font-size: var(--text-body-size);
  line-height: var(--text-body-leading);
  font-weight: var(--text-body-weight);
  letter-spacing: var(--text-body-tracking);
  font-variant-numeric: tabular-nums;
}
```

### 4. Never write an arbitrary value

`p-[13px]`, `rounded-[10px]`, `mt-[6px]`, `text-[15px]`: all forbidden, all
caught by the lint. Every stray spacing value looks reasonable in
isolation.

### 5. Never write a literal `z-index`

Two cases only: local lift (`--z-raised`) or a portal (a named layer).
App content sits inside `.app-root { isolation: isolate }`, so nothing inside
can compete with a portal regardless of number.

### 6. Never render a number without `numerals.ts`

Western digits are the default for every number in every locale. The
helpers differ in shape: `formatValue` / `formatPrice` for things the
user reads (the locale keeps its grouping, percent sign and words);
`formatIdentifier` for anything matched outside the app (order IDs, SKUs,
tracking, phone, IBAN, OTP), the raw string bidi-isolated. A direct `Intl`
call (a date, a relative time, a picker's clock) takes `westernLocale(tag)`
or `numberingSystem: "latn"`: ar-SA and bare "ar" default to Arabic-Indic
in most engines, so an unpinned formatter is how one creeps back.

```ts
formatPrice(124950); // ⃁ 1,249.50 (minor units in, always; ar-SA-u-nu-latn)
formatPrice(124950, { locale: "en" }); // ⃁ 1,249.50
formatValue(0.184, "ar-SA", { style: "percent" }); // 18٪
westernLocale("ar-SA"); // "ar-SA-u-nu-latn", for a direct Intl call
formatMinor(124950); // 1249.50, for CSV cells and payloads a machine parses
toMinor("٤٩.50"); // 4950, a typed price back to halalas; null when it is not a price
formatField("orderId", 249107); // 249107, never localised
```

`formatPrice` lives in `src/money.ts`; its behavior is covered directly by
`src/tests/numerals.test.ts`. The riyal sign is applied by hand, U+20C1 to the
left with a space in both directions, because Intl still returns ر.س or SAR
for `currency: "SAR"`.

The default is `numerals: "western"`. Existing consumers can explicitly request
`numerals: "localised"` for Arabic-Indic prices. Input normalization accepts
both Arabic-Indic and Persian/Urdu digits. A consumer's direct Intl calls or
ICU plural formatting must opt into Western digits separately; importing
foundation does not rewrite messages.

### 7. Contrast is tuned by eye, not by WCAG

Contrast in this system is tuned to our own visual standard, not to AA.
Several of our text and border tokens sit below WCAG AA: `--secondary`
(gray-600, ~4.6:1 on white), `--subtle` (gray-500, ~3.4:1) and the input
borders. That is deliberate, not a bug. Do not raise a token to hit AA;
that "fix" trades the look we chose for a number. The primary button is
the one place contrast is generous by construction: ink on white is
19.2:1, which is also why it is ink and not gray-900 (13.6:1 reads gray).

If a specific surface genuinely needs more contrast, that is a per-surface
product decision, made deliberately, not a global token change.

---

## Component patterns

Tokens set values; these set shape. A build can use every token correctly and
still look wrong, because the default component compositions in shadcn (and in
most generators) are roomier and more boxed than dense tooling.

### Nav items are not cards

Carried by text colour plus a faint shared fill. The states:

| State  | Background               | Text + icon                          |
| ------ | ------------------------ | ------------------------------------ |
| rest   | transparent              | `--secondary` (dimmed until touched) |
| hover  | `--gray-alpha-100` (~4%) | `--foreground`                       |
| active | `--gray-alpha-100` (~4%) | `--foreground`                       |

Hover and active use the SAME fill. There is no louder active state; what
changes is the text lighting up to `--foreground`.

```jsx
<a className="text-body text-muted-foreground hover:bg-gray-alpha-100 aria-[current=page]:bg-gray-alpha-100 flex h-8 items-center gap-2 rounded-md px-2 hover:text-foreground aria-[current=page]:text-foreground">
  <Icon className="size-5" /> {/* currentColor: no separate icon colour */}
</a>
```

The mistake to avoid: using `--accent` (an 8-9% fill) instead of
`--gray-alpha-100` (~4%), or leaving rest text at `--foreground` instead of
dimming to `--secondary`. It should read as a list that quietly resolves, not
controls switching on.

### Secondary / ghost buttons step their border AND fill together

The secondary button is not a static outline. Background and border both
deepen on interaction, one alpha rung each, animated over 100ms:

| State         | Fill                               | Border                           |
| ------------- | ---------------------------------- | -------------------------------- |
| rest          | transparent (on `--background`)    | `--btn-border` (alpha-200)       |
| hover         | `--btn-surface-hover` (alpha-50)   | `--btn-border-hover` (alpha-300) |
| active / open | `--btn-surface-active` (alpha-100) | `--btn-border-hover` (alpha-300) |
| disabled      | `--background`                     | `--btn-border`, text `--subtle`  |

The primary button does NOT use this. It is the solid ink fill (`--primary`).
This ladder is for secondary/ghost/toggle buttons only.

### Inputs: the wrapper owns the chrome

Our inputs are COMPOSITE: an outer wrapper carries the border, radius and
focus state; the `<input>` inside is stripped completely bare (`border-0
ring-0 focus-visible:ring-0`). This is what lets a leading icon, the field,
and a trailing button share one bordered box.

| State        | Border                                | Notes                                               |
| ------------ | ------------------------------------- | --------------------------------------------------- |
| rest         | `--input` (alpha-200)                 | `bg-transparent`, no shadow                         |
| hover        | `--input-border-hover` (alpha-400)    | a bigger jump than buttons, which stop at alpha-300 |
| focus-within | `--foreground` (ink) + 0.5px ink ring | ~1.5px of ink total, flush, NOT the offset outline  |
| disabled     | unchanged                             | `opacity-50`, `cursor-not-allowed`                  |

Placeholder and the leading icon are `--subtle`; the icon goes to
`--foreground` on `focus-within`, so the field lights up as a unit.

Textarea, the form Select and the Combobox trigger wear the SAME chrome,
read from one place (`packages/ui/src/components/ui/field-chrome.ts`):
one corner (12px at 40 and 44, 10px at 36 and below), one border and
hover, one ink focus, one value type. A form row never disagrees with
itself.

### Three button variants, not one

| Variant          | Border         | Rest                   | Hover                                        | Active / open                            |
| ---------------- | -------------- | ---------------------- | -------------------------------------------- | ---------------------------------------- |
| primary          | none           | `--primary` (ink fill) | `--primary-hover`                            | `--primary-active`                       |
| secondary        | yes            | transparent            | `--btn-surface-hover` + `--btn-border-hover` | `--btn-surface-active`                   |
| **ghost / icon** | **none, ever** | transparent            | `--btn-ghost-surface-hover` (alpha-100)      | `--btn-ghost-surface-active` (alpha-200) |

Ghost is for icon-only actions: toolbar buttons, the trailing button inside
an input. It never gets a border at any state, and its fill steps are one rung
deeper than the secondary button's.

### Tables: a band, a divider, and a pill floating inside

A table is semantically a `<table>` and doctrinally a LIST OF ROWS you can
act on. Both halves matter: the markup is a real table so columns align and
screen readers get row/column context, while the paint makes each row look
like its own clickable object.

The unit is the **band**: a 52px row (`--row-height`) with 6px of air above
and below, closed by a hairline at the band's edge. Hover fills the inner
52px as a 12px **pill**, so the fill floats inside the band and never
touches the divider.

|                | Value                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| row height     | `--row-height` (52px), inside a 64px band (`my-1.5`)                                                                         |
| row hover      | `--row-surface-hover` (alpha-50): the quietest fill in the system, **interactive rows only**                                 |
| row selected   | `--row-surface-selected` (alpha-100) on a ticked row, `--row-surface-selected-hover` (alpha-150) under the pointer           |
| row radius     | 12px on the pill: one per row, inset from the dividers, not edge to edge                                                     |
| row divider    | `--row-divider` (alpha-100) under EVERY row, including the last                                                              |
| header divider | the same `--row-divider`                                                                                                     |
| column gutter  | `px-2`, `md:px-4`; the outer edges give it back so the row starts flush (the outer cells a phone shows, when it hides cells) |

**Dividers on every row**, not header-only. In theory a line under each row
reads as a ledger; in practice a line under every row reads better at this
rhythm:
52px rows of long text need the line to track across. The last row keeps its
divider, which is what closes the list.

The mechanics are load-bearing, so don't "simplify" them. A `<tr>` cannot
round or clip a background and preflight's `border-collapse` refuses
`border-radius` outright, so the table resets to `border-separate` with zero
spacing, each CELL carries the divider on its own box at `p-0` (that is what
lets the line run edge to edge), and an inner band div owns the height and
the gutter and paints the fill. The bands touch, so their fills read as one
pill; its outer corners are the first and last cell a row shows (read off the
visible cells, so they survive RTL and a phone that hides the cells at an
end). Nothing hangs off the `<tr>`: a pseudo-element or an absolutely
positioned child there is wrapped in an anonymous cell and shifts the body
off its header. Hover and selected are read by the bands off the row's flags.

A row that only displays gets no pointer and no hover fill. A highlight on a
dead row is a lie. Rows that open something take `interactive` plus a
`TableRowLink`, which stretches an inset `::after` across the row: one big
target that is still a real link, so cmd-click and the screen reader's link
list keep working. Anything else clickable goes in `TableRowActions`, which
lifts above that overlay.

Number columns hug the PHYSICAL right in both directions (`numeric` on the
head and the cell). Place value is what alignment is for, and a number reads
left to right whatever the page does. Align by the logical end in Arabic and
the decimals stagger down the column, measured up to 12px apart, which is
the exact drift tabular figures exist to kill.

### Two shadow variants: contact vs ambient

One curve, two spread settings, and picking the wrong one is the difference
between "sitting on the page" and "floating above it".

| Variant | Spread | Use                                             | Token                 |
| ------- | ------ | ----------------------------------------------- | --------------------- |
| contact | `-y/2` | things RESTING on the surface: card hover, drag | `--shadow-raised`     |
| ambient | `0`    | things FLOATING: popovers, menus, tooltips      | `--shadow-popover-sm` |

Never hand-write either. Compose from `--shadow-l*` (contact) or
`--shadow-a*` (ambient), or just use the named level.

**The page card has its own shadow**, `--shadow-card`: soft and wide rather
than dark and tight, deeper than `--shadow-raised` and never floating like a
panel. Its first layer is a 1px 6% ring, the card's hairline, which is why a
card wearing it drops its border. It goes on the page-level card once (a
form, a settings group, a detail section, a stat tile) and on nothing inside
one: boxes, tiles and rows in a card are `border-border` hairlines. In a
`.dark` scope it computes to the white-alpha ring alone.

**Inside a `.dark` scope there are no shadows.** Dark paints zero
elevation shadows, so the four elevation utilities (raised, overlay,
modal, modal-lg) compute to `none` in
dark and the surface tones carry elevation alone. The one survivor is
`--shadow-popover-sm`'s hairline ring, and that is a border-construct,
not elevation: dark swaps the 6% black ring for a white-alpha one.

### Popovers are frosted, modals are solid

Floating surfaces default to **frosted glass**: 90% opacity
(`--popover-surface`) over an 8px blurred backdrop, so what is behind shows
through faintly. Popovers keep it; modals deliberately override back to solid.
Apply the opacity and the blur **together**: 90% without `backdrop-filter`
just looks washed out.

`--shadow-overlay` is the layer-COMPOSED form of the popover shadow,
superseded in components by `--shadow-popover-sm` (the verbatim
computed form, which also keeps a white hairline ring in dark where
`--shadow-overlay` computes to none; always reach for `popover-sm`).
In light the two compute byte-identical. A popover therefore needs **no
border**: the shadow's first layer IS the hairline.

Entrance is fast and small: 100ms, fade from 0, scale from 95%, an 8px slide
from the trigger side. Radius is 20px (`--popover-radius`,
`rounded-popover`) for dialog-tier popovers and 24px (`--radius-modal`,
`rounded-modal`) for modals, larger than anything else in the system.
Popover padding is 16px, modal 24px.

### Missing component → shadcn first (global rule)

Any component the system does not have comes from shadcn, never a
hand-build. This applies to every agent and every human doing design work
in the repo. Use the shadcn MCP server when available, otherwise
`pnpm dlx shadcn@latest add <component>`. shadcn supplies structure and
behaviour; values come from our tokens, never the other way around.

Components that started as shadcn are trued in their own files
(`@sirdab/one`): select, combobox, switch, checkbox, tabs and tooltip carry
their decisions in their header comments and tests, and the bridge holds
no rule for them. A component newly taken from shadcn stays stock until
that truing: do not hand-style it at the call site. Install it and let
`src/shadcn-bridge.css` map it onto our tokens.

Where shadcn's default composition is wrong for us (density, the coloured
`destructive` variant), the bridge corrects it. If a shadcn component looks off
after the bridge, fix it IN the bridge so every instance benefits, never with
one-off classes at the call site.

### Modals ring; they don't (only) border

Dialogs are separated by a **ring** plus a soft shadow. They portal to
`<body>`, outside every `.dark` scope, so a dialog is always light:

|            | Dialog                                                            |
| ---------- | ----------------------------------------------------------------- |
| fill       | `--surface-flat` (the page's white)                               |
| separation | `--shadow-modal` (its 1px 6% layer IS the hairline)               |
| radius     | 24px, every size (stock shadcn squares corners below-sm; patched) |

A ring is `box-shadow: 0 0 0 Npx <color>`. It sits OUTSIDE the element
without affecting layout, unlike a border. (Under the landing's night
toggle a modal sits at ink with the scrim behind it; a lighter `#454545`
modal was tried once and dropped; do not reintroduce it.)

NOTE: the modal shadow family is settled [2026-07-27]. `--shadow-modal`
is the dialog shadow verbatim, pinned computed, both themes, and
`--shadow-modal-lg` is its extended sibling for sheets and command
palettes (the full ladder plus an extra `0 10px 20px 1px` layer). One
caveat: alphas are tuned per shadow, not per layer, so both modal tokens
are stored verbatim, never recomposed from `--shadow-l*`.

### Borders separate; they do not decorate

`--border` is the most-painted token in the system, almost entirely
as dividers and container edges. If a border is not separating two things that
would otherwise run together, delete it.

### Page title outranks everything on the page

A dashboard where the stat numbers are larger than the page title has an
inverted hierarchy. Title is `--text-heading-md` (35px); stat values sit at
`--text-heading-sm` (24px) or `--text-heading-xs` (18px) and get their weight
from being the only bold thing in the card.

### Density defaults

| Element               | Use                                                                | Not                    |
| --------------------- | ------------------------------------------------------------------ | ---------------------- |
| primary action button | `--control-md` 32px (everything else lives at `--control-xl` 40px) | shadcn's 40px          |
| text input            | `--control-xl` 40px default (`size="sm"` = 32px for dense rows)    | shadcn's 36px          |
| nav item              | 32px, borderless                                                   | a bordered 44px card   |
| card padding          | on the parts: 24px from sm, 16px on a phone                        | padding on the card    |
| table row             | `--row-height` 52px (rows are data, not controls)                  | shadcn's `h-12` (48px) |
| body text             | `--text-body` 14px                                                 | 16px                   |
| gap between nav items | `--space-2` or `--space-4`                                         | `--space-8`+           |

Type tiers are MUTUALLY EXCLUSIVE per surface: app pages stop at
`heading-md` (35px); the display tier (32/36/48px) is marketing-only.
Mixing them puts three different jobs within 4px on one page.

`src/shadcn-bridge.css` applies all of the above to shadcn's own class names.
Import it after `foundation.css`. It also fixes the token NAME COLLISIONS
that otherwise silently mis-colour every secondary button and every piece of
de-emphasised text.

---

### Reversed decisions

Decisions we wrote down and then reversed. They are recorded so nobody
reads an old comment, screenshot or branch and "fixes" the code back.

- **The 10px select.** A form select was a Button with a 10px corner,
  "one step calmer than a button". Beside the Input it disagreed about
  hover, focus, corner and value size. A form select is now a FIELD in the
  Input's chrome (12px at 40 and 44); toolbar triggers keep Button's.
- **A switch has no hover.** "A switch answers to the press, not the
  pointer" left the off track one shade from the dimmed disabled switch.
  The off track is now alpha-300 and deepens one rung to alpha-350 on a
  mouse; a checked switch never shifts. With it went `size="sm"`, which no
  screen used, and the rule that a switch applies immediately: it is a
  state of the thing and may save with its form.
- **Tabs never float a thumb.** The segmented Tabs variant was a solid
  gray-75 track with a bordered white tab, "never a floating thumb". It
  now reads the Segmented control's recipe (a 4% wash track, a white thumb
  with the contact shadow, 40 high and 44 on touch, 12px track and 8px
  items), placed on the active tab instead of slid.
- **Cards rest flat.** A card was white plus a hairline with no shadow, and
  only the editor card lifted. Two doctrines on one screen read as two apps
  (a customer page with a shadowed card beside a flat one). Every page-level
  card now wears `--shadow-card` and everything inside it is a hairline;
  `variant="outline"` keeps the flat card for the few places that need it.
  The ink bar before a raised card's title is gone from every card: it was the
  one ink mark that commanded nothing (COLORS.md, "Ink commands").
- **Tooltips are not frosted.** The stacking rule listed them among the
  frosted popovers. The shipped chip is ink, and the rules now say so.

## Tailwind translation (in an app)

`src/tailwind.css` maps the tokens into Tailwind v4 utility namespaces and
wipes the stock palette and type scale: `bg-red-500` and `text-sm` do not
compile. In markup:

| System rule            | In markup                                                                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| semantic colours       | `bg-primary`, `text-muted-foreground` (= `--secondary`), `text-subtle`, `bg-muted`, `border-border`, `bg-surface-overlay`…                                                                                                                                 |
| the identity, directly | `bg-brand`, `text-brand`, `bg-brand-subtle`, `text-brand-subtle-foreground` and the brand ramp are available. The default action stays `bg-primary`, ink, unless the product has explicitly ruled otherwise (COLORS.md).                                   |
| component ladders      | `border-btn-border`, `hover:bg-btn-surface-hover`, `active:bg-btn-surface-active`, `hover:bg-btn-ghost-surface-hover`, `border-input`, `hover:border-input-border-hover`, `bg-row-surface-hover`, `border-row-divider`, the `icon-quiet` opacity utilities |
| alpha ramp (public)    | `bg-gray-alpha-100` etc.                                                                                                                                                                                                                                   |
| type roles             | `text-badge` (8px: a count in a badge's circle only), `text-caption`, `text-label`, `text-body`, `text-body-quiet`, `text-body-lg`, `text-heading-xs/sm/md`, `text-display-sm/md/lg`                                                                       |
| control heights        | `h-control-xs/sm`, `h-control` (32px), `h-control-lg/xl`, `h-control-touch`, `h-row` (52px)                                                                                                                                                                |
| z layers               | `z-raised`, `z-dropdown`, `z-sticky`, `z-overlay`, `z-modal`, `z-popover`, `z-toast`, `z-tooltip`                                                                                                                                                          |
| shadows                | `shadow-none`, `shadow-card`, `shadow-raised`, `shadow-overlay`, `shadow-popover-sm`, `shadow-modal`                                                                                                                                                       |
| radius                 | `rounded-xs/sm/md/lg/xl/2xl/popover/shell/palette-item/full` (`lg` = 10px default, `popover` = 20px, `shell` = 20px, the app shell's page card only, `palette-item` = 14px, the command palette's row only)                                                |
| input focus            | `focus-within:ring-input-focus` (0.5px ink ring)                                                                                                                                                                                                           |

**Spacing: READ THIS TWICE.** Two scales share numbers and mean different
things. Tailwind's numeric utilities run the stock 4px multiplier: `p-8` is
**32px**. Foundation's `--space-8` is **8px**. The "any spacing → `--space-{n}`"
rule applies to RAW CSS only; in markup you use Tailwind's numerics,
constrained to the steps that land on the foundation scale:
`0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 12, 16, 24` (= 2, 4, 6, 8, 10, 12, 16, 24,
32, 48, 64, 96px). If you catch yourself writing `p-8` "because the token is
space-8", stop: you want `p-2`. Anything off the step list is a violation,
arbitrary or not.

---

## Before you commit

```bash
pnpm nx run ui:lint:tokens              # arbitrary values, internal tokens, literal z-index
```

Adding a token is a design decision, not an implementation detail. If a
component seems to need one that doesn't exist, that is a conversation, not a
new line in `foundation.css`.
