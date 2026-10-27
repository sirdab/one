import assert from "node:assert/strict";
import { expect } from "@playwright/test";

export async function checkLookbookInteractions(browser, origin) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  try {
    await page.goto(`${origin}/lookbook/`);
    const link = page
      .locator(".catalog-start-link")
      .filter({ hasText: "Colors" });
    const card = link.locator('[data-slot="card"]');
    await expect(card).toBeVisible();
    const restingCardFill = await card.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    await link.hover();
    const feedback = await card.evaluate(async (el) => {
      await Promise.all(
        el.getAnimations().map((animation) => animation.finished),
      );
      return getComputedStyle(el).backgroundColor;
    });
    const scrolling = await page
      .locator(".lookbook-content, .catalog-scroll")
      .evaluateAll((elements) =>
        elements.map((el) => getComputedStyle(el).overscrollBehaviorX),
      );
    assert.deepEqual(
      { scrolling, cardResponds: feedback !== restingCardFill },
      { scrolling: ["auto", "auto"], cardResponds: true },
      "Scroll containers allow browser history gestures and section cards respond to hover",
    );
    await expect(card).toHaveCSS("translate", "none");
    await page.mouse.down();
    await expect(card).toHaveCSS("scale", "none");
    await page.mouse.move(1400, 850);
    await page.mouse.up();
    await page.keyboard.press("Tab");
    await link.focus();
    assert.equal(
      await link.evaluate((el) => el.matches(":focus-visible")),
      true,
    );
    assert.notEqual(
      await link.evaluate((el) => getComputedStyle(el).outlineStyle),
      "none",
    );
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Colors", exact: true }),
    ).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Lookbook sections" });
    await expect(
      nav.getByRole("link", { name: "Colors", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await page.goBack();
    await expect(
      page.getByRole("heading", { name: "The One lookbook" }),
    ).toBeVisible();
    await page.goForward();
    await expect(
      page.getByRole("heading", { name: "Colors", exact: true }),
    ).toBeVisible();
    await nav.getByRole("button", { name: "Components", exact: true }).click();
    const buttons = nav.getByRole("link", { name: "Buttons", exact: true });
    const restingFill = await buttons.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    await buttons.hover();
    await expect
      .poll(() =>
        buttons.evaluate((el) => getComputedStyle(el).backgroundColor),
      )
      .not.toBe(restingFill);
    await page.goBack();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await link.hover();
    await expect(card).toHaveCSS("translate", "none");
    assert.notEqual(
      await card.evaluate((el) => getComputedStyle(el).backgroundColor),
      restingCardFill,
    );
  } finally {
    await page.close();
  }
}
