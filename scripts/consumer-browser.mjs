import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export async function smokeConsumer(url, framework, evidence) {
  const browser = await chromium.launch();
  try {
    for (const mobile of [false, true]) {
      const label = `${framework}-${mobile ? "mobile" : "desktop"}`;
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1280, height: 900 },
        isMobile: mobile,
        hasTouch: mobile,
        colorScheme: "dark",
      });
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
      const page = await context.newPage();
      const errors = [];
      const network = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("response", (response) => {
        network.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType(),
        });
        if (response.status() >= 400)
          errors.push(`HTTP ${response.status()}: ${response.url()}`);
      });
      page.on("requestfailed", (request) =>
        errors.push(
          `Request failed: ${request.url()} ${request.failure()?.errorText}`,
        ),
      );
      try {
        await page.goto(url, { waitUntil: "networkidle" });
        await expect(page.locator("main")).toHaveAttribute(
          "data-ready",
          "true",
        );
        await expect(page.locator("html")).toHaveClass(/\blight\b/);
        const button = page.getByTestId("sized-button");
        const light = await button.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        );
        const buttonBox = await button.boundingBox();
        const inputHeight = await page
          .getByRole("textbox", { name: "Name", exact: true })
          .evaluate(
            (element) =>
              element
                .closest('[data-slot="input-wrapper"]')
                ?.getBoundingClientRect().height ?? 0,
          );
        assert(
          buttonBox && Math.abs(buttonBox.height - 32) <= 1,
          `Default button must be 32px: ${JSON.stringify(buttonBox)}`,
        );
        assert(
          Math.abs(inputHeight - 40) <= 1,
          `Default input wrapper must be 40px: ${inputHeight}`,
        );
        if (framework === "next") {
          await expect(page.getByTestId("server-recipe")).toBeVisible();
          await expect(page.getByTestId("subpath-recipe")).toBeVisible();
          await expect(
            page.getByTestId("server-icon-prop").locator("svg"),
          ).toBeVisible();
        }
        await page.screenshot({
          path: join(evidence, `${label}-light.png`),
          fullPage: true,
        });
        await page.getByRole("button", { name: "Dark", exact: true }).click();
        await expect(page.locator("html")).toHaveClass(/\bdark\b/);
        await expect
          .poll(() =>
            button.evaluate(
              (element) => getComputedStyle(element).backgroundColor,
            ),
          )
          .not.toBe(light);
        await page.screenshot({
          path: join(evidence, `${label}-dark.png`),
          fullPage: true,
        });
        await page.getByRole("button", { name: "System", exact: true }).click();
        await page.emulateMedia({ colorScheme: "light" });
        await expect(page.locator("html")).toHaveClass(/\blight\b/);
        await page.emulateMedia({ colorScheme: "dark" });
        await expect(page.locator("html")).toHaveClass(/\bdark\b/);
        await page.getByRole("button", { name: "Light", exact: true }).click();

        for (const rtl of [false, true]) {
          await page
            .getByRole("button", {
              name: rtl ? "العربية / RTL" : "English / LTR",
              exact: true,
            })
            .click();
          await expect(page.locator("html")).toHaveAttribute(
            "dir",
            rtl ? "rtl" : "ltr",
          );
          await expect(page.locator("html")).toHaveAttribute(
            "lang",
            rtl ? "ar" : "en",
          );
          const trigger = page.getByRole("combobox", {
            name: "City",
            exact: true,
          });
          await trigger.click();
          if (mobile) {
            await expect(
              page.getByRole("dialog", { name: "City", exact: true }),
            ).toBeVisible();
            await expect(
              page.locator('[data-slot="sheet-content"]'),
            ).toHaveAttribute("data-side", "bottom");
          }
          await page
            .getByRole("option", {
              name: rtl ? "Dammam" : "Jeddah",
              exact: true,
            })
            .click();
          await expect(page.getByLabel("Chosen city")).toHaveText(
            rtl ? "dammam" : "jeddah",
          );
          await expect(page.getByRole("dialog")).toHaveCount(0);
          await trigger.click();
          await page.keyboard.press("Escape");
          await expect(page.getByRole("option")).toHaveCount(0);

          await page
            .getByRole("button", { name: "Open dialog", exact: true })
            .click();
          const dialog = page.getByRole("dialog", {
            name: "Consumer dialog",
            exact: true,
          });
          await expect(dialog).toBeVisible();
          await expect
            .poll(() =>
              dialog.evaluate((element) => getComputedStyle(element).direction),
            )
            .toBe(rtl ? "rtl" : "ltr");
          await dialog
            .getByRole("textbox", { name: "Dialog name" })
            .fill("Packed consumer");
          await dialog
            .getByRole("button", { name: "Done", exact: true })
            .click();
          await expect(dialog).toHaveCount(0);
          await expect(
            page.getByRole("button", { name: "Open dialog", exact: true }),
          ).toBeFocused();

          await page
            .getByRole("button", { name: "Open drawer", exact: true })
            .click();
          const drawer = page.getByRole("dialog", {
            name: "Consumer drawer",
            exact: true,
          });
          await expect(drawer).toBeVisible();
          await expect
            .poll(async () => {
              const box = await drawer.boundingBox();
              const width = page.viewportSize()?.width ?? 0;
              return box
                ? Math.abs(rtl ? box.x - 8 : width - box.x - box.width - 8)
                : Infinity;
            })
            .toBeLessThan(2);
          await page.screenshot({
            path: join(evidence, `${label}-${rtl ? "rtl" : "ltr"}-drawer.png`),
            fullPage: true,
          });
          await drawer
            .getByRole("button", { name: "Close drawer", exact: true })
            .click();
          await expect(drawer).toHaveCount(0);
        }

        await page
          .getByRole("textbox", { name: "Phone number", exact: true })
          .fill("551785151");
        await expect(page.getByLabel("Phone value")).toHaveText(
          "+966551785151",
        );
        await expect
          .poll(() =>
            page
              .getByRole("textbox", { name: "Phone number", exact: true })
              .evaluate((element) => getComputedStyle(element).direction),
          )
          .toBe("ltr");
        await page
          .getByRole("button", { name: "Country", exact: true })
          .click();
        if (mobile) {
          await expect(
            page.getByRole("dialog", { name: "Country", exact: true }),
          ).toBeVisible();
          assert.notEqual(
            await page.evaluate(() => document.activeElement?.tagName),
            "INPUT",
            "Phone drawer must not open the keyboard",
          );
          await expect(page.locator("[cmdk-list]")).toHaveAttribute(
            "data-vaul-no-drag",
            "",
          );
        }
        const saudi = page.getByRole("option", { name: /Saudi Arabia/ });
        await expect(saudi).toBeVisible();
        await expect
          .poll(() =>
            saudi
              .locator("img")
              .evaluate(
                (image) =>
                  image instanceof HTMLImageElement &&
                  image.complete &&
                  image.naturalWidth > 0,
              ),
          )
          .toBe(true);
        await saudi.click();
        await expect(page.getByRole("option")).toHaveCount(0);

        await expect
          .poll(() =>
            page
              .locator('[data-slot="store-avatar"] img')
              .evaluate((image) => image.complete && image.naturalWidth > 0),
          )
          .toBe(true);
        const fonts = await page.evaluate(async () => {
          const latin = await document.fonts.load('16px "Inter"', "Sirdab");
          const arabic = await document.fonts.load(
            '16px "IBM Plex Sans Arabic"',
            "عقيل",
          );
          const riyal = await document.fonts.load(
            '16px "SaudiRiyal"',
            "\u20c1",
          );
          await document.fonts.ready;
          return [latin, arabic, riyal].map((faces) =>
            faces.map((face) => ({ family: face.family, status: face.status })),
          );
        });
        assert(
          fonts.every(
            (faces) =>
              faces.length > 0 &&
              faces.every((face) => face.status === "loaded"),
          ),
          `Missing optional or Riyal font: ${JSON.stringify(fonts)}`,
        );
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();
        await writeFile(
          join(evidence, `${label}-axe.json`),
          JSON.stringify(axe, null, 2),
        );
        assert.deepEqual(
          axe.violations
            .filter((violation) =>
              ["serious", "critical"].includes(violation.impact ?? ""),
            )
            .map((violation) => ({
              id: violation.id,
              description: violation.description,
            })),
          [],
          "Serious accessibility violations",
        );
        await page.screenshot({
          path: join(evidence, `${label}-rtl.png`),
          fullPage: true,
        });
        assert.deepEqual(errors, [], "Browser errors or missing assets");
      } catch (error) {
        await page
          .screenshot({
            path: join(evidence, `${label}-failure.png`),
            fullPage: true,
          })
          .catch(() => {});
        throw error;
      } finally {
        await writeFile(
          join(evidence, `${label}-network.json`),
          JSON.stringify({ errors, network }, null, 2),
        );
        await context.tracing.stop({
          path: join(evidence, `${label}-trace.zip`),
        });
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
