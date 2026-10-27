# Avatar

Not rendered. The gallery page shows; this file explains.

From shadcn, trued: the badge and the group are gone, the fallback is the ink
circle and one hairline ring sits over the picture. No shadow.

- The initial is ONE grapheme, cut by the caller. The primitive never decides
  what an initial is.
- `delayMs` belongs on the fallback and is passed only when a picture exists,
  so a cached image wins without a flash of the initial on reload. With no
  picture the initial shows at once.
- Sizes: `sm` 24, `default` 32 (the topbar and the menu), `lg` 40, `xl` 56 (the
  settings row).
- The picture's alt is empty: it always sits beside the name.
