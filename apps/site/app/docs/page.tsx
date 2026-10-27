import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "../../seo";
import { CodeBlock } from "../../components/code-block";
import { HeroPreview } from "../../components/hero-preview";
import { DocsNavigation } from "../../components/docs-navigation";

export const metadata: Metadata = pageMetadata(
  "Getting started",
  "Set up Sirdab One in Next.js or Vite. Install React components, configure fonts and themes, and build interfaces with Arabic and RTL support.",
  "/docs/",
);

const setup: string = `import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css"; // Optional: Inter + IBM Plex Arabic
import { OneProvider, Button } from "@sirdab/one";

export default function App() {
  return (
    <OneProvider defaultTheme="light">
      <Button>Save changes</Button>
    </OneProvider>
  );
}`;
const nextSetup: string = `// app/providers.tsx
"use client";
import { OneProvider } from "@sirdab/one/provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <OneProvider>{children}</OneProvider>;
}

// app/layout.tsx
import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css";
import { Providers } from "./providers";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}`;
const theme: string = `"use client";
import { useTheme } from "next-themes";
import { Button } from "@sirdab/one/components/button";

export function ThemeChoice() {
  const { setTheme } = useTheme();
  return (
    <div>
      <Button onClick={() => setTheme("light")}>Light</Button>
      <Button onClick={() => setTheme("dark")}>Dark</Button>
      <Button onClick={() => setTheme("system")}>System</Button>
    </div>
  );
}`;

export default function DocsPage(): React.JSX.Element {
  return (
    <main id="main-content" className="docs-layout page-width">
      <DocsNavigation />
      <article className="docs-article">
        <header>
          <p className="text-body text-brand">Sirdab One / Documentation</p>
          <h1 className="text-display-lg">Make it yours.</h1>
          <p>
            Sirdab One is built on{" "}
            <a href="https://ui.shadcn.com/">shadcn/ui</a>, with Sirdab’s shared
            foundations, typography, Arabic and RTL support.
          </p>
          <p className="section-description">
            A React library with its styles included. Start with a provider and
            build from there.
          </p>
        </header>
        <section id="installation">
          <h2 className="text-heading-sm">Installation</h2>
          <p>
            <strong>This is an alpha preview.</strong> Version 0.1.0-alpha.0 has
            not been published to npm. There is no live registry install yet.
          </p>
          <p>
            To try it now, build and pack the package from{" "}
            <a href="https://github.com/sirdab/one">the repository</a>. Use Node
            24 and pnpm 11 for the workspace.
          </p>
          <CodeBlock
            label="Build a local alpha"
            code={`git clone https://github.com/sirdab/one.git
cd one
pnpm install
pnpm nx run one:build
mkdir -p artifacts
pnpm --dir packages/one pack --pack-destination ../../artifacts`}
          />
          <p>
            Then install the generated tarball in a React 19 app. Replace the
            path below with the path to your local repository.
          </p>
          <CodeBlock
            label="Install the tarball in your app"
            code="npm install /path/to/one/artifacts/sirdab-one-0.1.0-alpha.0.tgz"
          />
          <details className="docs-details">
            <summary>
              Future npm quickstart, after the alpha is published
            </summary>
            <CodeBlock
              label="Not available until publication"
              code="npm install @sirdab/one@0.1.0-alpha.0"
            />
          </details>
        </section>
        <section id="first-component">
          <h2 className="text-heading-sm">Your first component</h2>
          <p>
            Import the stylesheet once at your app’s entry point. The optional
            fonts stylesheet bundles Inter and IBM Plex Arabic locally, without
            a font service request.
          </p>
          <CodeBlock label="React / Vite" code={setup} />
          <p>
            No Tailwind configuration or source scanning is needed to use the
            components. Import individual pieces from{" "}
            <code>@sirdab/one/components/button</code> when you prefer explicit
            entry points.
          </p>
        </section>
        <section id="nextjs">
          <h2 className="text-heading-sm">With Next.js</h2>
          <p>
            Keep the root layout on the server and put the provider in a small
            client component. One itself does not require Next.js.
          </p>
          <CodeBlock label="Next.js App Router" code={nextSetup} />
        </section>
        <section id="theming">
          <h2 className="text-heading-sm">Light, dark, or the system.</h2>
          <p>
            One starts in light mode. Set <code>defaultTheme="system"</code> to
            follow the device preference. The provider applies the theme through
            next-themes and keeps the chosen mode between visits.
          </p>
          <CodeBlock
            label="Follow the system theme"
            code={`<OneProvider defaultTheme="system">
  {children}
</OneProvider>`}
          />
          <p>
            The provider accepts <code>children</code>, optional{" "}
            <code>dir</code> (<code>ltr</code> or <code>rtl</code>),{" "}
            <code>defaultTheme</code> (<code>light</code>, <code>dark</code>, or{" "}
            <code>system</code>), and an optional <code>nonce</code> for a
            content security policy.
          </p>
          <p>
            For a theme switcher, add <code>next-themes</code> as a direct
            dependency of your app and use its hook. The controls at the top of
            this site use the same theme context.
          </p>
          <CodeBlock label="Theme controls" code={theme} />
          <p>
            Nested <code>light</code> and <code>dark</code> classes can scope
            inline specimens independently. Portaled overlays follow their
            provider and document context, so use a page theme when reviewing
            dialogs and menus.
          </p>
          <CodeBlock
            label="Inline theme scopes"
            code={`<div className="dark">
  <div style={{ background: "var(--background)", color: "var(--foreground)" }}>
    <Button>Dark surface</Button>
    <div className="light">
      <Button>Light surface</Button>
    </div>
  </div>
</div>`}
          />
        </section>
        <section id="arabic">
          <h2 className="text-heading-sm">Arabic belongs here.</h2>
          <p>
            Set your document’s language and direction, then give One the same
            direction. Your app owns <code>html</code>; the provider supplies
            direction to the interactive components.
          </p>
          <CodeBlock
            label="Arabic document"
            code={`<html lang="ar" dir="rtl" suppressHydrationWarning>
  <body>
    <OneProvider dir="rtl" defaultTheme="light">
      <Button>حفظ التغييرات</Button>
    </OneProvider>
  </body>
</html>`}
          />
          <p>
            Use logical spacing such as <code>margin-inline-start</code>, and
            let the Arabic font and type adjustments do their work. The{" "}
            <Link href="/lookbook/ar/numerals">numerals lookbook</Link> shows
            the distinction between local values and identifiers.
          </p>
        </section>
        <section id="customization">
          <h2 className="text-heading-sm">
            Change the tokens. Keep the language.
          </h2>
          <p>
            Load your overrides after One’s stylesheet. Start with semantic
            tokens, so a change reaches every component that uses the value.
          </p>
          <CodeBlock
            label="app.css, after One styles"
            code={`:root, .light {
  --brand: var(--brand-700);
}

.dark {
  --brand: var(--brand-200);
}`}
          />
          <p>
            Keep action, surface, and status colors in their own roles. Read the{" "}
            <a href="https://github.com/sirdab/one/blob/main/packages/one/COLORS.md">
              color decisions
            </a>{" "}
            and{" "}
            <a href="https://github.com/sirdab/one/blob/main/packages/one/TOKENS.md">
              token reference
            </a>{" "}
            before widening the palette.
          </p>
          <p>
            Public entry points include the root, <code>/provider</code>,{" "}
            <code>/theme-provider</code>, <code>/foundation</code>, and
            individual <code>/components/*</code>, <code>/icons/*</code>,{" "}
            <code>/hooks/*</code>, and <code>/lib/*</code> modules. The lookbook
            lives in this site and is not part of the npm package.
          </p>
        </section>
        <section id="composition">
          <h2 className="text-heading-sm">Try a composition.</h2>
          <p>
            Edit the field, flip the switch, and save. These are the same
            exported components you install. Changes stay in this preview.
          </p>
          <HeroPreview />
          <p>
            For component states, examples, and source, open the{" "}
            <Link href="/lookbook">full lookbook</Link>.
          </p>
        </section>
      </article>
    </main>
  );
}
