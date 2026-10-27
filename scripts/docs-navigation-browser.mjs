import assert from "node:assert/strict";
import { expect } from "@playwright/test";

export async function checkDocsNavigation(browser, origin, artifacts) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${origin}/docs/`);
    const nav = page.getByRole("navigation", { name: "On this page" });
    const active = nav.locator('[aria-current="location"]');
    await expect(active).toHaveText("Installation");
    const sections = [
      ["first-component", "Your first component"],
      ["nextjs", "Next.js"],
      ["theming", "Theming"],
      ["arabic", "Arabic and RTL"],
      ["customization", "Customization"],
      ["composition", "Live composition"],
      ["theming", "Theming"],
      ["installation", "Installation"],
    ];
    for (const [id, label] of sections) {
      await page
        .locator(`#${id}`)
        .evaluate((section) => section.scrollIntoView());
      await expect(active).toHaveText(label);
    }
    if (width === 1440) {
      await nav.getByRole("link", { name: "Arabic and RTL" }).click();
      await expect(active).toHaveText("Arabic and RTL");
      await expect
        .poll(async () => (await page.locator("#arabic").boundingBox()).y)
        .toBeCloseTo(112, 0);
      const headerBottom = await page
        .locator(".site-header")
        .evaluate((element) => element.getBoundingClientRect().bottom);
      assert.ok(
        (await nav.boundingBox()).y > headerBottom,
        "Docs navigation stays below the header",
      );
      assert.ok(
        (await page.locator("#arabic").boundingBox()).y >= headerBottom,
        "Anchor heading stays below the header",
      );
      await expect(active).not.toHaveCSS(
        "background-color",
        "rgba(0, 0, 0, 0)",
      );
      const dark = await page
        .getByRole("radio", { name: "Dark", exact: true })
        .boundingBox();

      await page.mouse.click(dark.x + dark.width / 2, dark.y + dark.height / 2);
      await expect(page.locator("html")).toHaveClass(/dark/);
      await page.waitForFunction(
        () => !document.documentElement.hasAttribute("data-theme-sweep"),
      );
      await expect(active).toHaveText("Arabic and RTL");
      await page.screenshot({
        path: `${artifacts}/docs-active-section.png`,
        animations: "disabled",
      });
    }
    await page.goto(`${origin}/docs/#customization`);
    await expect(active).toHaveText("Customization");
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect(active).toHaveText("Live composition");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(active).toHaveText("Installation");
    await page.close();
  }
}
