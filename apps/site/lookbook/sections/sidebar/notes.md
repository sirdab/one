# Sidebar notes

Not rendered. The gallery page shows; this file explains. Component
usage stays canonical in `components/ui/sidebar.tsx`'s header comment.

## Doctrine

The shell's rail, and the ONE tinted structural surface in the system
(`bg-surface-rail`, solid `gray-50` in light). Everything else is white
at rest. Docked only: as the mobile drawer the same sidebar returns to
plain background like every other floating layer.

Widths come from the shell frame tokens, not per-instance style vars:
256px expanded, 60px collapsed to icons. The shell has one rail
geometry and it lives in foundation.

The nav-row recipe: hover and current are the SAME gray-alpha rung.
Current adds ink text and nothing else, no bar, no bolder weight, no
louder fill. Rows carry no transition; they snap.

Motion is 300ms, the drawer rung, not the ladder's 150ms sidebar slide:
at this rail width 150 reads like a snap. The label fade must stay on
the same duration as the width slide or the two desync visibly.

## Collapsing

`collapsible="icon"` is the user toggle: the rail narrows to its icon
axis and labels fade out. `collapsible="offcanvas"` slides the whole
rail away, for a workspace that wants the full width (the studio
builder). `collapsible="none"` is a flat rail that never moves.

An offcanvas rail that is collapsed is `inert`: the translate takes it
off screen and off nothing else, so without that Tab walked into a nav
nobody could see. `peek` brings it back as a floating panel: the
container slides in over the page with the popover shadow, at the 200
rung, while the gap stays at zero so the page never reflows. The host
decides when to peek (the studio uses a 6px hot strip and a dwell
timer); the primitive only draws the state. Row tooltips are the icon
rail's: an offcanvas rail keeps its labels whenever it is on screen, so
peeked it shows none.

Tooltips on the rows appear only when collapsed, since that is the only
state where the label is gone, and they open INSTANTLY rather than at the
house 300ms: collapsed, the tooltip IS the label, so a delay reads as the
rail withholding the answer rather than as restraint.

That zero delay is scoped to the nav cluster, on `SidebarMenu`. It is
deliberately NOT on `SidebarProvider`, which is where stock shadcn puts
it: our Tooltip defers to any ancestor provider, so a provider that high
silently re-tunes every hint in the host's shell, and you end up with a
topbar where half the buttons fire instantly and half wait.

## Grouping

`SidebarGroupLabel` is how a second group says what it is. It is set in the
same type as the rows it introduces (`text-body`, same weight, same
`--muted-foreground`), not in a smaller caption: a rail is one column of
type, and a heading two steps down from its own rows reads as a caption that
fell in. Position and the missing icon are what separate it.

Use it, not a border: a rule reads as the list being cut in half, and what you almost
always have is one list with a differently-named thing after it. Collapsed, the label
fades and slides a hair along the rail's axis, exactly like every row label,
and its box does not move: there is nothing to read in a 60px rail, but the
SEPARATION has to stay or the icon column reads as one undivided list. Nothing
in the rail changes height on collapse: the width closes and the words go with
it, and that is the whole movement.

Once a rail has more than one group, put `gap-0` on `SidebarContent` and
`pt-0` on the second group. Every group already carries `p-3`, so the stock
`gap-2` is a third helping of the same space: left alone the heading floats
32px below the last row and the rail reads as having ended. One group's
`pb-3` is the whole seam, and 12px is what a heading wants.

A demo card that mounts a rail needs `transform-gpu` as well as
`overflow-hidden`. The primitive positions the visible rail `fixed`, and a
fixed element's containing block is the viewport until an ancestor with a
transform claims it: without the transform the card clips nothing and the
rail paints down the page over the lookbook's own nav. The studio shell
does the same on its workspace card. `tests/containing-block.test.ts`
reads the page source and fails the moment a card forgets.

## Usage

Compose the shell from `SidebarProvider > Sidebar` plus the host's own
`<main>`. `SidebarTrigger` goes in the host topbar, not the rail.

Only the parts the shell uses are carried. Stock shadcn's group actions,
badges, sub-menus, inset and rail are deliberately absent; take one from
shadcn and true it the day a screen needs it.

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@sirdab/one/components/ui/sidebar";
```
