import { checkHomeLayout } from "./home-layout-browser.mjs";
import { checkDocsNavigation } from "./docs-navigation-browser.mjs";
import {
  checkThemeRefresh,
  checkThemeMotion,
} from "./theme-refresh-browser.mjs";
import { checkLookbookLayout } from "./lookbook-layout-browser.mjs";
import { checkLookbookInteractions } from "./lookbook-interactions-browser.mjs";
import { checkSitePolish } from "./site-polish-browser.mjs";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { chromium, expect } from "@playwright/test";

const root = resolve(import.meta.dirname, "../apps/site/out");
const basePath = process.env.SITE_BASE_PATH ?? "";
const artifacts = resolve(import.meta.dirname, "../artifacts/lookbook");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (basePath && !pathname.startsWith(`${basePath}/`))
      throw new Error("Wrong base path");
    const relative = pathname.slice(basePath.length).replace(/^\/+/, "");
    const file = resolve(
      root,
      relative,
      ...(pathname.endsWith("/") ? ["index.html"] : []),
    );
    if (!file.startsWith(`${root}${sep}`)) throw new Error("Outside export");
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[extname(file)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}${basePath}`;
let browser;
try {
  await mkdir(artifacts, { recursive: true });
  browser = await chromium.launch();
  await checkLookbookInteractions(browser, origin);
  await checkHomeLayout(browser, origin, artifacts);
  await checkDocsNavigation(browser, origin, artifacts);
  await checkLookbookLayout(browser, origin, artifacts);
  await checkThemeMotion(browser, origin);
  for (const width of [1440, 390]) {
    await checkThemeRefresh(browser, origin, width);
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await checkSitePolish(page, origin, artifacts, width);
    await page.goto(`${origin}/`);
    await expect(
      page.getByRole("group", { name: "الواجهة المتكاملة" }),
    ).toHaveCSS("direction", "rtl");
    await expect(
      page.locator(".flow-workbench").getByRole("radiogroup"),
    ).toHaveCount(0);
    await page.goto(`${origin}/lookbook/dialog/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await page
      .getByRole("button", { name: "تعديل الاسم", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveCSS("direction", "rtl");
    assert.equal(
      await dialog.evaluate((element) =>
        element.closest("[lang]")?.getAttribute("lang"),
      ),
      "ar",
    );
    await page.screenshot({
      animations: "disabled",
      path: `${artifacts}/${width}-arabic-dialog.png`,
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page.getByRole("radio", { name: "English / LTR" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await page.getByRole("button", { name: "Edit name", exact: true }).click();
    await expect(dialog).toHaveCSS("direction", "ltr");
    await page.keyboard.press("Escape");
    await page.goto(`${origin}/lookbook/sheet/`);
    await page
      .getByRole("button", { name: "اختر وقت التوصيل", exact: true })
      .click();
    await expect(dialog).toHaveCSS("direction", "rtl");
    await expect
      .poll(async () => (await dialog.boundingBox()).x)
      .toBeCloseTo(8, 0);
    await page.screenshot({
      animations: "disabled",
      path: `${artifacts}/${width}-arabic-sheet.png`,
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page.getByRole("radio", { name: "English / LTR" }).click();
    await page
      .getByRole("button", { name: "Pick a delivery time", exact: true })
      .click();
    await expect(dialog).toHaveCSS("direction", "ltr");
    await expect
      .poll(async () => {
        const box = await dialog.boundingBox();
        return width - box.x - box.width;
      })
      .toBeCloseTo(8, 0);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page.getByRole("radio", { name: "العربية / RTL" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator(".site-header")).toHaveCSS("direction", "ltr");
    await page.locator("a.wordmark:visible").first().click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "PASS: lookbook portals, drawer edges, locale switching and exit restoration on desktop and mobile",
  );
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
