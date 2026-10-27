import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css";
import "./globals.css";
import { SiteProvider } from "../components/site-provider";
import { SiteFrame } from "../components/site-frame";
import { basePath, siteDescription, siteName, siteUrl } from "../seo";

export const metadata: Metadata = {
  metadataBase: siteUrl ?? new URL("http://localhost:4205"),
  applicationName: siteName,
  title: { default: siteName, template: "%s | Sirdab One" },
  description: siteDescription,
  robots: { index: Boolean(siteUrl), follow: true },
  icons: {
    icon: [
      { url: `${basePath}/favicon.svg`, type: "image/svg+xml", sizes: "any" },
      { url: `${basePath}/favicon-96.png`, type: "image/png", sizes: "96x96" },
      { url: `${basePath}/favicon.ico`, sizes: "32x32" },
    ],
    apple: { url: `${basePath}/apple-touch-icon.png`, sizes: "180x180" },
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const mode=localStorage.getItem("theme");document.documentElement.dataset.themePreference=mode==="dark"||mode==="system"?mode:"light"}catch{}`,
          }}
        />
      </head>
      <body>
        <SiteProvider>
          <a className="skip-link" href="#main-content" lang="en" dir="ltr">
            Skip to content
          </a>
          <SiteFrame>{children}</SiteFrame>
        </SiteProvider>
      </body>
    </html>
  );
}
