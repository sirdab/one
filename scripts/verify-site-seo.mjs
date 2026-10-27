import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";

const output = resolve(import.meta.dirname, "../apps/site/out");
const basePath = process.env.SITE_BASE_PATH ?? "";
const siteUrl = process.env.SITE_URL
  ? new URL(`${process.env.SITE_URL.replace(/\/$/, "")}/`)
  : undefined;

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? htmlFiles(path)
        : entry.name.endsWith(".html")
          ? [path]
          : [];
    }),
  );
  return groups.flat();
}

const sitemap = new JSDOM(await readFile(join(output, "sitemap.xml"), "utf8"), {
  contentType: "text/xml",
}).window.document;
const sitemapUrls = [...sitemap.querySelectorAll("loc")].map(
  (node) => node.textContent,
);
assert.equal(
  new Set(sitemapUrls).size,
  sitemapUrls.length,
  "Sitemap URLs must be unique",
);
const expectedUrls = new Set();
let checked = 0;
for (const path of await htmlFiles(output)) {
  const document = new JSDOM(await readFile(path, "utf8")).window.document;
  const route = path.slice(output.length).replace(/index\.html$/, "");
  if (["/404.html", "/404/", "/_not-found/"].includes(route)) {
    assert.match(
      document.querySelector('meta[name="robots"]')?.content ?? "",
      /noindex/,
      "404 must be noindex",
    );
    continue;
  }
  assert.ok(document.title.length > 10, `${route}: meaningful title`);
  assert.ok(
    document.querySelector("main h1")?.textContent.trim(),
    `${route}: server-rendered page heading`,
  );
  assert.ok(
    document.querySelector('meta[name="description"]')?.content.length > 40,
    `${route}: description`,
  );
  assert.equal(
    document.querySelector('meta[property="og:title"]')?.content,
    document.title,
    `${route}: social title`,
  );
  assert.equal(
    document.querySelector('meta[name="twitter:card"]')?.content,
    "summary_large_image",
  );
  for (const link of document.querySelectorAll(
    'link[rel="icon"], link[rel="apple-touch-icon"]',
  )) {
    assert.ok(
      link.getAttribute("href").startsWith(`${basePath}/`),
      `${route}: icon base path`,
    );
    const asset = link.getAttribute("href").slice(basePath.length);
    assert.ok(
      (await readFile(join(output, asset))).length > 0,
      `${route}: icon exists`,
    );
  }
  assert.ok(document.querySelector('link[rel="icon"][type="image/svg+xml"]'));
  if (siteUrl) {
    const canonicalRoute = route.replace(/^\/lookbook\/ar\//, "/lookbook/");
    const canonical = new URL(canonicalRoute.slice(1), siteUrl).href;
    assert.equal(
      document.querySelector('link[rel="canonical"]')?.href,
      canonical,
      `${route}: canonical`,
    );
    assert.equal(
      document.querySelector('meta[property="og:url"]')?.content,
      canonical,
    );
    assert.equal(
      document.querySelector('meta[property="og:image"]')?.content,
      new URL("social-preview.png", siteUrl).href,
    );
    assert.doesNotMatch(
      document.querySelector('meta[name="robots"]')?.content ?? "",
      /noindex/,
    );
    expectedUrls.add(canonical);
    if (route.startsWith("/lookbook/")) {
      const ar = document.querySelector('link[hreflang="ar"]')?.href;
      const en = document.querySelector('link[hreflang="en"]')?.href;
      assert.ok(
        sitemapUrls.includes(ar),
        `${route}: Arabic alternate is canonical`,
      );
      assert.ok(
        sitemapUrls.includes(en),
        `${route}: English alternate is canonical`,
      );
    }
    if (route === "/") {
      const data = JSON.parse(
        document.querySelector('script[type="application/ld+json"]')
          .textContent,
      );
      assert.equal(data.url, siteUrl.href);
      assert.equal(data.name, "Sirdab One");
    }
  } else {
    assert.match(
      document.querySelector('meta[name="robots"]')?.content ?? "",
      /noindex/,
    );
    assert.equal(document.querySelector('link[rel="canonical"]'), null);
  }
  checked++;
}
assert.deepEqual(
  new Set(sitemapUrls),
  expectedUrls,
  "Sitemap must contain exactly the canonical public pages",
);
const robots = await readFile(join(output, "robots.txt"), "utf8");
assert.ok(
  robots.includes(
    siteUrl
      ? `Sitemap: ${new URL("sitemap.xml", siteUrl).href}`
      : "Disallow: /",
  ),
);
console.log(
  `SEO export verified: ${checked} pages, ${sitemapUrls.length} canonical URLs, ${siteUrl ? "public" : "local noindex"} build.`,
);
