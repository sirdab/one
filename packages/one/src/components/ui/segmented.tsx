"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { useSlideFrom } from "../../lib/use-slide-from";
import { cn } from "../../lib/utils";
import { refusalProps, withDisabledReason } from "./disabled-reason";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/* The Sirdab segmented control: a radio group wearing a track. This is
   the ANIMATED, icon-led variant: a muted wash track (bg-muted, the 4%
   alpha-100) 40 high (44 on a touch screen), p-1, rounded-xl 12px, holding
   h-8 items (h-9 on touch) one radius step in (rounded-md, 8px: 12 minus
   the 4px pad, the nesting math --radius-nested encodes); the checked item
   carries a floating background thumb (bg-background, raised shadow) that
   SLIDES between options (useSlideFrom: it is born at the previous item's
   edges and eased home), and its label EXPANDS into view (reveal-inline,
   opened by data-open) while unchecked items stay icon-only. Icons rise from the muted
   tone to ink over 200ms. A mouse hovering an unchosen option brings its
   label and icon to ink, so it reads as pressable before it is chosen.

   The label is the label role (13px/20px) and the thumb wears the raised
   shadow. Roving focus, arrow keys, and RTL come from Radix RadioGroup.

   ONE RECIPE [decision]. The track, the item and the thumb are the three
   exported constants below, and the STATIC text segmented control (Tabs
   with variant="segmented", panels of content) reads the same three: one
   shape, one finish. A glyph-only item is a 32px square, 44 wide on touch
   so the 44px tap boxes of neighbours never overlap. Labels are never
   truncated: items keep their width and the track (max-w-full) scrolls in
   place as a last resort. Past four options, or labels as long as a
   phrase, it is a Select.

   A group with nothing to act on yet holds its place with `concealed`
   instead of greying every item behind a reason: a phone has no hover to
   read a reason on, and a control that cannot run is not offered (Button's
   `concealed`, the same spring in).

   A `mark` on an item adds the page tabs' 6px dot after its label (with the
   words as sr-only text) for an option that wants a look; it never changes
   the item's width logic or checked state.

   Usage:
       <Segmented value={mode} onValueChange={setMode} aria-label="وضع الإنشاء">
           <SegmentedItem value="generate" icon={<Icon icon={AudioLines} />} label="توليد" />
           <SegmentedItem value="video" icon={<Icon icon={Video} />} label="فيديو" />
       </Segmented>
*/

/* The recipe, exported for Tabs' segmented variant. The track is the 4%
   wash (a wash is what a track is, never a solid step), 40 high and 44 on
   touch; the item is 32 high (36 on touch) with an invisible 44px tap box;
   the thumb is the white contact-shadow chip, radius to match the item. */
export const SEGMENTED_TRACK =
  "flex h-control-xl w-fit max-w-full items-center overflow-x-auto no-scrollbar rounded-xl bg-muted p-1 pointer-coarse:h-control-touch";
export const SEGMENTED_ITEM =
  "group relative touch-target h-8 shrink-0 rounded-md px-2.5 text-muted-foreground hover:text-foreground pointer-coarse:h-9";
export const SEGMENTED_THUMB =
  "absolute inset-0 rounded-md bg-background shadow-raised";

/* Radix doesn't expose the group's value to items; mirror it (plus a
   per-group id so two groups never share a thumb) through context. */
const SegmentedContext = React.createContext<{
  value: string | undefined;
  thumbRef: React.RefObject<HTMLSpanElement | null>;
  animated: boolean;
} | null>(null);

function Segmented({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  animated = true,
  concealed,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  /** false renders the same states with no motion: the thumb appears
        instead of sliding, the label swaps instead of expanding. */
  animated?: boolean;
  /** A group that holds its place before it can act: true keeps it laid
        out but invisible, inert and hidden from assistive tech (so a
        toolbar reserves its width and nothing slides when it arrives);
        flipping to false brings it in on the house spring from 75%. Leave
        it undefined for a group that is always there. */
  concealed?: boolean;
}) {
  /* Controlled iff the caller passes `value`: mirror state only then
       (the `value ?? internal` shortcut made a controlled group
       un-clearable and flipped an uncontrolled one to controlled after
       the first click; same pattern as FilterChipSelect). */
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  // Radix types value as string | null; the context speaks undefined.
  const current = (isControlled ? valueProp : internal) ?? undefined;
  const thumbRef = useSlideFrom<HTMLSpanElement>(current, animated);
  return (
    <SegmentedContext.Provider value={{ value: current, thumbRef, animated }}>
      <RadioGroupPrimitive.Root
        data-slot="segmented"
        className={cn(
          SEGMENTED_TRACK,
          concealed === true && "invisible",
          concealed === false &&
            "animate-in fade-in-0 zoom-in-75 duration-200 ease-out",
          className,
        )}
        inert={concealed || undefined}
        aria-hidden={concealed || undefined}
        value={isControlled ? valueProp : undefined}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          if (!isControlled) setInternal(next);
          onValueChange?.(next);
        }}
        {...props}
      />
    </SegmentedContext.Provider>
  );
}

function SegmentedItem({
  className,
  icon,
  label,
  iconOnly,
  hint,
  mark,
  disabledReason,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "children"> & {
  /** An <Icon> element (a node, not a component; this crosses the
        server boundary). Omit it for a text-only item: its label is then
        ALWAYS visible, which also makes the track width constant, the
        no-layout-shift mode. */
  icon?: React.ReactNode;
  /** With an icon: shown only while checked, expanding in as the thumb
        arrives. Without one (or static): always visible. */
  label: string;
  /** Never render the label visually, checked or not: glyph tabs (a rail
        section switcher). The label still names the radio for AT, and the
        hover name belongs in `hint`. Requires an icon; ignored without one,
        because a control with no glyph and no text is a mystery box. */
  iconOnly?: boolean;
  /** WHY this is unavailable, on a tooltip. Implies disabled, and
        keeps the control reachable so the reason can actually be read
        (see disabled-reason.tsx). */
  disabledReason?: React.ReactNode;
  /** What this MODE does, on a tooltip. A segmented label names the
        option in a word or a glyph; the difference between the options
        usually will not fit there, and this is where it goes. */
  hint?: React.ReactNode;
  /** A quiet dot after the label, and its words for assistive tech: this
        option holds something that wants a look (a language with texts still
        missing). Omit it for an option with nothing to flag; the dot is the
        same 6px unread dot the page tabs draw, never a count. */
  mark?: string;
}) {
  const group = React.useContext(SegmentedContext);
  const checked = group?.value === props.value;
  const glyphOnly = iconOnly === true && icon != null;
  const alwaysLabel = !glyphOnly && (group?.animated === false || icon == null);
  const item = (
    <RadioGroupPrimitive.Item
      data-slot="segmented-item"
      className={cn(
        /* Keyboard focus is the global focus-visible outline.
                   Nothing here sets outline-none (house doctrine, same as
                   Button/Checkbox/Switch). touch-target is Button's
                   44px hit area on a touch screen: the item keeps its 32px
                   look and still takes a thumb. An icon item pads 8px so its
                   collapsed state is a 32px square; a glyph-only item is
                   that square outright, 44 wide on touch. */
        SEGMENTED_ITEM,
        icon != null && "px-2 pointer-coarse:min-w-11",
        glyphOnly && "w-8 px-0 pointer-coarse:w-11",
        // The tighter checked start belongs to the ANIMATED
        // icon+label pair (and animates with it). Static mode
        // drops it entirely: a padding that changes with checked
        // state translates the content 2px on every selection.
        icon != null &&
          !glyphOnly &&
          group?.animated !== false &&
          "transition-all duration-200 data-[state=checked]:ps-1.5",
        className,
      )}
      {...props}
      {...refusalProps(disabledReason)}
    >
      {checked ? (
        group?.animated === false ? (
          <span data-slot="segmented-thumb" className={SEGMENTED_THUMB} />
        ) : (
          <span
            ref={group?.thumbRef}
            data-slot="segmented-thumb"
            // The floating checked surface: slides between options.
            className={cn(
              SEGMENTED_THUMB,
              "transition-all duration-200 motion-reduce:transition-none",
            )}
          />
        )
      ) : null}
      <div className="z-raised relative flex h-full items-center justify-center">
        {icon != null ? (
          <span
            className={cn(
              "text-muted-foreground flex shrink-0 items-center group-hover:text-foreground group-data-[state=checked]:text-foreground [&_svg:not([class*='size-'])]:size-4",
              group?.animated !== false &&
                "[&_svg]:transition-colors [&_svg]:duration-200",
            )}
          >
            {icon}
          </span>
        ) : null}
        {alwaysLabel ? null : (
          /* The animated variant hides unchecked labels
                       VISUALLY, but a radio's accessible name comes from
                       its content, so the label always exists for AT,
                       and the animated visible copy below is aria-hidden
                       to avoid double-naming. Glyph tabs ride the same
                       span: it is their only name. */
          <span className="sr-only">{label}</span>
        )}
        {glyphOnly ? null : alwaysLabel ? (
          /* Static and text-only show every label: hiding them
                       is only worth it as the expand animation's payoff,
                       and always-visible labels keep the track width
                       constant. */
          <div
            /* Named so a caller can collapse these labels at a
                           breakpoint without rendering a second copy of the
                           whole control. Collapse it with sr-only and never
                           display:none: in this branch the visible label IS the
                           radio's accessible name, so hiding it outright leaves
                           an unnamed control behind. */
            data-slot="segmented-label"
            className={cn(
              "text-label overflow-hidden whitespace-nowrap",
              group?.animated !== false && "transition-colors duration-200",
              checked
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          >
            <span className={cn(icon != null && "ms-2")}>{label}</span>
          </div>
        ) : (
          /* Always mounted: unchecked, the column is closed and the
                       word is clipped; checked, it opens to the word's width
                       while the thumb slides over. The margin sits inside the
                       clipped child, or a closed label would still hold 8px. */
          <div
            aria-hidden
            data-open={checked ? "" : undefined}
            className="reveal-inline duration-200"
          >
            <div className="text-label whitespace-nowrap text-foreground">
              <span className="ms-2">{label}</span>
            </div>
          </div>
        )}
        {mark != null ? (
          <>
            <span
              aria-hidden
              data-slot="segmented-mark"
              className="bg-unread ms-1.5 size-1.5 shrink-0 rounded-full"
            />
            <span className="sr-only">{mark}</span>
          </>
        ) : null}
      </div>
    </RadioGroupPrimitive.Item>
  );

  // A refusal outranks a hint: if the mode cannot be picked, why not
  // is the only thing worth saying.
  if (disabledReason != null) {
    return withDisabledReason(item, disabledReason, "inline-flex shrink-0");
  }
  if (hint == null) return item;
  // The tooltip trigger goes on a WRAPPER, never on the item itself:
  // asChild would merge Radix Tooltip's own data-state (open/closed)
  // onto the radio and overwrite data-state="checked", which is what
  // every checked style here selects on. The wrapper is display
  // contents-free (inline-flex) so the track's flex layout is
  // unchanged, and focus events bubble, so keyboard focus on the radio
  // still opens the hint.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0">{item}</span>
      </TooltipTrigger>
      {/* Below, not above: a segmented control sits in a toolbar
                beside the primary action, and the default top-side chip
                landed on it. */}
      <TooltipContent side="bottom">{hint}</TooltipContent>
    </Tooltip>
  );
}

export { Segmented, SegmentedItem };
