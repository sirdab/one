# Sirdab One site

The public marketing, documentation, and lookbook app. All component and foundation imports use public `@sirdab/one` exports. Build the package before checking or building the site. There are no workspace source aliases.

## Local work

From the repository root, use `pnpm nx run site:dev` after `pnpm nx run one:build`. The site runs on port 4200. The site is a private workspace package, not part of the npm tarball.

The app imports `@sirdab/one/styles.css` for component styles and `@sirdab/one/fonts.css` for local Inter and IBM Plex Arabic fonts. It imports the compiled optional `@sirdab/one/tailwind.css` token bindings only to compile the site's own layout and lookbook utilities. Components do not require Tailwind in consuming apps. That optional binding export is provided by the package build and automatically includes the compiled package class names in the host Tailwind pass. This keeps base utilities from overriding responsive component rules when both stylesheets are present. Consumers configure no source paths.

## Static export

`pnpm nx run site:build` writes `apps/site/out/`. For GitHub Pages project hosting, build with `SITE_BASE_PATH=/one`. Leave it empty for a domain root. The path is a build-time setting. `SITE_BASE_PATH` and `SITE_URL` are included in the Nx build cache inputs so root and project-path builds use separate cache entries. Internal navigation uses Next Link/router so the base path is applied consistently. `public/.nojekyll` is copied to the export for Pages. The Pages workflow deploys successful main-branch builds.

The app pre-renders `/`, `/docs`, `/lookbook`, all 49 `/lookbook/<section>/` routes, with Arabic as the default. English lives at `/lookbook/en/` and `/lookbook/en/<section>/`; the explicit `/lookbook/ar/` paths remain available. Unknown sections return the static 404. Language is a route segment because a static server cannot choose server component output from a query string. The theme remains a client preference. English navigation is separate from the specimen's Arabic language and direction scope.

## Review

Run `pnpm nx run site:test`, `pnpm nx run site:typecheck`, and `pnpm nx run site:lint` after the package has been built. Test imports intentionally resolve the public compiled package.

Browser review: 390px and 1440px, light/dark/system, keyboard navigation, the mobile section disclosure, search empty state, clipboard success/failure, Arabic switching on a nested section, nested light/dark specimens, overlay placement, and `/one` base-path links/assets. The inherited lookbook behavior tests remain beside their subjects. Run `SITE_BASE_PATH=/one pnpm nx run verification:lookbook` for the production browser regression covering Arabic and English dialogs, drawer edges, and locale restoration on desktop and mobile. It builds and serves the static export locally, then saves screenshots under `artifacts/lookbook/`.

Public copy distinguishes the current unpublished alpha/tarball setup from the future registry command. Source and token links point to the public GitHub project. No npm publication or hosted production URL is claimed.

The lookbook uses the public Sidebar family in a viewport-height shell, with its brand at the top of the rail and the shared site navigation beside it. Search stays above the independently scrolling navigation list, whose scrollbar is hidden. Specimens scroll inside the content pane; the marketing footer is reserved for Home and Docs. The overview offers six starting points instead of repeating the sidebar directory. Theme changes use Uqail's 500ms downward wipe, with an immediate reduced-motion fallback. Colors has a local light/dark scope independent of the site's theme. Store avatars use the packaged baked orbs.

## Search and social previews

The public domain is `https://one.sirdab.co`. To build for it locally, use `SITE_URL=https://one.sirdab.co pnpm nx run verification:seo` with `SITE_BASE_PATH` unset.

Set `SITE_URL` to the full public HTTPS URL, including the base path if there is one. For a custom domain root, leave `SITE_BASE_PATH` empty. For a project path, use matching values such as `SITE_URL=https://design.example.test/one/` and `SITE_BASE_PATH=/one`. A mismatched path fails the build. Both values are build-time settings and part of the Nx cache key.

Without `SITE_URL`, builds emit `noindex`, disallow crawling, omit canonical links, and produce an empty sitemap. They are local previews, not production SEO output. The Pages workflow defaults `SITE_URL` to `https://one.sirdab.co` and allows a repository-variable override. It reads `SITE_BASE_PATH` from repository variables too. Configure the custom domain in GitHub Pages and DNS before deploying; the URL variable does not configure hosting.

Every public page has its own title, description, canonical, Open Graph and Twitter metadata. The default lookbook URLs are canonical Arabic examples, with reciprocal English alternates. `/lookbook/ar/` aliases point to the default routes and are excluded from the sitemap. Navigation and descriptive copy are English, while specimen language is scoped separately. The home page includes WebSite structured data. The icons use the mark from `assets/sirdab-logo.svg`; `public/social-preview.png` uses the same logo, Inter, and landing-page copy.

Run `pnpm nx run verification:seo` to build and audit every exported HTML page, icon links, social metadata, language alternates, robots, and sitemap. CI checks the local preview mode; Pages checks the configured public URL before deployment. Once the domain is live, verify it in Google Search Console, submit `/sitemap.xml`, and inspect the home, docs, and an Arabic/English component pair. Search indexing can only be checked after publication.

The docs navigation follows the section at the reading line below the sticky header, including scrolling upward, direct hash links, and the final section at the page bottom. The current link uses `aria-current="location"` and the shared interaction wash.

The landing hero pairs its headline and actions with the live Arabic composition. The composition precedes individual controls in both DOM order and the mobile layout. Foundation links preview the actual brand ramp, type, spacing, and reading directions. The browser regression checks responsive bounds at 320, 390, 768, 1024, and 1440px, including longer Arabic content and the created state.
