"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cn } from "../../lib/utils";

/* A fixed-length code, one character per box.
 *
 * For a value whose LENGTH is part of its meaning: a national address is
 * always four letters then four digits, and a plain input asks the merchant
 * to count characters themselves. The boxes do the counting.
 *
 * Deliberately not called an OTP here beyond the imported primitive's own
 * name: nothing about it is one-time. The caller supplies `pattern`,
 * `inputMode` and `autoComplete`, because a one-time-code field and an
 * address code want opposite answers on all three (offering a merchant their
 * SMS codes while they type a street address is the failure this avoids).
 */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}): React.JSX.Element {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex w-full items-center has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      /* No password-manager badge accommodation, and no polling for one.
               The comment above already says this control is not a one-time code
               by default, so widening it for a badge answers a question nobody
               asked. `none` also stops input-otp arming a 0ms/2s/5s/6s timer
               chain plus a 1s interval whenever the field has focus, each tick
               calling setState: under jsdom a chain armed by a focused field
               outlived its own environment and surfaced as "window is not
               defined" from inside react-dom, with every test passing and the
               run still exiting 1. Before the spread, so a caller who wants the
               accommodation can ask. */
      pushPasswordManagerStrategy="none"
      {...props}
    />
  );
}

function InputOTPGroup({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex w-full items-center gap-1.5", className)}
      {...props}
    />
  );
}

/* One cell, a box of its own with the house Input's border. Not joined into
   one strip: a joined row shares each border with the neighbour, so the
   focused cell drew its ring on three sides and borrowed a gray fourth, and
   read as a box with uneven walls. */
function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}): React.JSX.Element {
  const context = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = context?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "h-control-xl border-input text-body relative flex min-w-0 flex-1 items-center justify-center rounded-lg border text-foreground uppercase transition-colors duration-100 outline-none",
        "data-[active=true]:border-ring data-[active=true]:ring-input-focus",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-5 w-px bg-foreground" />
        </div>
      ) : null}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };
