# Moving a product to Sirdab One

Product migrations are still pending. This extraction does not change `sirdab/apps`, Uqail, or their production deployments. Test each migration against a published alpha or the verified tarball before removing the old packages.

| Existing import or setup                                                                 | One replacement                                                                                        |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `@sirdab/ui` or `@uqail/ui`                                                              | `@sirdab/one`                                                                                          |
| `@sirdab/ui/components/ui/button` or equivalent Uqail component path                     | `@sirdab/one/components/button`                                                                        |
| `@sirdab/ui/button` or `@uqail/ui/button`                                                | `@sirdab/one/components/button`                                                                        |
| `@sirdab/ui/theme-provider` or Uqail equivalent                                          | `@sirdab/one/theme-provider`, or the combined `OneProvider`                                            |
| `@sirdab/foundation`, `@uqail/foundation`, or `@sirdab/ui/foundation` helper exports     | `@sirdab/one/foundation`                                                                               |
| UI icon module such as `icons/shell`                                                     | `@sirdab/one/icons/shell`                                                                              |
| UI hook such as `hooks/use-mobile`                                                       | `@sirdab/one/hooks/use-mobile`                                                                         |
| UI helper such as `lib/utils`                                                            | `@sirdab/one/lib/utils`                                                                                |
| Foundation CSS, Tailwind bridge and component scanning                                   | Import `@sirdab/one/styles.css` once                                                                   |
| Inter and IBM Plex Arabic loading owned by the old UI package                            | Optional `@sirdab/one/fonts.css`                                                                       |
| Host copies of `/flags` and the Riyal font                                               | Package-owned assets, resolved by the bundler                                                          |
| `buttonVariants` called in a Server Component                                            | Root export or `@sirdab/one/components/button-variants`                                                |
| `@uqail/ui/lookbook`                                                                     | Public One docs/lookbook site; no product runtime dependency                                           |
| Transportation's vendored `combobox` (`Combobox`, `ComboboxOption<T>`, `ComboboxLabels`) | `@sirdab/one/components/search-select` (`SearchSelect`, `SearchSelectOption<T>`, `SearchSelectLabels`) |
| Transportation's vendored cmdk-free `command`                                            | `@sirdab/one/components/listbox` (`Listbox*`, `listboxMatches`)                                        |
| Transportation's vendored `date-picker` (ISO strings, ranges)                            | `@sirdab/one/components/date-picker` (subpath only)                                                    |
| Vendored `direction-provider`                                                            | `DirectionProvider` from `@sirdab/one`                                                                 |
| Vendored `INPUT_TEXT_CLASSES`                                                            | `FIELD_VALUE` from `@sirdab/one/components/field-chrome`                                               |
| Vendored `AppIcon` type                                                                  | `IconComponent` from `@sirdab/one/icons/house-icon`                                                    |

Install React 19 and the alpha package. No Next peer dependency or Tailwind setup is required to use components. A host can keep Tailwind for its own layout. Remove obsolete package aliases, workspace source paths, `transpilePackages`, scanner entries and package-specific overrides only after the product's own tests pass. Do not remove an override used by unrelated product dependencies.

**Hosts that run Tailwind v4 themselves** (most product apps) load One into their own Tailwind entry so every utility, theirs and One's, is generated in one pass:

```css
@import "tailwindcss" source("../");
@import "@sirdab/one/shadcn-bridge.css" layer(base);
@import "@sirdab/one/foundation.css" layer(base);
@import "@sirdab/one/tailwind.css";
```

Do not also import `@sirdab/one/styles.css` there. Its precompiled utilities would come after the host's and override responsive variants. `styles.css` is for hosts without Tailwind.

Markup written for `@sirdab/ui`'s padded Card and default-filled Badge can alias `LegacyCard as Card` (and its parts) and `LegacyBadge as Badge` until it moves to One's Card sections and badge tones.

At the app entry or Next root layout:

```tsx
import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css";
import { OneProvider } from "@sirdab/one";

<OneProvider dir="rtl" defaultTheme="light">
  {children}
</OneProvider>;
```

`OneProvider` accepts `children`, `dir?: "ltr" | "rtl"`, `defaultTheme?: "light" | "dark" | "system"` and `nonce?: string`. Its default is light. Pass an existing CSP nonce where needed. The host still sets `<html lang="ar" dir="rtl">`; the provider supplies component direction context and theme behavior. In Next, put `suppressHydrationWarning` on `html` because theme initialization updates its class.

The standalone `ThemeProvider` remains available for apps already composing their own providers. Avoid nesting it around `OneProvider`. If a theme switcher uses `useTheme` from `next-themes`, declare that direct dependency in the host; do not rely on transitive imports. The fixtures demonstrate this setup.

Keep Arabic copy and control labels in the product. Use the existing localization providers for dialog/select close and search labels. Preserve phone-number LTR isolation inside RTL pages, logical drawer sides, semantic tokens and the Uqail-derived visual language. The fonts stylesheet is optional when a host already loads its own matching fonts; the Riyal asset required by the foundation ships with the main styles.

Run the product's production build, keyboard and mobile flows in both directions and themes, plus a deployment beneath its real URL prefix. Check flags, fonts, overlays, toast/portal placement and CSP. A passing One fixture is packaging evidence, not proof that a product migration is complete.
