# Changelog

## 0.1.0-alpha.3 (unreleased)

- Identity tile tokens: `--tile-{green,purple,blue,teal,amber,rose}-{bg,fg}` in light and dark, mapped to `bg-tile-*-bg` and `text-tile-*-fg`. Transportation colours its workspace and person initials marks with them; without the tokens those marks rendered untinted.

## 0.1.0-alpha.2 (unreleased)

Fixes found moving RahafbySirdab and transportation onto One.

- Tailwind hosts: `foundation.css` and `shadcn-bridge.css` are exported. A host that runs Tailwind v4 imports them with `tailwind.css` into its own Tailwind entry and must not import `styles.css` too: `styles.css`'s precompiled utilities land after the host's and override its responsive variants (`hidden md:table-cell` stayed hidden). The migration guide shows both setups.
- Bundle size: each icon is its own module, re-exported by `icons/general`, `icons/shell`, `icons/system` and `icons/catalogue`, with `"use client"` on the icon files instead of the group barrels. Turbopack used to ship whole groups (about 28 KB gzip) for a handful of icons.
- `DirectionProvider` lives in its own module (`@sirdab/one/direction-provider`), so it no longer pulls in next-themes or the tooltip provider.
- New `ButtonBase` and `InputBase`: Button and Input without the tooltip machinery, for public pages with tight budgets.
- New `LegacyCard`, `LegacyCardHeader`, `LegacyCardTitle`, `LegacyCardDescription` and `LegacyCardContent`: the padded, bordered pre-One card contract, for markup written against `@sirdab/ui` (aliased like `LegacyBadge`).
- Table rows use `--row-height` as a minimum, so wrapped cell content grows the row instead of overlapping the next one.
- Arabic glyphs in Latin text fall back to IBM Plex Sans Arabic instead of the OS font.

## 0.1.0-alpha.1 (unreleased)

Adds the pieces the transportation (TMS) app had built in its vendored copy of the UI, so it can drop that copy and use `@sirdab/one` instead.

- New components: `page-header` (`PageHeader`), `detail-list` (`DetailList`, `DetailItem`, `FactStrip`, `FactStripItem`), `form-sheet` (`FormSheet`).
- New `date-picker` subpath with `DatePicker`, `DateRangePicker` and `DateTimePicker`. These take ISO date strings, open as a sheet on narrow screens, and support ranges. They are not in the root export, because the root `DatePicker` and `DateTimePicker` (from `date-time-picker`, which take `Date` values) keep their names.
- New `search-select` (`SearchSelect`): single or multi selection, a static option list or server search with paging, groups, disabled reasons and a create action. It is built on the new cmdk-free `listbox` primitive. The existing `Combobox` tag picker is unchanged.
- `select` exports `selectTriggerChrome` and `SelectTriggerVariant`, so custom pickers can draw triggers that match `SelectTrigger`. `sheet` exports `useInsideSheet`.
- `DirectionProvider` sets component direction for hosts that manage their own theme instead of using `OneProvider`'s.

## 0.1.0-alpha.0 (unreleased)

- Extracts the shared Sirdab design system, preserving its Uqail-derived visual language, React components, semantic foundation, Arabic/RTL behavior and light/dark/system themes.
- Defines one public package, `@sirdab/one`, with compiled JavaScript, declarations, precompiled component styles, optional fonts and `OneProvider`.
- Adds isolated Next App Router 16.2.10 and Vite consumer templates, tarball auditing, production browser smoke and package-size regression checks.
- Ships the token linter as a `one-lint-tokens` bin.
- Adds CI, GitHub Pages deployment configuration, a manual alpha release workflow that attaches the verified tarball to a GitHub Release and product migration guidance.

The alpha is not published by this change. Product migrations and production adoption are pending. Release readiness depends on the integration owner's authoritative checks and green CI.
