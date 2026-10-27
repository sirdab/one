# Contributing to Sirdab One

Use Node 24 and pnpm 11.9.0. Read [AGENTS.md](AGENTS.md) and the [extraction plan](docs/plans/standalone-design-system.md). `packages/one` owns the public React package; `apps/site` owns documentation and the lookbook. Product repositories are consumers and are not changed by this extraction.

Install with `pnpm install --frozen-lockfile`, then run repository tasks through Nx. Before proposing a release, follow [packed consumer verification](docs/guides/verification.md). Changes are ready to ship only when local checks and CI pass. In a coordinated shared workspace, the integration owner runs installs and authoritative checks; do not race those operations from another unit.

Preserve the Uqail-derived visual language, semantic tokens, light/dark/system modes, Arabic and RTL. Read `packages/one/TOKENS.md` and `COLORS.md` before changing visual values. Use house icons and existing component contracts. Components must work without a Next dependency, consumer Tailwind scanning, raw TypeScript transpilation or copied assets.

Keep tests in a `tests/` directory beside their subject. Test behavior users could lose, including keyboard, mobile and RTL behavior where relevant. Packaging changes need evidence from the installed tarball, not a workspace-only example. A small root import must remain tree-shakeable.

In a PR, describe the behavior changed, relevant tests inspected or added, baseline or red evidence, checks actually run and any exceptions. Distinguish pending checks from passed checks. Preserve license files when copying code or assets and update [third-party notices](THIRD_PARTY_NOTICES.md).

Do not push, merge, deploy or publish without the maintainer's authorization. The [release guide](docs/guides/releases.md) describes the separate manual npm action. Changes to products and their [migration steps](docs/guides/migration.md) remain separate work.
