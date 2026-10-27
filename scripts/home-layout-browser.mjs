import assert from "node:assert/strict";
import { expect } from "@playwright/test";

export async function checkHomeLayout(browser, origin, artifacts) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${origin}/`);
    await page.evaluate(() => document.fonts.ready);
    const whole = page.getByRole("group", { name: "الواجهة المتكاملة" });
    const parts = page.getByRole("group", { name: "عناصر الواجهة" });
    const wholeBox = await whole.boundingBox();
    const partsBox = await parts.boundingBox();
    if (width <= 700)
      assert.ok(wholeBox.y < partsBox.y, "The composition leads on mobile");
    if (width === 1440)
      assert.ok(
        wholeBox.y < 400,
        "The working example is in the first viewport",
      );
    await whole
      .getByRole("textbox")
      .fill("مساحة الفريق للعمليات والخدمات اللوجستية");
    await whole
      .getByRole("button", { name: "إنشاء المساحة", exact: true })
      .click();
    await expect(
      parts.getByRole("button", { name: "أنشئها مرة ثانية" }),
    ).toBeVisible();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}: no horizontal page overflow`,
    );
    for (const button of await parts.getByRole("button").all()) {
      const sizes = await button.evaluate((element) => ({
        width: element.getBoundingClientRect().width,
        available:
          element.closest(".flow-part").clientWidth -
          2 *
            parseFloat(
              getComputedStyle(element.closest(".flow-part")).paddingLeft,
            ),
      }));
      assert.ok(
        sizes.width <= sizes.available + 1,
        `${width}: action fits its specimen`,
      );
    }
    await page.goto(`${origin}/`);
    await page.screenshot({
      path: `${artifacts}/${width}-home-layout.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.close();
  }
}
