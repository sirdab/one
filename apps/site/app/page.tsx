import type { Metadata } from "next";
import { pageMetadata, siteDescription, siteName, siteUrl } from "../seo";
import Link from "next/link";
import { Button } from "@sirdab/one/components/button";
import { ConnectedDemo } from "../components/connected-demo";
import { CodeBlock } from "../components/code-block";

const example: string = `import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css";
import { OneProvider, Button } from "@sirdab/one";

export default function App() {
  return (
    <OneProvider>
      <Button>Make something good</Button>
    </OneProvider>
  );
}`;

export const metadata: Metadata = pageMetadata(
  "React components with Arabic and RTL support",
  siteDescription,
  "/",
);

export default function HomePage(): React.JSX.Element {
  return (
    <main id="main-content">
      {siteUrl && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: siteUrl.href,
              description: siteDescription,
              inLanguage: ["en", "ar"],
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <section className="one-opening page-width">
        <div className="opening-copy">
          <h1>
            Every part
            <br />
            working as one
          </h1>
          <div className="opening-detail">
            <p>
              A React design system with
              <br />
              Arabic and RTL support.
            </p>
            <div>
              <Button size="xl" asChild>
                <Link href="/lookbook">Open the lookbook</Link>
              </Button>
              <Button variant="secondary" size="xl" asChild>
                <Link href="/docs">Start building</Link>
              </Button>
            </div>
          </div>
        </div>
        <ConnectedDemo />
      </section>
      <section className="home-start page-width">
        <div>
          <h2 className="text-display-md">Build with One.</h2>
          <p className="text-body-quiet text-muted-foreground">
            Try the local alpha before the npm release.
          </p>
          <Button asChild variant="secondary">
            <Link href="/docs#installation">Get started</Link>
          </Button>
        </div>
        <CodeBlock code={example} label="Your first component" />
      </section>
    </main>
  );
}
