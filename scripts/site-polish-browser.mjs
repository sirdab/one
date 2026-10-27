import assert from "node:assert/strict";
import { expect } from "@playwright/test";

export async function checkSitePolish(page, origin, artifacts, width) {
  await page.goto(`${origin}/`);
  await checkHeaderNavigation(page);
  const header = page.locator(".site-header");
  const headerSize = await header.boundingBox();
  const logos = page.getByRole("img", { name: "Sirdab", exact: true });
  await expect(logos).toHaveCount(2);
  await expect
    .poll(() =>
      logos.evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
  const source = page.getByRole("link", {
    name: "Sirdab One on GitHub",
    exact: true,
  });
  await expect(source).toBeVisible();
  await expect(source).toHaveAttribute("href", "https://github.com/sirdab/one");
  await expect(source.locator('[data-icon="GitHubIcon"]')).toBeVisible();
  await expect(page.locator(".flow-status")).toHaveCount(0);

  const field = page.getByRole("textbox").first();
  await field.focus();
  await expect(field).toHaveCSS("outline-style", "none");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(field).toHaveCSS("outline-style", "solid");
  await page.emulateMedia({ forcedColors: "none" });
  await page.screenshot({ path: `${artifacts}/${width}-focus.png` });
  const toggle = page.getByRole("switch").first();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect
    .poll(() =>
      toggle
        .locator('[data-slot="switch-thumb"]')
        .evaluate((element) => element.getAnimations().length),
    )
    .toBeGreaterThan(0);
  await field.fill("");
  await expect(
    page.getByRole("button", { name: "إنشاء المساحة", exact: true }).first(),
  ).toBeDisabled();
  await field.fill("مساحة الفريق");
  const orbs = page.locator('[data-slot="store-avatar"] img');
  await expect(orbs).toHaveCount(3);
  await expect
    .poll(() =>
      orbs.evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
  await page
    .getByRole("radiogroup", { name: "Theme", exact: true })
    .getByRole("radio", { name: "Dark", exact: true })
    .click();
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .some((animation) => animation.animationName === "theme-sweep"),
  );
  const timing = await page.evaluate(() => {
    const animation = document
      .getAnimations()
      .find((item) => item.animationName === "theme-sweep");
    const result = animation.effect.getTiming();
    animation.playbackRate = 0.1;
    animation.currentTime = 250;
    animation.pause();
    return result;
  });
  assert.equal(timing.duration, 500);
  await page.screenshot({ path: `${artifacts}/${width}-theme-sweep.png` });
  await page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.animationName === "theme-sweep")
      .forEach((animation) => animation.finish()),
  );
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-theme-sweep",
    "",
  );
  await expect(page.locator(".flow-canvas")).toHaveAttribute("lang", "ar");
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
    "Playground follows the global dark theme",
  );
  await expect(field).toHaveValue("مساحة الفريق");
  await page.screenshot({ path: `${artifacts}/${width}-home-dark.png` });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  const snippet = await page.locator(".code-block code").textContent();
  await page.getByRole("button", { name: "Copy Your first component" }).click();
  await expect(
    page.locator('[data-sonner-toast][data-type="success"]'),
  ).toHaveText("Code copied");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    snippet,
  );
  await expect(page.locator("[data-sonner-toaster]")).toHaveCount(1);
  await page.screenshot({
    animations: "disabled",
    path: `${artifacts}/${width}-copy-toast.png`,
  });
  await page
    .getByRole("link", { name: "Open the lookbook", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("[data-sonner-toaster]")).toHaveCount(1);
  await page.goto(`${origin}/lookbook/colors/`);
  assert.equal((await header.boundingBox()).height, headerSize.height);
  const preview = page.locator("[data-color-preview]");
  const lightRamp = await preview.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--gray-50"),
  );
  await page
    .getByRole("radiogroup", { name: "Color preview theme" })
    .getByRole("radio", { name: "Dark", exact: true })
    .click();
  await expect(preview).toHaveAttribute("data-color-preview", "dark");
  assert.notEqual(
    await preview.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--gray-50"),
    ),
    lightRamp,
  );
  await expect(page.locator("html")).toHaveClass(/dark/);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "Colors must not widen the page",
  );
  await page.screenshot({ path: `${artifacts}/${width}-colors-dark.png` });
  const navTrigger = page.getByRole("button", {
    name: "Toggle lookbook navigation",
  });
  await navTrigger.click();
  if (width < 768) {
    const drawer = page.getByRole("dialog", { name: "Sidebar", exact: true });
    await expect(drawer).toHaveCSS("direction", "ltr");
    await expect
      .poll(async () => (await drawer.boundingBox()).x)
      .toBeCloseTo(8, 0);
    await drawer.getByRole("searchbox").fill("no-such-component");
    await expect(drawer.getByRole("status")).toContainText("No matches");
    await drawer.getByRole("searchbox").fill("avatar");
    await drawer.getByRole("link", { name: "Avatar", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Avatar", exact: true }),
    ).toBeVisible();
  } else {
    await expect(
      page.locator('[data-slot="sidebar-container"]'),
    ).toHaveAttribute("inert", "");
    await navTrigger.click();
    await expect(
      page.locator('[data-slot="sidebar-container"]'),
    ).not.toHaveAttribute("inert", "");
  }
  for (const section of ["command", "popover", "select"]) {
    await page.goto(`${origin}/lookbook/${section}/`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `${section} must fit the viewport`,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("radiogroup", { name: "Theme", exact: true })
    .getByRole("radio", { name: "Light", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-theme-sweep",
    "",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await page
    .getByRole("radiogroup", { name: "Theme", exact: true })
    .getByRole("radio", { name: "System", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
}

async function checkHeaderNavigation(page) {
  const header = page.getByRole("banner");
  const docs = header.getByRole("link", { name: "Docs", exact: true });
  async function metrics() {
    await page.evaluate(() => document.fonts.ready);
    return docs.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        size: style.fontSize,
        weight: style.fontWeight,
        leading: style.lineHeight,
        tracking: style.letterSpacing,
        width: box.width,
        height: box.height,
      };
    });
  }
  const baseline = await metrics();
  for (const [name, language] of [
    ["Docs", "en"],
    ["Lookbook", "ar"],
    ["Docs", "en"],
    ["Sirdab One home", "en"],
  ]) {
    if (name === "Sirdab One home")
      await page.locator("a.wordmark:visible").first().click();
    else await header.getByRole("link", { name, exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    if (name !== "Sirdab One home")
      await expect(
        header.getByRole("link", { name, exact: true }),
      ).toHaveAttribute("aria-current", "page");
    assert.deepEqual(
      await metrics(),
      baseline,
      `${name}: navigation typography and geometry changed`,
    );
  }
}
