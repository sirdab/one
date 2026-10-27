# Third-party notices

Sirdab One's original code is MIT-licensed under [LICENSE](LICENSE). Redistributed assets and vendored upstream code retain their own notices and terms. The package build must include these notices and the complete license texts, not only this summary.

## Country flags

The SVG flags derive from [flag-icons](https://github.com/lipis/flag-icons), copyright (c) 2013 Panayiotis Lipiridis, under MIT. The full notice is retained at `packages/one/assets/flags/LICENSE-flag-icons.txt` and must accompany the distributed flags. Moving or bundling the SVGs does not remove this attribution requirement.

## Saudi Riyal font

Saudi Riyal Font © Emran Alhaddad - Used under SIL Open Font License 1.1.

The `.woff2` and `.woff` files come from the Saudi Riyal Font project. Its supplied license is an author-modified text labelled SIL Open Font License 1.1, with an explicit visible attribution condition. Preserve the exact text at `packages/one/licenses/saudi-riyal-font-LICENSE.txt`; do not replace it with a generic OFL or claim the MIT project license applies to the font. See `packages/one/FONTS.md` for provenance. The CSS alias is `SaudiRiyal`; the glyph is U+20C1.

## Optional text fonts

Inter, by Rasmus Andersson and the Inter Project Authors, and IBM Plex Sans Arabic, by IBM Corp. and the IBM Plex Project Authors, are distributed through their Fontsource packages under SIL OFL 1.1. The optional `fonts.css` and local font files must ship with the complete corresponding license texts copied from `@fontsource/inter` and `@fontsource/ibm-plex-sans-arabic`. These font files remain under their own licenses.

## Component foundations and runtime dependencies

The component structures build on shadcn/ui (MIT, shadcn), Radix UI (MIT, WorkOS) and other declared dependencies. Packages installed as dependencies carry their own license notices. Review the packed dependency tree alongside package notices before a release.

The package vendors an adapted Vaul runtime so consumers do not need the source workspace's dialog dependency override. Vaul is MIT-licensed, copyright Emil Kowalski; its complete notice is copied into `dist/licenses/vaul-MIT.md`. Keep that notice with the adapted runtime. The artifact audit checks its attribution when a vendored Vaul path is present.

The compiled stylesheet also incorporates `tw-animate-css`; its MIT notice is copied from the installed dependency into `dist/licenses/tw-animate-css-MIT.txt`. Any additional bundled runtime or stylesheet needs its complete upstream license retained with the artifact.

The extraction originated in Sirdab's shared UI and foundation packages, derived from Uqail. Preserve upstream code and asset attribution through future refactors. Product names and third-party marks appearing in icon assets do not imply endorsement or a trademark license.

## Store identity art

The sixteen baked store orbs originate in Uqail's store avatar system. They are included as package-owned assets; the seed selection and collision-free list assignment are preserved without depending on Uqail's application state.
