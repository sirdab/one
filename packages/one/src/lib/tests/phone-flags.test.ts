// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { phoneFlagUrl } from "../phone-flags";
import { PICKER_PHONE_COUNTRIES } from "../phone";

describe("package-owned phone flags", (): void => {
  it("ships a real SVG for every selectable country", (): void => {
    for (const country of PICKER_PHONE_COUNTRIES) {
      const url: string | undefined = phoneFlagUrl(country.code);
      expect(url, country.code).toBeDefined();
      expect(readFileSync(new URL(url!), "utf8")).toContain("<svg");
    }
    expect(phoneFlagUrl("SA")).toBe(phoneFlagUrl("sa"));
    for (const code of ["unknown", "constructor", "__proto__"]) {
      expect(phoneFlagUrl(code)).toBeUndefined();
    }
  });

  it("uses literal module-relative URLs that preserve nested asset bases", (): void => {
    const source: string = readFileSync(
      new URL("../phone-flags.ts", import.meta.url),
      "utf8",
    );
    const assets: string[] = [
      ...source.matchAll(/new URL\("([^\"]+)", import\.meta\.url\)/g),
    ].map((match: RegExpMatchArray): string => match[1]);
    const files: string[] = readdirSync(
      new URL("../../assets/flags/", import.meta.url),
    ).filter((file: string): boolean => file.endsWith(".svg"));
    expect(assets).toHaveLength(files.length);
    for (const asset of assets) {
      expect(
        new URL(asset, "https://example.test/nested/npm/one/lib/phone-flags.js")
          .pathname,
      ).toBe(`/nested/npm/one/assets/flags/${asset.split("/").at(-1)}`);
    }
  });
});
