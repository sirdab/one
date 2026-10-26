# Sirdab One

React components and semantic design tokens with light, dark and system themes,
Arabic typography and RTL behavior. Alpha package: `@sirdab/one@0.1.0-alpha.0`.

```tsx
import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css"; // Optional if you already load the font families.
import { OneProvider } from "@sirdab/one/provider";
import { Button } from "@sirdab/one/components/button";

export function App() {
  return (
    <OneProvider dir="rtl" defaultTheme="system">
      <Button>حفظ</Button>
    </OneProvider>
  );
}
```

The host sets `<html lang="ar" dir="rtl">` for an Arabic page. `dir` supplies
Radix context, including portals; it does not modify the document language or
direction. In Next.js, put the styles in the root layout, add
`suppressHydrationWarning` to `<html>` for the theme class, and render
`OneProvider` around the page content. No Next.js dependency or Tailwind setup
is required to consume the components.

`OneProvider` accepts `children`, `dir?: "ltr" | "rtl"`,
`defaultTheme?: "light" | "dark" | "system"`, and `nonce?: string` for the
theme bootstrap script. Defaults are LTR and light. The provider combines the
theme, Radix direction and shared tooltip contexts. A host using `system` opts
into the OS preference. The theme switch can use `useTheme` from `next-themes`.

React and React DOM require `^19.2.4`; this alpha is tested with `19.2.4`.
The published package is ESM with declarations. Interactive modules retain
`"use client"`; `@sirdab/one/components/button-variants` remains callable from a
React Server Component. Use component subpaths to keep charts, editors and
phone assets out of unrelated dependency graphs. The root exports components
and `OneProvider`; `/theme-provider`, `/foundation`, `/components/<name>`,
`/icons/<name>`, `/hooks/<name>` and `/lib/<name>` are also available.

## Styles and assets

`styles.css` is the complete precompiled stylesheet: Tailwind reset, foundation
bridge, foundation values and utilities discovered in component source. Its
source order preserves the existing token and interaction design. It does not
need a host Tailwind scan. `tailwind.css` is optional integration for hosts that
use Tailwind v4 for their own layouts: import it after `tailwindcss` and
`@sirdab/one/styles.css` to map host utilities to the same tokens. It contains
the animation definitions inline, so hosts do not install `tw-animate-css`.

Fonts and country flags ship inside `dist/assets`. Riyal font URLs are relative
to `styles.css`. Optional `fonts.css` includes Inter and IBM Plex Sans Arabic,
normal weights 400 through 700, Inter's 300 display weight, and the source
packages' Unicode subsets.
The base fonts need no Google request. MoodBoard retains its existing Google
Fonts preview for model-selected typography. [FONTS.md](./FONTS.md) records
provenance and retained licenses.

Phone flags use literal `new URL("../assets/flags/xx.svg", import.meta.url)`
expressions so Next.js and Vite can emit them under the host asset base. Nothing
is copied to `/flags` or `/fonts`. There are 221 SVGs (1,458,461 source bytes).
Inlining all SVGs was rejected because it would add approximately 489 KB gzip
to the phone module. Consumers must let their bundler process those static URLs;
the release gate checks a packed package in both consumer frameworks under a
nested base path.

## Build decisions

Run `pnpm nx run one:build` from the repository root. TypeScript emits separate
ESM modules and declarations, then the package script adds explicit `.js`
extensions and resolves internal foundation references. It excludes tests and
the private Sirdab logo from published output. No monolithic root bundle is
created, and no host transpilation step is needed.

Vaul 1.1.2's already bundled ESM and declarations are copied into `dist/vendor`.
Its sole dialog import is adapted to `radix-ui.Dialog` from pinned radix-ui
1.8.1. This ensures Sheet and Dialog primitives share one context even when the
consumer has other Radix versions installed. Source tests use the same adapter.
Vaul is a build-only dependency, and its MIT text ships in `dist/licenses`.
Consumers need no pnpm override or direct `@radix-ui/react-dialog` installation.
React, Radix and other runtime dependencies stay external.

After building, `pnpm nx run one:test:package` checks the published module graph,
client directives, server-safe variants, drawer identity, CSS and packaged
assets. `pnpm nx run one:test` preserves the copied behavior suite. The parent
release workflow owns clean tarball installs, Next/Vite builds, browser checks
and CI. This alpha has not been published to npm.

MIT for Sirdab One. Third-party font, flag, animation and Vaul licenses remain
under their own terms in `licenses`, `dist/licenses` and `dist/assets/flags`.
