"use client";

import * as React from "react";

import {
  countryLabel,
  DEFAULT_PHONE_COUNTRY,
  formatNational,
  parsePhone,
  phoneCountry,
  PICKER_PHONE_COUNTRIES,
  PINNED_PHONE_COUNTRIES,
  toE164,
  type PhoneCountry,
} from "../../lib/phone";
import { cn } from "../../lib/utils";
import { phoneFlagUrl } from "../../lib/phone-flags";
import { ChevronDownIcon } from "../icons/catalogue";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { FIELD_HEIGHT, FIELD_RADIUS } from "./field-chrome";
import { Icon } from "./icon";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { SEARCH_THRESHOLD } from "./select-tray";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";

/* The Sirdab phone field. Two boxes side by side: the country, an outline
   button showing the flag and "+966", then the Input that takes the number.
   Split rather than one box with the code inside it, so the code reads as a
   choice of its own and the number box holds only the number. The country
   box takes the field's own height and corner at every size, so the pair
   lines up as one row.

   VALUE IS E.164, ALWAYS (`+9665XXXXXXXX`). The caller never sees national
   digits, a trunk 0, or a country code it has to glue on: those are this
   component's problem, and everything downstream of a phone here (the OTP
   gateway, the customer dedupe key, the api) wants the same canonical
   string. An empty or half-typed field is "", never a bare `+966`.

   DIGITS STAY LATIN AND THE ROW DOES NOT MIRROR. A phone number is an
   identifier (foundation AGENTS §5): in Arabic the country box still sits
   left of the number and the digits still read left to right, which is how
   a Saudi reads their own number off a card. The number box is pinned
   `dir="ltr"`; the row keeps the page's direction and reverses in RTL, so
   the floating label, which is copy, sits on the reading side (the right,
   in Arabic). The country panel is portalled and keeps the document
   direction, so the list reads right to left in Arabic like every other
   menu.

   SAUDI IS THE DEFAULT [Sirdab], unless the caller knows better: a field for
   her own number passes `guessPhoneCountry`'s answer (the country she is
   in) as `country`. The list is every country we can text a code to
   (PICKER_PHONE_COUNTRIES, lib/phone.ts: the +1 islands fold into one +1
   row), the Gulf pinned on top and the rest by name in the reader's
   language.

   FLAGS ARE DRAWN, NOT EMOJI. The trigger reads the flag and "+966"; each
   row leads with its flag, then the country name and its code. An emoji
   flag is blank on Windows, so the marks are static SVGs served from the
   package, so the host bundler owns their asset URLs and base path. A country with no file simply shows no flag; the name and code
   still carry the row.

   THE LIST SEARCHES, by country name (in the reader's language), ISO code
   or dial code ("971", "+971"). It is a popover with a search header, and
   below md a bottom tray, the same split the Combobox makes. A Select
   could not do this: Radix's has no filter.

   INVALID NEVER COLOURS THE BOX, same as Input. `isValidE164` is exported
   from lib/phone for the caller's submit check; the error is destructive
   caption TEXT under the field. */

/* The country box is a Button at the field's height: the size whose
   padding and glyph scale suit that height, with the field's own height and
   radius classes on top so the two boxes always match (the default field
   grows on a coarse pointer, and the button follows it). */
const COUNTRY_SIZE = {
  sm: "default",
  md: "lg",
  default: "xl",
  search: "xl",
  touch: "touch",
} as const;

/* Below md the list is a bottom tray, not a popover a thumb cannot reach.
   Read when the panel opens, not tracked (the Combobox's rule).

   The tray follows the Select's (select-tray.tsx): it opens with nothing
   focused that raises the keyboard, offers a search only past
   SEARCH_THRESHOLD rows (the short country list fits without one), and its
   list is its own scroller that the sheet's drag-to-dismiss never claims,
   so a swipe through the countries scrolls them instead of closing the
   tray. On a phone, a search field focused on open brought the keyboard up
   over the list, and the first touch on the list dropped it again: the
   resize and the drag together closed the tray. */
const TRAY_QUERY = "(width < 48rem)";
const TRAY_SEARCH = PICKER_PHONE_COUNTRIES.length > SEARCH_THRESHOLD;

/* The Gulf first, in its own order, then every other country by its name
   in the reader's language: an alphabet of codes would put Afghanistan on
   top and scatter the Arab countries by their English initials. */
function orderedCountries(locale?: string): PhoneCountry[] {
  const pinned = new Set(PINNED_PHONE_COUNTRIES);
  const collator = new Intl.Collator(locale);
  return [
    ...PINNED_PHONE_COUNTRIES.map((code) => phoneCountry(code)),
    ...PICKER_PHONE_COUNTRIES.filter((entry) => !pinned.has(entry.code)).sort(
      (a, b) =>
        collator.compare(
          countryLabel(a.code, locale),
          countryLabel(b.code, locale),
        ),
    ),
  ];
}

/* Decorative: the name beside it is the label. A plain <img>, not
   next/image: the primitive cannot assume Next, and each file is under a
   kilobyte or two. */
function CountryFlag({ code }: { code: string }): React.JSX.Element {
  const [missing, setMissing] = React.useState(false);
  const src: string | undefined = phoneFlagUrl(code);
  if (missing || !src) return <></>;
  return (
    <img
      src={src}
      alt=""
      width={19}
      height={14}
      /* Two hundred rows, a dozen on screen: each flag loads when its
               row scrolls into view. */
      loading="lazy"
      decoding="async"
      className="h-3.5 w-auto shrink-0 rounded-xs"
      onError={() => setMissing(true)}
    />
  );
}

function CountryFace({
  code,
  dial,
}: {
  code: string;
  dial: string;
}): React.JSX.Element {
  return (
    <span dir="ltr" className="flex items-center gap-1.5">
      <CountryFlag code={code} />
      <span dir="ltr" className="latin">
        +{dial}
      </span>
    </span>
  );
}

/**
 * Usage:
 *
 *     const [phone, setPhone] = useState("");   // "+966551785151"
 *     <PhoneInput
 *         value={phone}
 *         onChange={setPhone}
 *         locale={locale}
 *         countryLabelText={t("country")}
 *         className="w-full"
 *     />
 *
 * `country` / `onCountryChange` are optional: left alone the selection
 * lives inside, seeded from `value` on mount (a stored `+971…` opens on
 * the UAE) and falling back to `defaultCountry`. Validate on submit with
 * `isValidE164(value, country)` from `@sirdab/one/lib/phone`.
 *
 * `contentClassName` reaches the country list (and its phone tray).
 * `className` is LAYOUT only (w-full in a form column). Every other prop
 * forwards to the inner field, so name, required, autoFocus and aria-* behave
 * exactly as they do on Input. The field's type, role and autoComplete are
 * fixed (a search field, autocomplete off) so no password manager offers
 * itself on a phone number.
 */
function PhoneInput({
  value,
  onChange,
  country: countryProp,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  onCountryChange,
  locale,
  countryLabelText,
  contentClassName,
  searchPlaceholder,
  emptyLabel,
  size = "default",
  disabled,
  inputClassName,
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "leading" | "leadingControl" | "type" | "dir"
> & {
  /** E.164, or "" when the field is empty. */
  value: string;
  /** Fires with E.164, or "" once the last digit goes. */
  onChange: (value: string) => void;
  /** Controlled ISO alpha-2 selection. Omit to let the field own it. */
  country?: string;
  /** Seed for the uncontrolled selection when `value` carries no hint. */
  defaultCountry?: string;
  onCountryChange?: (country: string) => void;
  /** BCP-47 tag for the country names. Falls back to the ISO codes. */
  locale?: string;
  /** Accessible name for the country trigger ("Country", "الدولة"). */
  countryLabelText?: string;
  /** The list's search placeholder. Falls back to `countryLabelText`. */
  searchPlaceholder?: string;
  /** Shown when a search matches no country. */
  emptyLabel?: string;
  /** Classes for the country list. It portals out of the field's tree, so
        a surface with its own theme scope hands the scope across here. */
  contentClassName?: string;
}): React.JSX.Element {
  /* Seeded once, on purpose: after the first keystroke `value` is always
       this country's E.164, so re-deriving would only echo state back. A
       caller that clears the form to "" keeps the country the user picked,
       which is what picking it meant. */
  const [ownCountry, setOwnCountry] = React.useState(
    () => parsePhone(value, defaultCountry).country,
  );
  const country = countryProp ?? ownCountry;
  const { dial } = phoneCountry(country);
  const text = formatNational(country, parsePhone(value, country).national);

  const selectCountry = (next: string): void => {
    if (countryProp == null) setOwnCountry(next);
    onCountryChange?.(next);
    // The digits the user typed stay theirs; only the prefix moved.
    onChange(toE164(next, parsePhone(value, next).national));
  };

  const [open, setOpen] = React.useState(false);
  const [tray, setTray] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  /* A pick hands focus to the number, the next thing she types. Radix
       would return it to the trigger, which lit the trigger's own ring
       beside the field's (two focus rings at once). Escape and an outside
       click still restore the trigger. */
  const pickedRef = React.useRef(false);
  const [query, setQuery] = React.useState("");

  const changeOpen = (next: boolean): void => {
    if (next) {
      setTray(
        typeof window.matchMedia === "function" &&
          window.matchMedia(TRAY_QUERY).matches,
      );
    } else {
      setQuery("");
    }
    setOpen(next);
  };

  /* Name in the reader's language, the ISO code, or the dial code with or
       without its plus. Ours rather than cmdk's, so the digits match as a
       prefix instead of anywhere in the name. */
  const ordered = React.useMemo(() => orderedCountries(locale), [locale]);
  const needle = query.trim().toLocaleLowerCase();
  const digits = needle.replace(/^\+/, "");
  const visible = needle
    ? ordered.filter(
        (entry) =>
          countryLabel(entry.code, locale)
            .toLocaleLowerCase()
            .includes(needle) ||
          entry.code.toLowerCase() === needle ||
          (/^\d+$/.test(digits) && entry.dial.startsWith(digits)),
      )
    : ordered;

  const countryPanel = (
    <Command
      shouldFilter={false}
      /* The highlight starts on the chosen country, not the list's
               first row: with Egypt chosen, a lit Saudi row read as the
               choice. */
      defaultValue={country}
      className={tray ? "min-h-0 flex-1" : undefined}
    >
      {tray && !TRAY_SEARCH ? null : (
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={searchPlaceholder ?? countryLabelText}
        />
      )}
      <CommandList
        data-vaul-no-drag={tray ? "" : undefined}
        className={
          tray
            ? "min-h-0 flex-1 touch-pan-y overscroll-contain pb-2"
            : undefined
        }
        style={tray ? { maxHeight: "none" } : undefined}
      >
        {visible.length === 0 ? (
          <CommandEmpty>{emptyLabel ?? "-"}</CommandEmpty>
        ) : null}
        <CommandGroup>
          {visible.map((entry) => (
            <CommandItem
              key={entry.code}
              value={entry.code}
              aria-checked={entry.code === country}
              onSelect={() => {
                pickedRef.current = true;
                selectCountry(entry.code);
                changeOpen(false);
              }}
              className={cn("aria-checked:font-medium", tray && "min-h-11")}
            >
              <CountryFlag code={entry.code} />
              <span className="min-w-0 flex-1 truncate">
                {countryLabel(entry.code, locale)}
              </span>
              {/* Latin and unmirrored: a dial code is an
                                identifier, like the number it prefixes. */}
              <span
                dir="ltr"
                className={cn(
                  "latin",
                  entry.code === country
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                +{entry.dial}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  /* Regrouping on every keystroke sends the caret to the end unless we
       put it back. Count the DIGITS before the caret, then walk that many
       digits into the regrouped string: separators shift under the caret
       without dragging it along. */
  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const el = e.currentTarget;
    const typed = el.value;
    /* Arabic-Indic digits count too: parsePhone turns them into Latin
           ones, but \D does not know they are digits, so a number typed on an
           Arabic keyboard counted none before the caret, the caret went to
           the start, and every next digit landed in front of the last. */
    const digitsBeforeCaret = typed
      .slice(0, el.selectionStart ?? typed.length)
      .replace(/[^\d\u0660-\u0669\u06f0-\u06f9]/g, "").length;

    // A pasted +971… retargets the selector instead of being mangled
    // into the current country's number.
    const parsed = parsePhone(typed, country);
    if (parsed.country === country) {
      onChange(toE164(country, parsed.national));
    } else {
      if (countryProp == null) setOwnCountry(parsed.country);
      onCountryChange?.(parsed.country);
      onChange(toE164(parsed.country, parsed.national));
    }

    const formatted = formatNational(parsed.country, parsed.national);
    if (typeof requestAnimationFrame === "undefined") return;
    requestAnimationFrame(() => {
      let seen = 0;
      let pos = digitsBeforeCaret === 0 ? 0 : formatted.length;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          seen++;
          if (seen === digitsBeforeCaret) {
            pos = i + 1;
            break;
          }
        }
      }
      try {
        el.setSelectionRange(pos, pos);
      } catch {
        // Some inputs refuse setSelectionRange; the caret is cosmetic.
      }
    });
  };

  const countryControl = (
    <>
      <Popover open={open && !tray} onOpenChange={changeOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            data-slot="phone-country-trigger"
            /* Pinned: the face is "+966" with its chevron after
                           it, whatever direction the page reads. */
            dir="ltr"
            variant="outline"
            size={COUNTRY_SIZE[size]}
            className={cn(
              FIELD_HEIGHT[size],
              FIELD_RADIUS[size],
              "shrink-0 gap-1.5",
            )}
            disabled={disabled}
            aria-label={countryLabelText}
            /* In tray mode the Popover is held shut, so Radix
                           would report it collapsed under an open sheet. */
            aria-expanded={open}
          >
            <CountryFace code={country} dial={dial} />
            <Icon icon={ChevronDownIcon} className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          onCloseAutoFocus={(event) => {
            if (!pickedRef.current) return;
            pickedRef.current = false;
            event.preventDefault();
            triggerRef.current
              ?.closest("[data-slot=phone-input]")
              ?.querySelector("input")
              ?.focus();
          }}
          /* The frost runs the whole panel: the search row is
                       solid by default (command.tsx) and, on the landing,
                       sat a different colour from the translucent glass
                       around it. */
          className={cn(
            "w-72 p-0 [&_[data-slot=command-input-wrapper]]:bg-transparent",
            contentClassName,
          )}
        >
          {tray ? null : countryPanel}
        </PopoverContent>
      </Popover>
      <Sheet side="bottom" open={open && tray} onOpenChange={changeOpen}>
        <SheetContent
          aria-describedby={undefined}
          className={contentClassName}
          /* Radix would focus the first tabbable, the search
                       field when there is one, and raise the keyboard
                       over the list. The panel takes focus instead, so
                       the arrow keys still reach the list. */
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            if (event.currentTarget instanceof HTMLElement)
              event.currentTarget.focus();
          }}
        >
          <SheetHeader>
            <SheetTitle>{countryLabelText ?? searchPlaceholder}</SheetTitle>
          </SheetHeader>
          {countryPanel}
        </SheetContent>
      </Sheet>
    </>
  );

  return (
    /* The identifier rule applied to ORDER as well as digits: the code
           sits left of the number in every language (reversed in RTL rather
           than pinned with dir, which the floating label would inherit and
           sit on the wrong side: the label is copy and reads from the
           page's start; only the digits are pinned, on the field). */
    <div
      data-slot="phone-input"
      className={cn("flex items-start gap-2 rtl:flex-row-reverse", className)}
    >
      {countryControl}
      <Input
        /* A phone number is not a credential, and the password
                   managers' inline menus (Bitwarden, 1Password, LastPass,
                   Dashlane) crowd a field she types from memory. Each reads
                   its own opt-out. */
        data-bwignore="true"
        data-1p-ignore="true"
        data-lpignore="true"
        data-form-type="other"
        {...props}
        dir="ltr"
        /* A search field, not type="tel", and after the spread so no
                   caller can undo it: the opt-out attributes above were not
                   enough, Bitwarden classifies a tel field by its label and
                   autocomplete hint and shows its menu anyway, while a search
                   field is the one kind every manager skips. The phone
                   keyboard comes from inputMode; role keeps it a plain text
                   box for a screen reader. (Same recipe as the studio's
                   private fields.) */
        type="search"
        role="textbox"
        autoComplete="off"
        inputMode="tel"
        size={size}
        disabled={disabled}
        className="min-w-0 flex-1"
        inputClassName={cn("latin", inputClassName)}
        value={text}
        onChange={onFieldChange}
      />
    </div>
  );
}

export { CountryFlag, PhoneInput };
