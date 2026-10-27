# Packed consumer verification

Run from the repository root with Node 24 and pnpm 11.9.0:

```sh
pnpm nx run-many -t lint,typecheck,test,build
pnpm exec playwright install --with-deps chromium
pnpm nx run verification:consumers
```

The `verification:consumers` target runs `node scripts/verify-consumers.mjs`, depends on `one:build`, and must have `cache: false`. The `verification:test` target runs `node --test scripts/tests/*.test.mjs`. Browser installation is an explicit machine setup step, not part of the harness. In a shared implementation wave, the integration owner runs these commands after all units settle.

The fixture directories are templates, excluded from pnpm workspace membership. Do not install inside them or add them to workspace roots. The harness:

1. Creates a fresh operating-system temporary directory, then packs the already-built `packages/one` with lifecycle scripts disabled.
2. Unpacks and audits the tarball, including all export targets, compiled ESM, client directives, relative assets and redistributed license notices.
3. Copies each fixture and its shared application source into separate directories under that temporary root. Neither consumer imports source from this repository.
4. Uses public-registry `npm install` to install the tarball and fixture dependencies. It rejects symlinked packages, dependency links and Next anywhere in the Vite dependency tree. There are no host aliases, overrides, `transpilePackages`, copied public assets, or Tailwind configuration.
5. Builds Next App Router 16.2.10 and Vite in production mode. The Next server page calls `buttonVariants` from the root and dedicated recipe export and renders a client Button directly.
6. Serves production output under `/one-consumer/`, tests desktop and touch mobile Chromium, then stops each process group. Temporary installs are deleted on completion or handled failure.

The browser checks default light behavior even with a dark OS preference; explicit light/dark and live system changes; host-owned `html` language/direction; select choices and mobile bottom trays; dialog submission/close/focus return; logical end drawers in both directions; phone values, flag loading and mobile search focus; loaded Inter, IBM Plex Sans Arabic and SaudiRiyal fonts; control dimensions; browser errors and failed asset requests. It also records an axe WCAG A/AA scan and fails serious or critical violations. This is a smoke test, not a claim of full accessibility conformance or Safari/Firefox coverage.

An esbuild probe bundles only `Button` from both root and component subpaths with React external. It rejects retained chart/markdown/Next modules, a result above 64 KiB gzip, or root-import overhead beyond 30% plus 4 KiB. This is a coarse packaging regression ceiling, not a promised application bundle size. The measurements and module contributions are retained.

Evidence lives in a timestamped `artifacts/consumers/` directory: command logs, the tarball, audit result, generated consumer manifests and npm locks, dependency trees, browser request logs, axe results, screenshots and Playwright traces. Failures retain a stack trace and a browser screenshot when available. A successful full run also writes `verified-package.tgz` and `verified-package.json` at the evidence root, including the SHA-256. Release automation publishes that exact tarball.

Use the standalone audit against an already unpacked artifact:

```sh
node scripts/audit-package.mjs /absolute/path/to/unpacked/package
```

This also compares client directives with the checkout's source. It is useful for diagnosing packaging; it does not replace clean consumer builds and browser checks. A server readiness failure, failed npm command, missing browser executable, or failed assertion is a hard failure. There is no workspace fallback or automatic browser installation.

Fixture app dependencies are versioned in their templates. Fresh installs intentionally exercise public dependency resolution, including Vaul without the old host override. Generated npm locks are evidence for reproducing a run; they are not shared workspace lockfiles.
