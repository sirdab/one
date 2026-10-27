# Sirdab One

Built on [shadcn/ui](https://ui.shadcn.com/). Brought together as One.

The design system by Sirdab. Every part works as one.

One brings the components, typography, colors and interaction patterns used in our products into a shared React package. It includes light and dark themes, Arabic and RTL support, house icons and a live lookbook.

This repository is the new home of the system. The initial alpha is being prepared for npm as `@sirdab/one`. Uqail and Sirdab's existing apps have not yet migrated to this package.

## Develop

Use Node 24 and pnpm 11:

```sh
corepack enable
pnpm install
pnpm nx run one:build
pnpm nx run site:dev
```

The site runs at `http://localhost:4200`, with documentation at `/docs` and the component lookbook at `/lookbook`.

## Package contract

```tsx
import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css";
import { Button, OneProvider } from "@sirdab/one";

export function App() {
  return (
    <OneProvider defaultTheme="system">
      <Button>Start building</Button>
    </OneProvider>
  );
}
```

The alpha targets React 19 in Next.js and Vite. Components ship compiled JavaScript, TypeScript declarations and CSS. Consuming an installed package does not require Tailwind, a Next.js transpilation setting or a copy of the package's assets. Font loading is optional: `fonts.css` supplies Inter and IBM Plex Sans Arabic, and the type tokens can be overridden for your own fonts.

For Arabic, set the document's `lang="ar"` and `dir="rtl"`, and pass `dir="rtl"` to `OneProvider`. The provider supplies direction to portalled controls; the document attributes control text and page layout. Callers supply translated component labels.

The package README documents the supported exports and installation. Check release availability before using an npm install command; development builds can be packed and installed from a local tarball.

## Repository

- `packages/one`: the public React package, foundations, assets and behavior tests.
- `apps/site`: the marketing site, documentation and interactive lookbook.
- `fixtures`: isolated consumer applications used to test the packed npm artifact.
- `scripts`: package verification and release checks.

The first extraction comes from the reviewed Sirdab UI snapshot at `d62c41344e5306d4346e5b133d9f26aab4860454`, derived from Uqail at `a3ef3b1409359fa04aae4f008d640bd489080d2f`. Changes to One belong here. Existing product implementations remain in place until their release migration is verified.

## Checks

```sh
pnpm nx run-many -t lint typecheck test build
pnpm format:check
```

Release validation also installs the packed artifact into clean Next.js and Vite applications, rather than trusting workspace resolution. See the release guide for that process and the first npm release setup.

## License

Sirdab One is MIT licensed. Bundled third-party assets retain their own licenses and attribution requirements; see `THIRD_PARTY_NOTICES.md` and `packages/one/licenses`.
