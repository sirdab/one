import assert from "node:assert/strict";
import { expect } from "@playwright/test";

export async function checkLookbookLayout(browser, origin, artifacts) {
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      hasTouch: width < 768,
    });
    await page.goto(`${origin}/lookbook/`);
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.getByRole("heading", { name: "The One lookbook" }),
    ).toBeVisible();
    const content = page.locator(".lookbook-content");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollHeight > innerHeight,
      ),
      false,
      "Lookbook should not scroll the document",
    );
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    assert.equal(
      await content.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
      false,
      "Overview should fit without scrolling at the review viewport",
    );
    if (width >= 768) {
      const rail = page.locator(".lookbook-rail");
      const rect = await rail.boundingBox();
      assert.equal(rect.x, 0);
      assert.equal(rect.y, 0);
      assert.equal(rect.height, height);
      const trigger = page.getByRole("button", {
        name: "Toggle lookbook navigation",
      });
      assert.ok((await trigger.boundingBox()).x - (rect.x + rect.width) <= 24);
      const logo = page
        .getByRole("banner")
        .getByRole("link", { name: "Sirdab One home" });
      await expect(logo).toBeVisible();
      const triggerPosition = await trigger.boundingBox();
      const logoPosition = await logo.boundingBox();
      const search = page.getByRole("searchbox");
      const foundations = page.getByRole("button", {
        name: "Foundations",
        exact: true,
      });
      const navColors = page
        .getByRole("navigation", { name: "Lookbook sections" })
        .getByRole("link", { name: "Colors", exact: true });
      await foundations.focus();
      await page.keyboard.press("Enter");
      await expect(navColors).toBeHidden();
      await search.fill("colors");
      await expect(navColors).toBeVisible();
      await search.fill("");
      await expect(navColors).toBeHidden();
      await foundations.click();
      await expect(navColors).toBeVisible();
      const before = await search.boundingBox();
      assert.notEqual(
        await page
          .locator(".catalog-search-field")
          .evaluate((element) => getComputedStyle(element).backgroundColor),
        "rgba(0, 0, 0, 0)",
      );
      const scroll = page.locator(".catalog-scroll");
      await expect(scroll).toHaveCSS("scrollbar-width", "none");
      await page
        .getByRole("button", { name: "Compositions", exact: true })
        .click();
      await expect(
        page.getByRole("link", { name: "Mood board", exact: true }),
      ).toBeVisible();
      await scroll.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      assert.equal((await search.boundingBox()).y, before.y);
      await expect(
        page.getByRole("link", { name: "Mood board", exact: true }),
      ).toBeInViewport();
      await search.fill("buttons");
      await page.getByRole("link", { name: "Buttons", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Buttons", exact: true }),
      ).toBeVisible();
      await search.fill("");
      await expect(foundations).toHaveAttribute("aria-expanded", "false");
      await foundations.click();
      await content.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      await page
        .getByRole("navigation", { name: "Lookbook sections" })
        .getByRole("link", { name: "Colors", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Colors", exact: true }),
      ).toBeVisible();
      await expect
        .poll(() => content.evaluate((element) => element.scrollTop))
        .toBe(0);
      const frames = await trigger.evaluate(async (button) => {
        const samples = [];
        button.click();
        const start = performance.now();
        do {
          await new Promise(requestAnimationFrame);
          samples.push({
            triggerX: button.getBoundingClientRect().x,
            railEdge: document
              .querySelector(".lookbook-rail")
              .getBoundingClientRect().right,
            contentEdge: document
              .querySelector(".lookbook-main")
              .getBoundingClientRect().left,
          });
        } while (performance.now() - start < 350);
        return samples;
      });
      for (const frame of frames) {
        assert.equal(
          frame.triggerX,
          triggerPosition.x,
          "Toggle stays fixed throughout collapse",
        );
        assert.ok(
          Math.abs(frame.railEdge - frame.contentEdge) < 1,
          "Rail and content move together without a gap or overlap",
        );
      }
      await expect(rail).toHaveAttribute("inert", "");
      assert.deepEqual(
        await trigger.boundingBox(),
        triggerPosition,
        "Collapse control stays under the pointer",
      );
      assert.deepEqual(
        await logo.boundingBox(),
        logoPosition,
        "Brand stays in place while collapsing",
      );
      await expect(
        page.getByRole("banner").getByRole("link", { name: "Sirdab One home" }),
      ).toBeVisible();
      await trigger.click();
      await expect(rail).toBeInViewport();
      await trigger.evaluate(async (button) => {
        button.click();
        const start = performance.now();
        while (performance.now() - start < 75)
          await new Promise(requestAnimationFrame);
        button.click();
      });
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(rail).not.toHaveAttribute("inert", "");
      await expect.poll(async () => (await rail.boundingBox()).x).toBe(0);
      await page
        .getByRole("link", { name: "Lookbook", exact: true })
        .last()
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "The One lookbook" }),
    ).toBeVisible();
    await page.screenshot({
      path: `${artifacts}/${width}-lookbook-overview.png`,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.close();
  }
}
