# Empty state notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/empty-state.tsx`'s header
comment.

## Doctrine

The icon sits in a WELL: `size-10 rounded-full bg-muted`, the documented
quiet fill for wells (TOKENS.md lookup). The message is `body-quiet` in
the muted tone; the optional caption drops to `caption-quiet` in
`--subtle` and says what WILL appear here rather than what is missing.
The icon is decorative (`<Icon>` is aria-hidden by default); the title
carries the meaning.

Idle vs no-results phrasing belongs to the caller: an invitation ("Find
anything in Alnoor Store") is not a result ("No matches"). The component
owns only the shape.

## Sizes

`default` is the whisper above, for a state inside something else (a
popover, a list, a card). `size="lg"` is for a state that IS the surface,
a whole panel with nothing else in it (the assistant for an account with
no store): the message rises to `heading-xs` in the foreground, the
caption to `body` in the muted tone, the well to `size-12`. Pick by what
surrounds the state, never to make one louder than its neighbours.

## Usage

The hosting surface owns padding and borders; `className` is layout
only. `action` takes one house Button, never a row of them.

```tsx
import { EmptyState } from "@sirdab/one/components/ui/empty-state";

<EmptyState
  icon={Bell}
  title="You are all caught up"
  caption="Orders, payouts and stock alerts land here."
/>;
```
