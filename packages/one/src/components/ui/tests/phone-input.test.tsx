import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhoneInput } from "../phone-input";

function Harness({
  initial = "",
  onValue,
  ...rest
}: {
  initial?: string;
  onValue?: (value: string) => void;
} & Partial<React.ComponentProps<typeof PhoneInput>>): React.JSX.Element {
  const [value, setValue] = React.useState(initial);
  return (
    <PhoneInput
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
      aria-label="phone"
    />
  );
}

const field = (): HTMLInputElement =>
  screen.getByLabelText("phone") as HTMLInputElement;

const trigger = (): HTMLElement => {
  const el = document.querySelector('[data-slot="phone-country-trigger"]');
  if (!(el instanceof HTMLElement)) throw new Error("no country trigger");
  return el;
};

describe("PhoneInput default and display", () => {
  it("tells the password managers to leave it alone", () => {
    render(<Harness />);
    const input = field();
    expect(input.dataset.bwignore).toBe("true");
    expect(input.dataset["1pIgnore"]).toBe("true");
    expect(input.dataset.lpignore).toBe("true");
    expect(input.dataset.formType).toBe("other");
  });

  it("opens on Saudi and shows the dial code alone as the face", () => {
    render(<Harness />);
    expect(field().value).toBe("");
    // Flags are out by ruling: the dial code is the whole face.
    expect(trigger().textContent).toBe("+966");
  });

  it("renders a stored E.164 number as grouped national digits", () => {
    render(<Harness initial="+966551785151" />);
    expect(field().value).toBe("55 178 5151");
  });

  it("seeds the country from a stored non-Saudi number", () => {
    render(<Harness initial="+971501234567" />);
    expect(trigger().textContent).toContain("+971");
    expect(field().value).toBe("50 123 4567");
  });

  it("keeps the box unmirrored and the digits Latin", () => {
    render(<Harness />);
    expect(field().getAttribute("dir")).toBe("ltr");
    expect(field().className).toContain("latin");
    // The BOX, not only the field: on an RTL page the flex row is what
    // decides whether +966 sits before or after the digits.
    expect(
      field().closest('[data-slot="input-wrapper"]')?.getAttribute("dir"),
    ).toBe("ltr");
  });
});

describe("PhoneInput in Arabic", () => {
  /* Radix stamps the document's direction on the Select trigger, which
       beats the box's inherited ltr: in Arabic the trigger read "966+" with
       its chevron first. The trigger and the code are pinned themselves. */
  it("keeps the country trigger and its +966 left to right on an RTL page", async () => {
    const { Direction } = await import("radix-ui");
    render(
      <div dir="rtl">
        <Direction.Provider dir="rtl">
          <Harness />
        </Direction.Provider>
      </div>,
    );
    expect(trigger().getAttribute("dir")).toBe("ltr");
    // Innermost match: the face wraps the code in a span of its own.
    const code = [...trigger().querySelectorAll("span")]
      .filter((span) => span.textContent === "+966")
      .at(-1);
    expect(code?.getAttribute("dir")).toBe("ltr");
  });
});

describe("PhoneInput value contract", () => {
  it("emits E.164 as the user types", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.change(field(), { target: { value: "551785151" } });
    expect(onValue).toHaveBeenLastCalledWith("+966551785151");
  });

  it("normalises a pasted local number with a trunk zero", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.change(field(), { target: { value: "0551785151" } });
    expect(onValue).toHaveBeenLastCalledWith("+966551785151");
    expect(field().value).toBe("55 178 5151");
  });

  it("normalises a pasted international number with spaces", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.change(field(), { target: { value: "+966 55 178 5151" } });
    expect(onValue).toHaveBeenLastCalledWith("+966551785151");
  });

  /* A Saudi keyboard produces Arabic-Indic digits, and the phone is a
       dedupe key and an OTP target: it has to leave in Latin every time. */
  it("converts Arabic-Indic digits", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.change(field(), { target: { value: "٠٥٥١٧٨٥١٥١" } });
    expect(onValue).toHaveBeenLastCalledWith("+966551785151");
    expect(field().value).toBe("55 178 5151");
  });

  it("emits an empty string rather than a bare dial code", () => {
    const onValue = vi.fn();
    render(<Harness initial="+966551785151" onValue={onValue} />);
    fireEvent.change(field(), { target: { value: "" } });
    expect(onValue).toHaveBeenLastCalledWith("");
  });

  it("retargets the country when a foreign number is pasted in", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.change(field(), { target: { value: "+971 50 123 4567" } });
    expect(onValue).toHaveBeenLastCalledWith("+971501234567");
    expect(trigger().textContent).toContain("+971");
  });
});

function openCountries(): HTMLElement[] {
  fireEvent.click(trigger());
  return screen.getAllByRole("option");
}

describe("PhoneInput country selection", () => {
  it("lists the countries Saudi-first, each with its dial code", () => {
    render(<Harness locale="ar" />);
    const options = openCountries();
    // Every country we can text, with the +1 islands folded into one row.
    expect(options.length).toBeGreaterThan(190);
    expect(
      options.filter((option) => option.textContent?.endsWith("+1")),
    ).toHaveLength(2);
    expect(options[0].textContent).toContain("+966");
    // Country names come from the runtime's CLDR data, so the primitive
    // carries no copy of its own (UI AGENTS: i18n-free primitives).
    expect(options[0].textContent).toContain("سعود");
  });

  it("re-prefixes the digits already typed when the country changes", () => {
    const onValue = vi.fn();
    render(<Harness initial="+966551785151" onValue={onValue} />);
    const uae = openCountries()[1];
    fireEvent.click(uae);
    expect(onValue).toHaveBeenLastCalledWith("+971551785151");
    expect(trigger().textContent).toContain("+971");
  });

  it("honours a controlled country over its own state", () => {
    const onValue = vi.fn();
    render(
      <PhoneInput
        aria-label="controlled"
        value="+971501234567"
        onChange={onValue}
        country="AE"
      />,
    );
    const controlled = screen.getByLabelText("controlled") as HTMLInputElement;
    expect(controlled.value).toBe("50 123 4567");
  });
});

/* Typing into the search re-filters every country row at once, which a busy
   CI runner has taken past the 5s default twice (PR #672 and its merge). */
describe("PhoneInput flags and search", { timeout: 20_000 }, () => {
  it("draws a flag from /flags on the trigger and on every row", () => {
    render(<Harness locale="en" />);
    expect(trigger().querySelector("img")?.getAttribute("src")).toBe(
      "/flags/sa.svg",
    );
    for (const option of openCountries()) {
      expect(option.querySelector("img")?.getAttribute("src")).toMatch(
        /^\/flags\/[a-z]{2}\.svg$/,
      );
    }
  });

  it("searches by country name, ISO code and dial code", () => {
    render(<Harness locale="en" />);
    openCountries();
    const search = screen.getByRole("combobox");
    const rows = (): string[] =>
      screen.queryAllByRole("option").map((o) => o.textContent ?? "");

    fireEvent.change(search, { target: { value: "emir" } });
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain("+971");

    fireEvent.change(search, { target: { value: "+96" } });
    expect(rows().every((row) => /\+96\d/.test(row))).toBe(true);
    expect(rows().length).toBeGreaterThan(1);

    fireEvent.change(search, { target: { value: "xyz" } });
    expect(rows()).toHaveLength(0);
  });

  /* \D does not know Arabic-Indic digits: counting the digits before the
       caret read zero, the caret jumped to the start, and a number typed one
       digit at a time on an Arabic keyboard came out reversed. */
  it("puts the caret after Arabic-Indic digits, not at the start", async () => {
    render(<Harness />);
    const input = field();
    input.focus();
    fireEvent.change(input, {
      target: { value: "٥٥١٧٨", selectionStart: 5, selectionEnd: 5 },
    });
    await vi.waitFor(() => expect(input.value).toBe("55 178"));
    await vi.waitFor(() => expect(input.selectionStart).toBe(6));
  });

  it("hands focus to the number after a pick, not back to the trigger", async () => {
    render(<Harness initial="+966551785151" />);
    openCountries();
    fireEvent.click(screen.getAllByRole("option")[1]);
    await vi.waitFor(() => expect(document.activeElement).toBe(field()));
    expect(document.activeElement).not.toBe(trigger());
  });

  it("closes the list and keeps the digits when a search result is picked", () => {
    const onValue = vi.fn();
    render(<Harness initial="+966551785151" onValue={onValue} />);
    openCountries();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "971" },
    });
    fireEvent.click(screen.getByRole("option"));
    expect(onValue).toHaveBeenLastCalledWith("+971551785151");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("names the country and its dial code on each row", () => {
    render(<Harness locale="en" />);
    const [saudi] = openCountries();
    expect(saudi.textContent).toContain("Saudi Arabia");
    expect(saudi.textContent).toContain("+966");
  });

  /* A panel portals out of whatever theme scope the field sits in, so the
       caller hands the scope across with the list. */
  it("lands contentClassName on the country list", () => {
    render(<Harness contentClassName="landing-theme font-sans" />);
    openCountries();
    const content = document.querySelector('[data-slot="popover-content"]');
    expect(content?.className).toContain("landing-theme");
    expect(content?.className).toContain("font-sans");
  });
});

describe("PhoneInput composition", () => {
  /* Two boxes, side by side: the country is its own outline control
       beside the number, not a slot inside the number's box. */
  it("puts the country control beside the input box, not inside it", () => {
    render(<Harness />);
    const box = field().closest('[data-slot="input-wrapper"]');
    expect(
      box?.querySelector('[data-slot="phone-country-trigger"]'),
    ).toBeNull();
    const row = field().closest('[data-slot="phone-input"]');
    expect(
      row?.querySelector('[data-slot="phone-country-trigger"]'),
    ).not.toBeNull();
  });

  /* The label is copy and reads from the page's start; only the digits
       are pinned. A dir on the row put an Arabic label on the left. */
  it("pins the number box ltr but leaves the row in the page's direction", () => {
    render(<Harness />);
    const row = field().closest('[data-slot="phone-input"]');
    expect(row?.hasAttribute("dir")).toBe(false);
    expect(row?.className).toContain("rtl:flex-row-reverse");
    expect(
      field().closest('[data-slot="input-wrapper"]')?.getAttribute("dir"),
    ).toBe("ltr");
  });

  /* FND-16: the 36px face is not a 36px target. The ghost trigger inherits
       buttonVariants' base, which paints a 44px hit area around it; pin it so
       a refactor of the trigger cannot quietly drop it. */
  it("keeps a 44px hit area on the country face at the touch size", () => {
    render(<Harness size="touch" />);
    expect(trigger().className).toContain("relative");
    expect(trigger().className).toContain("touch-target");
  });

  it("draws the country as an outline box at the field's own height", () => {
    render(<Harness />);
    expect(trigger().getAttribute("data-variant")).toBe("outline");
    expect(trigger().getAttribute("data-size")).toBe("xl");
    expect(trigger().className).toContain("h-control-xl");
  });
});

/* Below md the country list is a bottom tray. On a phone a search field
   focused on open raised the keyboard over the list, and a swipe through
   the countries was taken by the sheet's drag and closed it. */
describe("PhoneInput's country tray on a phone", () => {
  const realMatchMedia = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: query === "(width < 48rem)",
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  /* Two hundred countries need a search, but it waits for a tap: focused
       on open, it raised the keyboard over the list. */
  it("opens with its search unfocused, so no keyboard comes up", async () => {
    render(<Harness countryLabelText="Country" />);
    fireEvent.click(trigger());
    const tray = await screen.findByRole("dialog");
    expect(tray.querySelector("input")).not.toBeNull();
    expect(document.activeElement?.tagName).not.toBe("INPUT");
  });

  it("keeps a swipe through the list from dragging the tray shut", async () => {
    render(<Harness countryLabelText="Country" />);
    fireEvent.click(trigger());
    const tray = await screen.findByRole("dialog");
    const list = tray.querySelector("[cmdk-list]");
    expect(list?.hasAttribute("data-vaul-no-drag")).toBe(true);
    expect(list?.className).toContain("overscroll-contain");
  });
});
