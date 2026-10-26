"use client";

/* Client component: the loading click-guard attaches a DOM handler.
   Server pages keep importing it as before. It just hydrates. */
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import { LoaderIcon } from "../icons/general";
import { buttonVariants } from "./button-variants";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/* The Sirdab button. One component, every action in the product.

   Variants (pick by role, never restyle at the call site):
     default      THE action. Ink fill; one per view.
     secondary    the workhorse. Bordered; border and fill step one alpha
                  rung together on interaction (200→300, 0→50→100).
     outline      secondary on a transparent base (for tinted surfaces).
     ghost        icon-only actions, toolbars, inside inputs. Never a
                  border; fills one rung deeper (100→200).
     chip         filters and toggles. Static border, ghost fills; the
                  QUIET one: label at secondary, icon at icon-quiet
                  rising to the label's tone on hover, never past it.
                  Every other variant's icon is currentColor, matching
                  its label.
     destructive  red outline + red washes, never a red fill. Reserved for
                  catastrophic confirmations (delete store / account).
     link         inline text action; no box at any size.

   State machine (all variants): hover steps one rung, active / open / on
   one more. Disabled is a solid pair: pointer events stay on so the
   cursor reads, and the hover/active variants are globally gated to never
   match disabled controls. Focus is the global focus-visible outline from
   foundation.css. Nothing here may set outline-none, or keyboard focus
   disappears. Sizes: 10px radius across 28–36px, 8px at 24px, 12px at
   40px; type scales caption → label → body. */

/* The spinner cannot inherit currentColor: data-loading turns it
   transparent along with the label. Chip's entry matters: its label is
   muted-foreground, and the foreground fallback painted a full-ink spinner
   over a 53% label. */
const SPINNER_COLOR: Record<string, string> = {
  default: "text-primary-foreground",
  destructive: "text-btn-destructive",
  chip: "text-muted-foreground",
};

/**
 * Usage:
 *
 *     <Button>حفظ التغييرات</Button>
 *     <Button variant="secondary" size="lg"><Plus /> New product</Button>
 *     <Button variant="ghost" size="icon" aria-label="Settings"><Settings /></Button>
 *     <Button loading>Generating…</Button>
 *     <Button asChild><Link href="/signup">Start</Link></Button>
 *
 *     <Button variant="outline">On a tinted surface</Button>
 *
 * HOUSE LAYOUT DEFAULTS [Sirdab]: the everyday row is the 40px tier
 * (secondary Button size="xl", Input default, Select trigger default).
 * The PRIMARY action is the 32px default primary Button. Reach for other
 * rungs only when a surface genuinely is denser (toolbars) or bigger
 * (touch/auth).
 *
 * Sizing next to fields, THE RULE: a Button sharing a row with an Input
 * (search bar + action, field + submit, inline forms) is size="xl" (40px)
 * to match the Input default. Both on their defaults is 8px misaligned.
 * Button and Input size words are INDEPENDENT scales. Off-default
 * pairings: Button size="lg" (36) with Input size="md" (36);
 * size="default" (32px) is for toolbars and dense chrome, pairing Input
 * size="sm" (32); size="touch" (44) with Input size="touch" (44) on the
 * touch/auth surfaces.
 *
 * Icons: drop them in as children. A leading icon gets the optical start
 * pull automatically; icon-only sizes need an aria-label AND a `hint`.
 * Those are two different jobs and neither substitutes for the other: the
 * label is what a screen reader announces, the hint is what everyone else
 * gets instead of guessing at a glyph (TOKENS.md, "Explaining a terse
 * control"). Usually the same words:
 *
 *     <Button variant="ghost" size="icon" aria-label="نسخ" hint="انسخ الرابط">
 *         <Icon icon={Copy} />
 *     </Button>
 *
 * `hintSide` places that tooltip (default "top"), and governs whichever
 * of the two is showing. Radix flips a tooltip only when it would leave
 * the VIEWPORT, which is not the same as "would land somewhere silly":
 * an icon button in a top bar usually has just enough room above it, so
 * the hint opens back into the bar it sits in rather than flipping. Pass
 * "bottom" there. Same reasoning under a sticky footer, in reverse.
 *
 * `disabledReason` outranks `hint` when both are set, because a button
 * that will not fire has exactly one thing worth saying; it is also the
 * one tooltip a tap opens on a touch screen (a hint never does). `loading` shows
 * the spinner and hides the label (not supported with asChild). Disabled
 * works on asChild too via aria-disabled. That depends on the `disabled:`
 * variant redefinition in @sirdab/one/foundation/tailwind.css; this component
 * is not portable without the glue. className is for LAYOUT (w-full,
 * margins, grid placement), never for colour, radius, or size; those come
 * from variant and size props only. If a button needs a look no variant
 * covers, that is a design-system conversation, not a call-site override.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  shape = "default",
  phone = "default",
  asChild = false,
  loading = false,
  disabled,
  disabledReason: givenReason,
  hint,
  hintSide = "top",
  concealed,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    /** WHY this is unavailable, on a tooltip. Implies disabled.
            Prefer it: a control that refuses without saying why is a
            dead end, and the reason is the only thing the person
            actually needs. */
    disabledReason?: React.ReactNode;
    /** What this button DOES, on a tooltip. Required reading for
            icon-only buttons: aria-label names the action for a screen
            reader and leaves everyone else looking at a glyph. Also
            earns its keep on terse text buttons whose label cannot say
            what applying it will do. */
    hint?: React.ReactNode;
    /** Which side the tooltip opens on, for `hint` AND for
            `disabledReason`. Defaults to "top". Reach for "bottom" in a
            top bar: Radix only flips on a VIEWPORT collision, and a bar
            usually leaves just enough room above for the tooltip to open
            back into itself. */
    hintSide?: React.ComponentProps<typeof TooltipContent>["side"];
    /** A button that holds its place before it can act: true keeps it
            laid out but invisible, inert and hidden from assistive tech
            (so a toolbar reserves its width and nothing slides when it
            arrives); flipping to false brings it in on the house spring
            from 75%. Leave it undefined for a button that is always there. */
    concealed?: boolean;
  }) {
  // No reason while concealed: its tooltip wrapper would still answer a
  // hover over the empty space.
  const disabledReason = concealed ? undefined : givenReason;
  const Comp = asChild ? Slot.Root : "button";
  const explained = disabledReason != null;
  const isDisabled = disabled || explained;

  // An explained button must stay REACHABLE, or the explanation is
  // only there for people who happen to mouse over it. The `disabled`
  // attribute drops the element from the tab order and stops it
  // announcing anything useful, so an explained button is
  // aria-disabled instead: focusable, announced disabled, hoverable.
  // Activation is blocked by the guard below (Enter and Space both
  // dispatch a click on a button, so one handler covers pointer and
  // keyboard).
  const ariaDisabled = asChild ? isDisabled : explained ? true : undefined;

  // Radix opens a tooltip on hover and keyboard focus only, so on a phone
  // a refused button said nothing at all. A tap on one opens its reason;
  // a tap anywhere else (Radix's outside dismiss) closes it. A mouse
  // click keeps Radix's own close-on-press.
  const pointerType = React.useRef<string>("");
  const [tapped, setTapped] = React.useState(false);
  if (!explained && tapped) setTapped(false);

  const button = (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      // A loading button must not fire again: the classic
      // double-submit. aria-busy announces the state; the click
      // guard below blocks activation while keeping focus (a
      // hard `disabled` would drop keyboard focus mid-wait).
      aria-busy={loading || undefined}
      // `disabled` is invalid HTML on non-button elements, so asChild
      // swaps it for aria-disabled (semantics + styles via the glue).
      disabled={asChild || explained ? undefined : disabled}
      aria-disabled={ariaDisabled || undefined}
      className={cn(
        buttonVariants({ variant, size, shape, phone, className }),
        // The base drops pointer events on aria-disabled (that
        // rule exists for asChild links). An explained button
        // needs them back, or it cannot be hovered and the
        // reason never shows.
        explained && "aria-disabled:pointer-events-auto",
        concealed === true && "invisible",
        concealed === false &&
          "animate-in fade-in-0 zoom-in-75 duration-200 ease-out",
      )}
      inert={concealed || undefined}
      aria-hidden={concealed || undefined}
      {...props}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
        pointerType.current = event.pointerType;
        props.onPointerDown?.(event);
      }}
      onClick={
        loading || isDisabled
          ? (event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              if (
                explained &&
                !loading &&
                (pointerType.current === "touch" ||
                  pointerType.current === "pen")
              ) {
                setTapped(true);
              }
            }
          : props.onClick
      }
    >
      {/* Slot requires a single child, so the spinner only wraps when
                rendering a real button; asChild + loading dims via
                data-loading but shows no spinner. */}
      {loading && !asChild ? (
        <>
          {children}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              SPINNER_COLOR[variant ?? "default"] ?? "text-foreground",
            )}
          >
            <LoaderIcon className="animate-spin" />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  );

  // A refusal outranks a hint: if the button will not fire, why not is
  // the only thing worth saying. A button that is off with no reason
  // says nothing: telling her what it would do invites a press that does
  // nothing.
  const tip = disabledReason ?? (concealed || disabled ? undefined : hint);
  if (tip == null) return button;
  // Wrapper, not asChild on the button: Radix Tooltip would merge its
  // own data-state onto it and clobber data-state="open"/"on", which
  // the open and pressed pairings select on.
  //
  // The :has() rule hands back a w-full: the wrapper is inline-flex, so
  // it sizes to its content, and a full-width button inside would
  // resolve its 100% against that intrinsic width and stop filling the
  // row. Layout classes go on the Button by doctrine, so the wrapper
  // has to follow the one that changes its own box.
  return (
    <Tooltip
      open={tapped || undefined}
      onOpenChange={(next: boolean) => {
        if (!next) setTapped(false);
      }}
    >
      <TooltipTrigger asChild>
        <span className="inline-flex [&:has(>.w-full)]:w-full">{button}</span>
      </TooltipTrigger>
      <TooltipContent side={hintSide}>{tip}</TooltipContent>
    </Tooltip>
  );
}

export { Button, buttonVariants };
