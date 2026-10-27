import { describe, expect, it } from "vitest";

import {
  countryLabel,
  flagEmoji,
  formatNational,
  isValidE164,
  isValidNational,
  parsePhone,
  toE164,
} from "../phone";

describe("parsePhone", () => {
  it("collapses every shape of a Saudi number onto the same national digits", () => {
    for (const raw of [
      "+966 55 178 5151",
      "+966551785151",
      "00966551785151",
      "966551785151",
      "0551785151",
      "551785151",
      "55 178 5151",
    ]) {
      expect(parsePhone(raw, "SA")).toEqual({
        country: "SA",
        national: "551785151",
      });
    }
  });

  it("reads Arabic-Indic and Persian digits", () => {
    expect(parsePhone("٠٥٥١٧٨٥١٥١", "SA").national).toBe("551785151");
    expect(parsePhone("۰۵۵۱۷۸۵۱۵۱", "SA").national).toBe("551785151");
  });

  it("retargets the country when the input carries a different prefix", () => {
    expect(parsePhone("+971501234567", "SA")).toEqual({
      country: "AE",
      national: "501234567",
    });
    expect(parsePhone("+15551234567", "SA")).toEqual({
      country: "US",
      national: "5551234567",
    });
  });

  it("keeps bare digits in the selected country", () => {
    expect(parsePhone("15551234567", "SA").country).toBe("SA");
  });

  it("treats a bare country code as a prefix only once a number follows", () => {
    expect(parsePhone("9665", "SA").national).toBe("9665");
    expect(parsePhone("966551785151", "SA").national).toBe("551785151");
  });

  it("strips a trunk zero only where one exists", () => {
    expect(parsePhone("0501234567", "AE").national).toBe("501234567");

    expect(parsePhone("+96550123456", "SA")).toEqual({
      country: "KW",
      national: "50123456",
    });
  });

  it("caps at the country's longest national number", () => {
    expect(parsePhone("55178515199999", "SA").national).toBe("551785151");
  });

  it("returns the fallback country and no digits for empty input", () => {
    expect(parsePhone("", "SA")).toEqual({ country: "SA", national: "" });
    expect(parsePhone("   ", "AE")).toEqual({
      country: "AE",
      national: "",
    });
  });
});

describe("formatNational", () => {
  it("groups Saudi 2-3-4 and never pads a partial number", () => {
    expect(formatNational("SA", "551785151")).toBe("55 178 5151");
    expect(formatNational("SA", "55")).toBe("55");
    expect(formatNational("SA", "5517")).toBe("55 17");
    expect(formatNational("SA", "")).toBe("");
  });

  it("uses each country's own grouping", () => {
    expect(formatNational("KW", "50123456")).toBe("5012 3456");
    expect(formatNational("US", "5551234567")).toBe("555 123 4567");
  });
});

describe("isValidNational", () => {
  it("holds Saudi to the exact mobile shape", () => {
    expect(isValidNational("SA", "551785151")).toBe(true);
    expect(isValidNational("SA", "51785151")).toBe(false);

    expect(isValidNational("SA", "112345678")).toBe(false);
  });

  it("validates other countries on length, not a fake-precise regex", () => {
    expect(isValidNational("AE", "501234567")).toBe(true);
    expect(isValidNational("AE", "5012345")).toBe(false);
    expect(isValidNational("KW", "50123456")).toBe(true);
    expect(isValidNational("TR", "5321234567")).toBe(true);
    expect(isValidNational("TR", "532123456")).toBe(false);
  });
});

describe("toE164", () => {
  it("emits the canonical string and nothing for an empty field", () => {
    expect(toE164("SA", "551785151")).toBe("+966551785151");
    expect(toE164("AE", "501234567")).toBe("+971501234567");

    expect(toE164("SA", "")).toBe("");
  });

  it("round-trips whatever parsePhone produced", () => {
    const { country, national } = parsePhone("0551785151", "SA");
    expect(toE164(country, national)).toBe("+966551785151");
  });
});

describe("isValidE164", () => {
  it("accepts a complete number and rejects a half-typed one", () => {
    expect(isValidE164("+966551785151", "SA")).toBe(true);
    expect(isValidE164("+96655178", "SA")).toBe(false);
    expect(isValidE164("", "SA")).toBe(false);
    expect(isValidE164("+971501234567", "SA")).toBe(true);
  });
});

describe("flagEmoji", () => {
  it("derives the regional-indicator pair from the ISO code", () => {
    expect(flagEmoji("SA")).toBe("\u{1F1F8}\u{1F1E6}");
    expect(flagEmoji("sa")).toBe(flagEmoji("SA"));
  });

  it("returns nothing for anything that is not two letters", () => {
    expect(flagEmoji("S")).toBe("");
    expect(flagEmoji("966")).toBe("");
    expect(flagEmoji("")).toBe("");
  });
});

describe("countryLabel", () => {
  it("names the country in the reader's language", () => {
    expect(countryLabel("SA", "en")).toBe("Saudi Arabia");
    expect(countryLabel("SA", "ar")).toContain("سعود");
  });

  it("falls back to the ISO code on a bad locale", () => {
    expect(countryLabel("SA", "not a locale")).toBe("SA");
  });
});
