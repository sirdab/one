import assert from "node:assert/strict";
import { expect } from "@playwright/test";

export async function checkThemeRefresh(browser, origin, width) {
  for (const saved of [null, "light", "dark", "system"]) {
    const mode = saved ?? "light";
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      hasTouch: width < 600,
      colorScheme: "dark",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error")
        errors.push(`${message.text()} ${message.location().url}`);
    });
    await page.addInitScript((preference) => {
      if (preference === null) localStorage.removeItem("theme");
      else localStorage.setItem("theme", preference);
    }, saved);
    await page.route("**/*.js", (route) => route.abort());
    await page.goto(`${origin}/`);
    await page.evaluate(() => document.fonts.ready);
    const initial = page.locator(
      '.header-theme [data-slot="segmented"]:visible',
    );
    await expect(initial).toHaveCount(1);
    await expect(initial.locator('[aria-checked="true"]')).toHaveAttribute(
      "value",
      mode,
    );
    await expect(initial.locator(".reveal-inline[data-open]")).toHaveCount(1);
    const before = await initial.boundingBox();
    await page.unroute("**/*.js");
    errors.length = 0;
    await page.reload();
    const live = page.getByRole("radiogroup", { name: "Theme", exact: true });
    await expect(live).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(live.locator('[aria-checked="true"]')).toHaveAttribute(
      "value",
      mode,
    );
    assert.equal(
      await page
        .locator(".flow-canvas")
        .evaluate(
          (element) =>
            getComputedStyle(element).getPropertyValue("--background") ===
            getComputedStyle(document.documentElement).getPropertyValue(
              "--background",
            ),
        ),
      true,
      `${mode}: playground should inherit the saved global theme`,
    );
    const after = await live.boundingBox();
    for (const key of ["x", "y", "width", "height"]) {
      assert.ok(
        Math.abs(before[key] - after[key]) < 1,
        `${mode} ${width}: ${key} changed on hydration`,
      );
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.equal(
      await live.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
      false,
      `${mode} ${width}: theme choices are clipped`,
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
}

export async function checkThemeMotion(browser, origin) {
  const page = await browser.newPage({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.goto(`${origin}/`);
  const control = page.getByRole("radiogroup", { name: "Theme", exact: true });
  await expect(control).toBeVisible();
  for (const name of ["System", "Dark", "Light"]) {
    const motion = await control.evaluate(async (element, label) => {
      const radio = [...element.querySelectorAll('[role="radio"]')].find(
        (item) => item.textContent.includes(label),
      );
      radio.click();
      for (let frame = 0; frame < 8; frame++) {
        await new Promise(requestAnimationFrame);
        const animations = element.getAnimations({ subtree: true });
        if (animations.length) {
          const properties = animations.map(
            (animation) => animation.transitionProperty,
          );
          if (
            properties.includes("grid-template-columns") &&
            properties.includes("left")
          ) {
            const expanding = radio.querySelector(".reveal-inline");
            const sliding = radio.querySelector(
              '[data-slot="segmented-thumb"]',
            );
            for (const animation of animations) {
              animation.pause();
              animation.currentTime = 50;
            }
            await new Promise(requestAnimationFrame);
            const intermediateWidth = expanding.getBoundingClientRect().width;
            const intermediateOffset = parseFloat(
              getComputedStyle(sliding).left,
            );
            for (const animation of animations) animation.play();
            await Promise.all(
              animations.map((animation) => animation.finished.catch(() => {})),
            );
            return {
              properties,
              intermediateWidth,
              finalWidth: expanding.getBoundingClientRect().width,
              intermediateOffset,
              finalOffset: parseFloat(getComputedStyle(sliding).left),
            };
          }
        }
      }
      return {
        properties: element
          .getAnimations({ subtree: true })
          .map((animation) => animation.transitionProperty),
      };
    }, name);
    assert.ok(
      motion.properties.includes("grid-template-columns"),
      `${name}: label does not animate`,
    );
    assert.ok(
      motion.properties.includes("left"),
      `${name}: thumb does not slide`,
    );
    assert.ok(
      motion.intermediateWidth > 0 &&
        motion.intermediateWidth < motion.finalWidth,
      `${name}: label skipped the intermediate width`,
    );
    assert.ok(
      Math.abs(motion.intermediateOffset) > 1 && motion.finalOffset === 0,
      `${name}: thumb skipped the intermediate position`,
    );
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme-sweep",
      "",
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await control.getByRole("radio", { name: "Dark", exact: true }).click();
  assert.equal(
    await control.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
    0,
  );
  await page.close();
}
