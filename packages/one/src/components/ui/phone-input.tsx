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

const COUNTRY_SIZE = {
  sm: "default",
  md: "lg",
  default: "xl",
  search: "xl",
  touch: "touch",
} as const;

const TRAY_QUERY = "(width < 48rem)";
const TRAY_SEARCH = PICKER_PHONE_COUNTRIES.length > SEARCH_THRESHOLD;

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
  value: string;

  onChange: (value: string) => void;

  country?: string;

  defaultCountry?: string;
  onCountryChange?: (country: string) => void;

  locale?: string;

  countryLabelText?: string;

  searchPlaceholder?: string;

  emptyLabel?: string;

  contentClassName?: string;
}): React.JSX.Element {
  const [ownCountry, setOwnCountry] = React.useState(
    () => parsePhone(value, defaultCountry).country,
  );
  const country = countryProp ?? ownCountry;
  const { dial } = phoneCountry(country);
  const text = formatNational(country, parsePhone(value, country).national);

  const selectCountry = (next: string): void => {
    if (countryProp == null) setOwnCountry(next);
    onCountryChange?.(next);

    onChange(toE164(next, parsePhone(value, next).national));
  };

  const [open, setOpen] = React.useState(false);
  const [tray, setTray] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

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

  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const el = e.currentTarget;
    const typed = el.value;

    const digitsBeforeCaret = typed
      .slice(0, el.selectionStart ?? typed.length)
      .replace(/[^\d\u0660-\u0669\u06f0-\u06f9]/g, "").length;

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
      } catch {}
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
    <div
      data-slot="phone-input"
      className={cn("flex items-start gap-2 rtl:flex-row-reverse", className)}
    >
      {countryControl}
      <Input
        data-bwignore="true"
        data-1p-ignore="true"
        data-lpignore="true"
        data-form-type="other"
        {...props}
        dir="ltr"

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
