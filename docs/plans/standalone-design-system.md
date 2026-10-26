# Sirdab One extraction

## Goal
Deliver a public MIT-licensed design-system repository at sirdab/one, an npm-ready @sirdab/one alpha, and a public-facing marketing/docs/lookbook site. Source snapshot: sirdab/apps d62c41344e5306d4346e5b133d9f26aab4860454, derived from Uqail a3ef3b1409359fa04aae4f008d640bd489080d2f.

## Settled decisions
- Product and repository name: Sirdab One / sirdab/one (user-directed).
- Public GitHub source under MIT (user-directed).
- React 19; Next.js and Vite consumer support; one package install plus CSS and provider.
- Preserve current visual language, dark/system mode, Arabic/RTL and behavior. Keep product repositories untouched during extraction.
- Do not publish a package until an actual packed artifact passes isolated consumer checks.

## Units
1. Bootstrap repository and mechanically extract components, foundations, tests and lookbook. Keep source products read-only.
2. Package: compiled ESM and declarations, CSS with assets, optional fonts, provider, portable dependencies. No required Next peer and no host overrides. Authoritative proof: component suite plus clean packed installs.
3. Site: public marketing, installation/theming docs, 49-section lookbook with live examples, code, language and theme controls. Reuse the existing visual system. Verify desktop/mobile and production build.
4. Consumers and release: isolated Next/Vite fixture builds and browser tests, tarball audit, CI and manual alpha release workflow, migration guidance.
5. Review and PR: inspect licensing/public content, review integration changes, run checks, open non-draft PR and monitor CI. npm publication is a later explicit action after reviewing the deliverable.

## Definition of done
Repository and reviewable PR exist; package build, typecheck, lint, tests and consumer smoke checks pass; site works on desktop/mobile, light/dark and Arabic; CI is green. Public npm publication and production app migrations must not be claimed before they occur.
