# Alpha releases and Pages setup

Nothing in this repository setup publishes npm or migrates a product by itself. npm publication is an explicit maintainer action after reviewing the package and green checks.

## Repository setup

- Keep `sirdab/one` public and `packages/one/package.json` pointed at `git+https://github.com/sirdab/one.git`. The package is `@sirdab/one`, MIT, initially `0.1.0-alpha.0`.
- Protect `main` and require the `CI / verify` check. CI uses Node 24, pnpm 11.9.0, a frozen lockfile, Nx checks and isolated consumer smoke.
- Create a GitHub environment named `npm-alpha`, restrict deployment to main and require a maintainer reviewer. Create a `github-pages` environment restricted to main.
- In repository Settings > Pages, select GitHub Actions as the build source. Configure `one.sirdab.co` as the custom domain and set its DNS before deployment. The workflow defaults to that URL; a `SITE_URL` repository variable can override it.

`pages.yml` runs after a successful main push CI run, checks out that exact commit, builds and audits the static site using the `SITE_URL` and `SITE_BASE_PATH` repository variables, and deploys `apps/site/out`. Leave the base path empty for a custom domain root. The public domain is `https://one.sirdab.co`. [GitHub documents the Pages environment and permissions requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## First npm publication

An npm package must exist before its package settings can hold a trusted publisher. A maintainer with publish access to the `sirdab` npm organization bootstraps it locally after explicit release approval:

1. Check out the reviewed main commit, confirm CI is green and complete the ordinary frozen install/checks described in [verification](verification.md).
2. Run `pnpm nx run verification:consumers`. Inspect `artifacts/consumers/verified-package.json`, including package name, alpha version, hash and evidence directory.
3. Authenticate interactively with `npm login --registry https://registry.npmjs.org` using an authorized maintainer account with 2FA. Do not put credentials in a file, issue or workflow.
4. Publish exactly the verified artifact:

```sh
npm publish artifacts/consumers/verified-package.tgz --access public --tag alpha --registry https://registry.npmjs.org
```

Complete the registry's interactive authentication challenge. Scoped public packages need `--access public`; using `--tag alpha` keeps the prerelease off `latest`. [npm scoped package publishing](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).

The initial manual publish consumes that version permanently. The first OIDC release must use a new alpha version, reviewed on main. Do not republish `0.1.0-alpha.0` if it already exists.

## Trusted publisher

In npm's `@sirdab/one` package Settings > Trusted Publisher, choose GitHub Actions and enter:

| Field                | Value                       |
| -------------------- | --------------------------- |
| Organization or user | `sirdab`                    |
| Repository           | `one`                       |
| Workflow filename    | `release-alpha.yml`         |
| Environment          | `npm-alpha`                 |
| Allowed action       | Enable direct `npm publish` |

Use only the filename, with exact case. No npm secret is needed. The workflow uses a GitHub-hosted runner, `id-token: write`, Node 24 and npm 11.21.0. npm requires at least Node 22.14.0 and npm 11.5.1 for OIDC. New publisher configurations must complete their first successful publish within two days or be recreated. Public GitHub OIDC publications receive provenance automatically. These requirements were checked on 2026-10-26 against [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/).

## Later alpha releases

Update the package version and changelog in a reviewed change, merge it, and wait for main CI. Optionally create a matching `vX.Y.Z-alpha.N` tag on that verified main commit. From Actions > Release alpha, run the workflow **from main**, entering either `main` or that exact tag as `release_ref`, then approve the `npm-alpha` environment.

The workflow first runs a read-only validation job from trusted main, without the `npm-alpha` environment or OIDC publishing permission. It resolves the requested ref to an immutable commit SHA and reads that commit’s package manifest with `git show` as data, without checking out or executing candidate code. It rejects non-alpha refs, tags outside main history, version mismatches and commits without a completed, successful main push CI run for that exact SHA.

Only after validation succeeds can the `npm-alpha` release job request approval and publishing identity. It checks out the verified SHA, so moving a tag or main while approval is pending cannot change the candidate. It repeats lint, typecheck, unit tests, build and packed consumer checks, then publishes the tested tarball to the public registry with the `alpha` tag. It does not publish on push or tag creation. A failed check stops publication. Evidence is retained as a workflow artifact.

After the first successful OIDC release, npm's publishing-access setting can disallow token publishing while retaining 2FA and OIDC. Review npm's live requirements again when changing this workflow. Do not add a long-lived `NPM_TOKEN` fallback.

### Public site URL

The Pages workflow defaults to `SITE_URL=https://one.sirdab.co`. Set the GitHub repository variable `SITE_URL` only to override it. Leave `SITE_BASE_PATH` empty for a custom domain root, or set it to the URL's project path. Pages now runs the SEO export audit before uploading the site and refuses to deploy without a public URL. Configure the domain and DNS separately in GitHub Pages. See `apps/site/README.md` for metadata and indexing checks.
