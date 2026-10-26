# Breakpoints notes

Not rendered. The gallery page shows; this file explains. The values
stay canonical in `packages/foundation/src/foundation.css` (`--screen-*`)
and `packages/foundation/src/tailwind.css` (`--breakpoint-*`).

## Doctrine

Eight steps. sm through 2xl and the whole container scale are Tailwind's
defaults, inherited untouched; we add three of our own at the edges: 2xs
(375, the phone floor), xs (480), and 3xl (1920, standard FHD).

Two traps the scale avoids: a one-off `.container` cap (1758px, say)
with no `--screen-*` behind it is not a ninth breakpoint. And 3xl is
1920 (standard FHD), not 1980.

The custom breakpoints are declared in rem in tailwind.css because v4's
breakpoint sorting is only reliable when every breakpoint shares one
unit, and Tailwind's defaults are rem. The px mirrors (`--screen-*`)
live in foundation.css for anything that needs a literal value; the two
lists must stay in lockstep.

Containers are the `max-w-*` reading-width stops (384–1280), not layout
breakpoints: a settings form capped at `max-w-2xl` stays 672px on every
screen.

## Usage

```tsx
// Responsive variants, smallest-first:
<div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3">…</div>

// Reading-width cap:
<form className="max-w-2xl">…</form>
```

Media queries cannot read custom properties, so use the responsive
variants (`md:`, `3xl:`), never `var(--screen-md)` in a query.
