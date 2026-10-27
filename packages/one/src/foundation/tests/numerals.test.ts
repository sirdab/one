import { describe, expect, it } from "vitest";

import {
  formatField,
  formatIdentifier,
  formatMinor,
  formatPrice,
  formatValue,
  hasLocalisedDigits,
  RIYAL,
  toMinor,
  toWesternDigits,
  westernLocale,
} from "../index";

const LRI = "⁦";
const PDI = "⁩";
const NON_WESTERN_DIGIT = /[\u0660-\u0669\u06F0-\u06F9]/;

describe("westernLocale", () => {
  it("pins a tag to the latn numbering system", () => {
    expect(westernLocale("ar-SA")).toBe("ar-SA-u-nu-latn");
    expect(westernLocale("ar")).toBe("ar-u-nu-latn");
  });

  it("overrides a numbering system the tag already asks for", () => {
    expect(westernLocale("ar-SA-u-nu-arab")).toBe("ar-SA-u-nu-latn");
  });
});

describe("formatValue", () => {
  it("renders Western digits for ar-SA, keeping the Arabic grouping", () => {
    expect(formatValue(249)).toBe("249");
    expect(formatValue(12030.5)).toBe("12,030.5");
    expect(formatValue(0.184, "ar-SA", { style: "percent" })).not.toMatch(
      NON_WESTERN_DIGIT,
    );
  });

  it("renders Western digits for en-US", () => {
    expect(formatValue(249, "en-US")).toBe("249");
  });
});

describe("formatPrice", () => {
  it("puts the riyal sign left of the number inside an isolate", () => {
    const price = formatPrice(124950);
    expect(price.startsWith(LRI + RIYAL + " ")).toBe(true);
    expect(price.endsWith(PDI)).toBe(true);
    expect(price).toContain("1,249.50");
  });

  it("omits the symbol when asked", () => {
    expect(formatPrice(1000, { locale: "en-US", symbol: false })).toBe("10.00");
  });

  it("takes any ui language tag and renders Western digits in all of them", () => {
    expect(formatPrice(1050, { locale: "ar" })).toContain("10.50");
    expect(formatPrice(1050, { locale: "fr" })).toContain("10.50");
    expect(formatPrice(1050, { locale: "tr" })).toContain("10.50");
  });

  it("renders Arabic the way checkout does: the sign, then Western digits", () => {
    const price = formatPrice(123456789, { locale: "ar" });
    expect(price).toBe(`${LRI}${RIYAL} 1,234,567.89${PDI}`);
  });

  it("falls back to Intl's own symbol for a non-riyal currency", () => {
    const price = formatPrice(1050, { locale: "en", currency: "USD" });
    expect(price).toBe(`${LRI}$10.50${PDI}`);
    expect(price).not.toContain(RIYAL);
  });
});

describe("price numeral compatibility", () => {
  it("preserves explicitly localised Arabic prices", () => {
    expect(formatPrice(124950, { numerals: "localised" })).toBe(
      `${LRI}${RIYAL} ١٬٢٤٩٫٥٠${PDI}`,
    );
    expect(formatPrice(1050, { numerals: "localised", symbol: false })).toBe(
      "١٠٫٥٠",
    );
  });

  it("accepts explicit Western digits with the same result as the default", () => {
    expect(formatPrice(124950, { numerals: "western" })).toBe(
      `${LRI}${RIYAL} 1,249.50${PDI}`,
    );
  });
});

describe("formatMinor", () => {
  it("is the plain spreadsheet shape: no grouping, no currency, two decimals", () => {
    expect(formatMinor(0)).toBe("0.00");
    expect(formatMinor(1)).toBe("0.01");
    expect(formatMinor(99)).toBe("0.99");
    expect(formatMinor(1050)).toBe("10.50");
    expect(formatMinor(123456789)).toBe("1234567.89");
  });

  it("keeps a leading minus for refunds", () => {
    expect(formatMinor(-1050)).toBe("-10.50");
    expect(formatMinor(-1)).toBe("-0.01");
  });

  it("matches the toFixed(2) it replaced on every fixture", () => {
    for (const minor of [0, 1, 99, 100, 1050, 123456789, -1050]) {
      expect(formatMinor(minor)).toBe((minor / 100).toFixed(2));
    }
  });
});

describe("toMinor", () => {
  it("reads riyals into halalas, rounded, in either digit form", () => {
    expect(toMinor("49")).toBe(4900);
    expect(toMinor("49.50")).toBe(4950);
    expect(toMinor(" 0.1 ")).toBe(10);
    expect(toMinor("10.10")).toBe(1010);
    expect(toMinor("٤٩")).toBe(4900);
    expect(toMinor("۴۹.۵")).toBe(4950);
    expect(toMinor("0")).toBe(0);
  });

  it("answers null for a blank, a word or a negative, never a silent zero", () => {
    expect(toMinor("")).toBeNull();
    expect(toMinor("   ")).toBeNull();
    expect(toMinor("abc")).toBeNull();
    expect(toMinor("-5")).toBeNull();
    expect(toMinor("1,249.50")).toBeNull();
  });

  it("round-trips formatMinor", () => {
    for (const minor of [0, 1, 99, 100, 1050, 123456789]) {
      expect(toMinor(formatMinor(minor))).toBe(minor);
    }
  });
});

describe("formatIdentifier", () => {
  it("never localises, whatever the input digit form", () => {
    expect(formatIdentifier(249107)).toBe(`${LRI}249107${PDI}`);
    expect(formatIdentifier("٢٤٩١٠٧")).toBe(`${LRI}249107${PDI}`);
  });
});

describe("toWesternDigits", () => {
  it("normalises Arabic-Indic and Extended forms", () => {
    expect(toWesternDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
    expect(toWesternDigits("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
    expect(toWesternDigits("order ٢٤٩")).toBe("order 249");
  });
});

describe("hasLocalisedDigits", () => {
  it("is stable across repeated calls (no /g lastIndex leak)", () => {
    expect(hasLocalisedDigits("٢٤٩")).toBe(true);
    expect(hasLocalisedDigits("٢٤٩")).toBe(true);
    expect(hasLocalisedDigits("249")).toBe(false);
  });
});

describe("formatField", () => {
  it("renders values and identifiers in Western digits alike", () => {
    expect(formatField("quantity", 3)).toBe("3");
    expect(formatField("orderId", 249107)).toBe(`${LRI}249107${PDI}`);
    expect(formatField("phone", "٠٥٥١٢٣٤٥٦٧")).toBe(`${LRI}0551234567${PDI}`);
  });

  it("routes money through formatPrice", () => {
    expect(formatField("price", 124950)).toBe(formatPrice(124950));
    expect(formatField("total", 4900, "en-US")).toContain("49.00");
  });

  it("routes percentages through style: percent", () => {
    expect(formatField("percentage", 0.2, "en-US")).toBe("20%");
  });

  it("routes dates through Intl.DateTimeFormat", () => {
    const jan5 = new Date(2026, 0, 5);
    expect(formatField("date", jan5, "en-US")).toBe("1/5/2026");
    expect(formatField("date", jan5, "en-US")).not.toContain(",");
  });
});

describe("formatPrice fixture table", () => {
  const FIXTURES = [0, 1, 99, 100, 1050, 123456789, -1050] as const;
  const LRM = "\u200E";
  const WESTERN: readonly string[] = [
    `${LRI}${RIYAL} 0.00${PDI}`,
    `${LRI}${RIYAL} 0.01${PDI}`,
    `${LRI}${RIYAL} 0.99${PDI}`,
    `${LRI}${RIYAL} 1.00${PDI}`,
    `${LRI}${RIYAL} 10.50${PDI}`,
    `${LRI}${RIYAL} 1,234,567.89${PDI}`,
    `${LRI}${RIYAL} -10.50${PDI}`,
  ];
  const EXPECTED: Record<string, readonly string[]> = {
    ar: [...WESTERN.slice(0, -1), `${LRI}${RIYAL} ${LRM}-10.50${PDI}`],
    en: WESTERN,
    fr: WESTERN,
    tr: WESTERN,
  };

  for (const [locale, expected] of Object.entries(EXPECTED)) {
    it(`renders the fixture set for ${locale}`, () => {
      const got = FIXTURES.map((minor) => formatPrice(minor, { locale }));
      expect(got).toEqual(expected);
    });
  }
});
