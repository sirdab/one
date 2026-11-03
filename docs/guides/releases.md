# Alpha releases and Pages setup

Releases are GitHub Releases, not npm. Each one carries the verified package tarball, and products depend on its URL. Nothing publishes on push or tag. A release is an explicit maintainer action after reviewing the package and green checks.

## Repository setup

- Keep `sirdab/one` public and `packages/one/package.json` pointed at `git+https://github.com/sirdab/one.git`. The package is `@sirdab/one`, MIT, initially `0.1.0-alpha.0`. The repository must stay public, so products and their Docker builds download release assets without a token.
- Protect `main` and require the `CI / verify` check. CI uses Node 24, pnpm 11.9.0, a frozen lockfile, Nx checks and isolated consumer smoke.
- Create a GitHub environment named `release-alpha`, restrict deployment to main and require a maintainer reviewer. (If it does not exist, the first run creates it without protection.) Optionally turn on immutable releases in repository settings. Create a `github-pages` environment restricted to main.
- In repository Settings > Pages, select GitHub Actions as the build source. Configure `one.sirdab.co` as the custom domain and set its DNS before deployment. The workflow defaults to that URL; a `SITE_URL` repository variable can override it.

`pages.yml` runs after a successful main push CI run, checks out that exact commit, builds and audits the static site using the `SITE_URL` and `SITE_BASE_PATH` repository variables, and deploys `apps/site/out`. Leave the base path empty for a custom domain root. The public domain is `https://one.sirdab.co`. [GitHub documents the Pages environment and permissions requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Cutting a release

Update the package version and changelog in a reviewed change, merge it, and wait for main CI. Optionally create a matching `vX.Y.Z-alpha.N` tag on that verified main commit. From Actions > Release alpha, run the workflow **from main**, entering either `main` or that exact tag as `release_ref`, then approve the `release-alpha` environment.

The workflow first runs a read-only validation job from trusted main, without the `release-alpha` environment or write permission. It resolves the requested ref to an immutable commit SHA and reads that commit's package manifest with `git show` as data, without checking out or executing candidate code. It rejects non-alpha refs, tags outside main history, version mismatches and commits without a completed, successful main push CI run for that exact SHA.

Only after validation succeeds can the release job request approval and `contents: write`. It checks out the verified SHA, so moving a tag or main while approval is pending cannot change the candidate. It repeats lint, typecheck, unit tests, build and packed consumer checks. Then it creates the prerelease `vX.Y.Z-alpha.N` at that SHA and attaches the tested tarball as `sirdab-one-X.Y.Z-alpha.N.tgz`, with its SHA-256 in the notes. A version that already has a release fails the run: released tarballs are never replaced, so lockfile integrity stays valid. Evidence is retained as a workflow artifact.

## Installing a release

```json
"@sirdab/one": "https://github.com/sirdab/one/releases/download/v0.1.0-alpha.0/sirdab-one-0.1.0-alpha.0.tgz"
```

pnpm and npm record the tarball's integrity in the lockfile. To upgrade, change the URL to the new version and reinstall. Semver ranges do not apply to URL dependencies.

npm can be added later by publishing the same verified tarball. Do not add a long-lived token to this workflow for it.

### Public site URL

The Pages workflow defaults to `SITE_URL=https://one.sirdab.co`. Set the GitHub repository variable `SITE_URL` only to override it. Leave `SITE_BASE_PATH` empty for a custom domain root, or set it to the URL's project path. Pages now runs the SEO export audit before uploading the site and refuses to deploy without a public URL. Configure the domain and DNS separately in GitHub Pages. See `apps/site/README.md` for metadata and indexing checks.
