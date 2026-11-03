# Changelog

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
