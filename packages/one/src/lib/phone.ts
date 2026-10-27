import { GENERATED_PHONE_COUNTRIES } from "./phone-countries";

function toWesternDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export type PhoneCountry = {
  readonly code: string;

  readonly dial: string;

  readonly groups: readonly number[];

  readonly min: number;
  readonly max: number;

  readonly trunkZero: boolean;

  readonly shared?: boolean;
};

export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  {
    code: "SA",
    dial: "966",
    groups: [2, 3, 4],
    min: 9,
    max: 9,
    trunkZero: true,
  },
  {
    code: "AE",
    dial: "971",
    groups: [2, 3, 4],
    min: 8,
    max: 9,
    trunkZero: true,
  },
  {
    code: "KW",
    dial: "965",
    groups: [4, 4],
    min: 8,
    max: 8,
    trunkZero: false,
  },
  {
    code: "BH",
    dial: "973",
    groups: [4, 4],
    min: 8,
    max: 8,
    trunkZero: false,
  },
  {
    code: "QA",
    dial: "974",
    groups: [4, 4],
    min: 8,
    max: 8,
    trunkZero: false,
  },
  {
    code: "OM",
    dial: "968",
    groups: [4, 4],
    min: 8,
    max: 8,
    trunkZero: false,
  },
  {
    code: "EG",
    dial: "20",
    groups: [3, 3, 4],
    min: 8,
    max: 10,
    trunkZero: true,
  },
  {
    code: "JO",
    dial: "962",
    groups: [2, 3, 4],
    min: 8,
    max: 9,
    trunkZero: true,
  },
  {
    code: "TR",
    dial: "90",
    groups: [3, 3, 4],
    min: 10,
    max: 10,
    trunkZero: true,
  },
  {
    code: "GB",
    dial: "44",
    groups: [4, 6],
    min: 9,
    max: 10,
    trunkZero: true,
  },
  {
    code: "US",
    dial: "1",
    groups: [3, 3, 4],
    min: 10,
    max: 10,
    trunkZero: false,
  },
];

const SERVED = new Set(PHONE_COUNTRIES.map((c) => c.code));

export const DIALABLE_COUNTRIES: readonly PhoneCountry[] = [
  ...PHONE_COUNTRIES,
  ...GENERATED_PHONE_COUNTRIES.filter((c) => !SERVED.has(c.code)),
];

export const PICKER_PHONE_COUNTRIES: readonly PhoneCountry[] =
  DIALABLE_COUNTRIES.filter(
    (c) => !(c.shared && c.dial === "1" && c.code !== "CA"),
  );

const IN_PICKER = new Set(PICKER_PHONE_COUNTRIES.map((c) => c.code));

export const PINNED_PHONE_COUNTRIES: readonly string[] = [
  "SA",
  "AE",
  "KW",
  "BH",
  "QA",
  "OM",
  "EG",
  "JO",
];

export const DEFAULT_PHONE_COUNTRY = "SA";

const BY_CODE = new Map(DIALABLE_COUNTRIES.map((c) => [c.code, c]));

export function guessPhoneCountry(
  ipCountry: string | null | undefined,
): string {
  const ip = ipCountry?.trim().toUpperCase() ?? "";
  const country = BY_CODE.get(ip);
  if (!country) return DEFAULT_PHONE_COUNTRY;
  if (IN_PICKER.has(country.code)) return country.code;

  return (
    BY_DIAL.find((c) => c.dial === country.dial)?.code ?? DEFAULT_PHONE_COUNTRY
  );
}

export function phoneCountry(code: string): PhoneCountry {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_PHONE_COUNTRY)!;
}

export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  const OFFSET = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((ch) => ch.charCodeAt(0) + OFFSET),
  );
}

export function countryLabel(code: string, locale?: string): string {
  try {
    return (
      new Intl.DisplayNames([locale ?? "en"], { type: "region" }).of(code) ??
      code
    );
  } catch {
    return code;
  }
}

const BY_DIAL = DIALABLE_COUNTRIES.filter((c) => !c.shared).sort(
  (a, b) => b.dial.length - a.dial.length,
);

export type ParsedPhone = {
  country: string;

  national: string;
};

export function parsePhone(raw: string, fallback: string): ParsedPhone {
  const western = toWesternDigits(raw ?? "");
  const international = /^\s*(?:\+|00)/.test(western);
  const digits = western.replace(/\D/g, "");
  if (digits === "") return { country: fallback, national: "" };

  if (international) {
    const body = digits.replace(/^00/, "");
    const picked = phoneCountry(fallback);
    const main = BY_DIAL.find((c) => body.startsWith(c.dial));

    const hit =
      main && picked.dial === main.dial && body.startsWith(picked.dial)
        ? picked
        : main;
    if (hit)
      return {
        country: hit.code,
        national: trim(hit, body.slice(hit.dial.length)),
      };
    return {
      country: fallback,
      national: trim(phoneCountry(fallback), body),
    };
  }

  const country = phoneCountry(fallback);
  if (digits.startsWith(country.dial)) {
    const rest = digits.slice(country.dial.length);
    if (rest.length >= country.min) {
      return { country: country.code, national: trim(country, rest) };
    }
  }
  return { country: country.code, national: trim(country, digits) };
}

function trim(country: PhoneCountry, national: string): string {
  const stripped = country.trunkZero ? national.replace(/^0+/, "") : national;
  return stripped.slice(0, country.max);
}

export function formatNational(code: string, national: string): string {
  const { groups } = phoneCountry(code);
  const out: string[] = [];
  let rest = national;
  for (const size of groups) {
    if (rest === "") break;
    out.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  if (rest !== "") out.push(rest);
  return out.join(" ");
}

export function isValidNational(code: string, national: string): boolean {
  if (!/^\d*$/.test(national)) return false;
  if (code === "SA") return /^5\d{8}$/.test(national);
  const { min, max } = phoneCountry(code);
  return national.length >= min && national.length <= max;
}

export function toE164(code: string, national: string): string {
  return national === "" ? "" : `+${phoneCountry(code).dial}${national}`;
}

export function isValidE164(value: string, fallback: string): boolean {
  const { country, national } = parsePhone(value, fallback);
  return isValidNational(country, national);
}
