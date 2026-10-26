/* PhoneInput and its consumers share this E.164 parser and country table. */
import { GENERATED_PHONE_COUNTRIES } from "./phone-countries";

/* Arabic-Indic and Extended Arabic-Indic digits, which real keyboards
   produce; the same mapping as @sirdab/one/foundation's toWesternDigits, kept
   here so this package depends on nothing. */
function toWesternDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export type PhoneCountry = {
  /** ISO 3166-1 alpha-2, uppercase. Drives the flag and the label. */
  readonly code: string;
  /** Country calling code, no plus. */
  readonly dial: string;
  /** Display grouping of the national number, in digits per group. */
  readonly groups: readonly number[];
  /** National subscriber length bounds, inclusive. */
  readonly min: number;
  readonly max: number;
  /** Whether a national number is written with a trunk 0 to strip. */
  readonly trunkZero: boolean;
  /** Shares its dial code with a bigger country (+1, +44, +7): a pasted
        number with that code resolves to the bigger one unless this is the
        country already picked. */
  readonly shared?: boolean;
};

/* Saudi leads, then the GCC in dialling order, then the countries our
   merchants ship to and sell from most. */
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

/** Every country a code can be texted to: the served rows first, as
    written, then the rest of Twilio's list. */
export const DIALABLE_COUNTRIES: readonly PhoneCountry[] = [
  ...PHONE_COUNTRIES,
  ...GENERATED_PHONE_COUNTRIES.filter((c) => !SERVED.has(c.code)),
];

/** What the picker lists. The islands and territories that dial +1 (Puerto
    Rico, Jamaica, the Bahamas and the rest) fold into the one +1 row: their
    numbers are +1 numbers, and twenty identical "+1" rows read as a bug.
    Canada keeps its own row, being a country of its own size. */
export const PICKER_PHONE_COUNTRIES: readonly PhoneCountry[] =
  DIALABLE_COUNTRIES.filter(
    (c) => !(c.shared && c.dial === "1" && c.code !== "CA"),
  );

const IN_PICKER = new Set(PICKER_PHONE_COUNTRIES.map((c) => c.code));

/** The countries the picker lists first, in this order; the rest follow
    by name in the reader's language. */
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

/** Saudi is the default everywhere in the studio [Sirdab]. */
export const DEFAULT_PHONE_COUNTRY = "SA";

const BY_CODE = new Map(DIALABLE_COUNTRIES.map((c) => [c.code, c]));

/**
 * The country a phone field should open on for the person holding it: the
 * country they are in (`ipCountry`, from the edge) when it is one we can
 * text, else Saudi. Not the browser's language: an `en-US` browser is the
 * English default in Riyadh as much as in Ohio. Only a guess for a default:
 * the picker is right there, and a typed or pasted +code still wins.
 */
export function guessPhoneCountry(
  ipCountry: string | null | undefined,
): string {
  const ip = ipCountry?.trim().toUpperCase() ?? "";
  const country = BY_CODE.get(ip);
  if (!country) return DEFAULT_PHONE_COUNTRY;
  if (IN_PICKER.has(country.code)) return country.code;
  // A +1 island the picker folds away opens on the +1 row it folds into.
  return (
    BY_DIAL.find((c) => c.dial === country.dial)?.code ?? DEFAULT_PHONE_COUNTRY
  );
}

export function phoneCountry(code: string): PhoneCountry {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_PHONE_COUNTRY)!;
}

/**
 * The emoji flag, derived from the ISO code's two letters as regional
 * indicator symbols. No image assets and no icon package: the platform
 * font draws it, and where it cannot (Windows ships no flag glyphs) the
 * dial code beside it is what carries the meaning, so the control still
 * reads. Returns "" for anything that is not two ASCII letters.
 */
export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  const OFFSET = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((ch) => ch.charCodeAt(0) + OFFSET),
  );
}

/**
 * The country's name in the reader's language, from the runtime's CLDR
 * data. Country names are the one string set a primitive can localise
 * without carrying copy (UI AGENTS: i18n-free primitives), because the
 * platform already ships them in every locale we serve. Falls back to the
 * ISO code on a runtime without DisplayNames.
 */
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

/** Longest dial code first, so +971 never matches as +9 then 71. Only
    the main country of a shared code: +1 is the US, +44 Britain. */
const BY_DIAL = DIALABLE_COUNTRIES.filter((c) => !c.shared).sort(
  (a, b) => b.dial.length - a.dial.length,
);

export type ParsedPhone = {
  /** The country the input resolved to. */
  country: string;
  /** National subscriber digits, no trunk 0, no country code. */
  national: string;
};

/**
 * Collapse anything a user can produce into (country, national digits):
 * a pasted `+966 55 178 5151`, a local `0551785151`, an autofilled
 * `966551785151`, Arabic-Indic `٠٥٥١٧٨٥١٥١`, or a half-typed `55`.
 *
 * An explicit international prefix (`+` or `00`) picks the country; bare
 * digits stay in `fallback`, because `1234…` is a London landline in GB
 * and a subscriber number everywhere else, and guessing is worse than
 * honouring the selector the user is looking at.
 */
export function parsePhone(raw: string, fallback: string): ParsedPhone {
  const western = toWesternDigits(raw ?? "");
  const international = /^\s*(?:\+|00)/.test(western);
  const digits = western.replace(/\D/g, "");
  if (digits === "") return { country: fallback, national: "" };

  if (international) {
    const body = digits.replace(/^00/, "");
    const picked = phoneCountry(fallback);
    const main = BY_DIAL.find((c) => body.startsWith(c.dial));
    /* A shared code keeps the country she picked: +1 with Canada
           selected stays Canada rather than jumping to the US. */
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

  /* A bare number that opens with the selected country's own dial code
       is an autofill or a copy-paste that lost its plus (`966551785151`),
       but only when what remains could BE a subscriber number: `9665`
       typed digit by digit in KSA is the start of a real 966-5 number. */
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

/** Group the national number for display: `55 178 5151` in Saudi. */
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

/**
 * Saudi keeps its exact rule (every mobile is `5XXXXXXXX`) because the
 * whole studio dedupes customers and sends OTPs on it. Everywhere else is
 * a length range on purpose: a fake-precise per-operator regex goes stale
 * the week a regulator opens a new prefix, and rejecting a real number is
 * worse than accepting a typo the SMS gateway will bounce.
 */
export function isValidNational(code: string, national: string): boolean {
  if (!/^\d*$/.test(national)) return false;
  if (code === "SA") return /^5\d{8}$/.test(national);
  const { min, max } = phoneCountry(code);
  return national.length >= min && national.length <= max;
}

/** `+9665XXXXXXXX`. Empty national digits give "", never a bare `+966`. */
export function toE164(code: string, national: string): string {
  return national === "" ? "" : `+${phoneCountry(code).dial}${national}`;
}

/** True when `value` is a complete, dialable E.164 number. */
export function isValidE164(value: string, fallback: string): boolean {
  const { country, national } = parsePhone(value, fallback);
  return isValidNational(country, national);
}
