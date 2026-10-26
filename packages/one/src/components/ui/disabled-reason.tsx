import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/* NOT a client module on purpose: `refusalProps` is a plain function
   and Textarea renders on the server, so a "use client" directive here
   would break its prerender ("attempted to call refusalProps() from the
   server"). The JSX below returns a client component, which a server
   component may render freely. The control shape returns an onClick,
   so only client components may ask for it; every control that can
   (checkbox, radio, switch, segmented item, button) already is one.

   REFUSAL, in one place. Anything unavailable says WHY (see TOKENS.md,
   "Explaining a terse control"), and saying why has a mechanical cost
   that every control pays the same way. This module is that cost,
   written once, so six components cannot drift into six dialects of it.

   The problem: the HTML `disabled` attribute drops an element from the
   tab order AND suppresses hover, which are the only two ways anyone
   would go looking for the explanation. A tooltip on a really-disabled
   control never opens. So a control WITH a reason is aria-disabled
   instead: announced disabled, still focusable, still hoverable, with
   activation blocked in a handler.

   That escape from `disabled` has a side effect worth knowing about: the
   base pointer-cursor rule keys off `:disabled`, so a refused control
   sailed straight past it and advertised a pointer while refusing every
   click (fixed in foundation's tailwind.css, guard-tested). The rule now
   excludes aria-disabled on both selectors. If you add a refusable
   control, check its cursor: a pointer is a promise, and this pattern is
   the one place a control can look clickable while it is not.

   Blocking differs by control, hence two shapes:

   CONTROL (checkbox, radio, switch, segmented item, button): a click
   guard. Space and Enter both dispatch a click on a button, so one
   handler covers pointer and keyboard. Radix composes our handler
   BEFORE its own and skips its internal one once the event is
   defaultPrevented, which is what stops the state actually toggling.

   FIELD (input, textarea): readOnly. aria-disabled alone would still
   accept typing; readOnly is the only thing that stops editing while
   keeping the field focusable, which is also why Input already treats
   readOnly as a first-class state.

   A control with no reason keeps the real `disabled` attribute. There
   is nothing to reach for, so nothing needs reaching. */

const block = (event: React.SyntheticEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

type Refusal = {
  "aria-disabled"?: true;
  readOnly?: true;
  onClick?: (event: React.MouseEvent) => void;
};

/**
 * Props that make a control refuse while staying reachable. Spread them
 * LAST so they win over a caller's own handlers.
 */
export function refusalProps(
  reason: React.ReactNode | undefined,
  kind: "control" | "field" = "control",
): Refusal {
  if (reason == null) return {};
  return kind === "field"
    ? { "aria-disabled": true, readOnly: true }
    : { "aria-disabled": true, onClick: block };
}

/**
 * Put the reason one hover (or one tab) away.
 *
 * The trigger goes on a WRAPPER, never on the control via asChild:
 * Radix Tooltip publishes its own data-state and asChild would merge it
 * onto the control, overwriting data-state="checked" / "on" / "open",
 * which every checked, inverted and open style in the system selects
 * on. Focus events bubble, so the keyboard path survives the wrapper.
 */
export function withDisabledReason(
  control: React.ReactNode,
  reason: React.ReactNode | undefined,
  className = "inline-flex",
): React.ReactNode {
  if (reason == null) return control;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{control}</span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}
