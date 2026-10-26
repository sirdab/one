"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/* The Sirdab prompt bar: one line to type a request into, as a raised pill
   (the assistant's way in from a page, the "work with Sirdab" invitation). A
   form, so Enter submits; the host owns what a submission does. Slots:
   `leading` is the mark that says who is listening (an icon at 20px),
   `tool` a control beside it (attach a file), `trailing` the one control
   at the end (send).

   The pill holds one line. When what is typed would wrap in it, or with
   `attachments` (what was added: thumbnails), it opens into a card: the
   attachments on top, the mark and the field under them, the tool and the
   send button along the foot. In the card the field takes fixed steps,
   after ElevenLabs [decision]: two lines, then five, then it scrolls, so
   the bar settles at a size instead of creeping a line at a time. Whether
   it wraps is always judged at the PILL's width, so text that fits the
   card's wider field but not the pill does not flip back and forth.

   It opens one of two ways, by where the room is:
   - `grow="down"` (in the page's flow, room below: home). The card's top
     stays where the pill's was and it grows downward, pushing the page
     below it on the same curve.
   - `grow="up"` (floating at a frame's foot, room above: the empty
     pages). The card's foot stays where the pill was and it grows upward
     over the page; its place in the layout never changes.

   How it moves. The card's height is a real, measured height on a CSS
   transition, never a scale, so nothing inside is stretched. The
   parts (mark, field, plus, send) each travel from where they were to
   where they land, measured from their START edge, where the placeholder
   sits (the right, in Arabic), so the field's text travels one way and
   never across the mark. Everything moves on one spring, ElevenLabs'
   layout spring (stiffness 320, damping 40, no overshoot) [decision], so
   the card, every part and the tray settle together. The parts are never
   remounted, only re-placed (one grid, two templates), so focus and the
   caret ride through the move. Each picture fades into the tray (150ms),
   and when one is removed the rest slide over on the spring.

   `placeholders` turns the placeholder into a rotation of example
   requests, after ElevenLabs: one every 3.5s, the old one rising and
   blurring out as the next rises in (300ms each). It shows only while the
   field is empty, and the forward arrow (right, or left in Arabic) on an
   empty field takes the one showing.

   On focus the bar wears the aurora ring as its border with a soft
   backlight (`aurora-ring`, foundation, lit on focus by
   `data-aurora-ring="focus"`). The wrapper that carries it sits
   OUTSIDE the clipped card, since the card's overflow-hidden would cut the
   glow, and it takes the card's place in the layout (the floating bar's
   absolute anchoring moved onto it) so nothing shifts.

   Not an Input variant: an Input is a field in a form, sized to the form's
   rhythm; this is a standalone invitation that floats on the page, taller,
   rounded and lifted, with no border of its own.

   The field is a textarea in the 16px body-lg role: a request can be a
   paragraph (a pasted brief, a ready-made prompt) and a single-line field
   would hide all but its last words. `maxInputHeight` caps the card's
   tallest step. Enter sends, Shift+Enter breaks the line.

   className is for LAYOUT (width, margins); `inputProps` reach the field. */

/* ElevenLabs' layout spring (stiffness 320, damping 40, mass 1) as a CSS
   easing [decision]: no overshoot, 90% there by 260ms and settled by 700ms.
   It runs past the 300ms ceiling on purpose, like the assistant's morph: a
   spring's long tail is what makes the card settle rather than stop. */
const SPRING_MS = 700;
const SPRING =
  "linear(0, 0.026 2%, 0.088 4%, 0.166 6%, 0.251 8%, 0.335 10%, 0.453 13%, 0.555 16%, 0.667 20%, 0.77 25%, 0.843 30%, 0.893 35%, 0.927 40%, 0.966 50%, 0.984 60%, 0.993 70%, 0.998 85%, 1)";

/* Motion's easeOut, the curve ElevenLabs' fades and placeholder run on. */
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";

type SlotName = "leading" | "tool" | "input" | "trailing";

/* The field's steps in the card, in lines, after ElevenLabs. */
const CARD_LINES = 2;
const MAX_LINES = 5;

/* Each part's classes in the two layouts, and in the phone-stacked one
   (`stackOnPhone`): the card below sm, the pill from sm. Written out in
   full rather than prefixed at runtime, because Tailwind only generates a
   class it can find spelled out in the source. The grids themselves are
   the prompt-bar-pill / prompt-bar-card utilities (foundation). */
type Look = { card: string; pill: string; phone: string };
const LOOK = {
  grid: {
    card: "prompt-bar-card p-3",
    pill: "prompt-bar-pill min-h-13 items-center py-2 ps-4 pe-2.5",
    phone:
      "prompt-bar-card p-3 sm:prompt-bar-pill sm:min-h-13 sm:items-center sm:py-2 sm:ps-4 sm:pe-2.5",
  },
  leading: {
    card: "ms-1 h-lh self-start text-body-lg",
    pill: "h-9",
    phone: "ms-1 h-lh self-start text-body-lg sm:ms-0 sm:h-9 sm:self-auto",
  },
  tool: { card: "", pill: "h-9", phone: "sm:h-9" },
  input: { card: "me-1 mb-7", pill: "", phone: "me-1 mb-7 sm:me-0 sm:mb-0" },
  field: { card: "", pill: "py-1.5", phone: "sm:py-1.5" },
  trailing: {
    card: "justify-self-end",
    pill: "h-9",
    phone: "justify-self-end sm:justify-self-auto sm:h-9",
  },
} satisfies Record<string, Look>;

/* A picture arriving in the tray fades in (150ms, ElevenLabs'); its
   neighbours, when one leaves, slide over on the layout spring. */
const TRAY_FADE_MS = 150;

/* The pill's height (h-13): the floating bar keeps exactly this much room in
   the layout whatever the card does above it. */
const PILL_HEIGHT = 52;

/* The card's corner, and the pill's. The pill is not always 52 tall:
   Arabic's taller line makes it about 57, and a fixed 26 on that left a
   short flat at each end. Its corner is 30 instead, just over half the
   tallest pill: a corner larger than half the box is scaled down to fit,
   so the pill comes out fully round at either height. Not a full 9999:
   the pill's corner is set the moment the last picture goes, while the
   card is still tall and easing down, and 9999 turned that card into a
   stadium for the whole collapse. The aurora ring is drawn 1px outside the
   card, so its corner is one more, or its own ends go flat. */
const CARD_RADIUS = 26;
const PILL_RADIUS = 30;

/* The tallest the field gets before it scrolls, if the host sets no cap. */
const MAX_INPUT_HEIGHT = Number.POSITIVE_INFINITY;

/* The rotating placeholder's beat: a new example every 3.5s, 300ms out and
   300ms in. */
const PLACEHOLDER_EVERY_MS = 3500;
const PLACEHOLDER_SWAP_MS = 300;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Sets a field's value the way typing does, so a controlled host hears it
   through its own onChange. */
function typeInto(node: HTMLTextAreaElement, value: string): void {
  Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set?.call(node, value);
  node.dispatchEvent(new Event("input", { bubbles: true }));
}

/* The example requests, one at a time, over an empty field. Decorative
   (the field keeps its own label); `onShow` hears which one is up, for the
   arrow that takes it. */
function RotatingPlaceholder({
  phrases,
  className,
  onShow,
}: {
  phrases: readonly string[];
  className?: string;
  onShow: (phrase: string) => void;
}): React.JSX.Element {
  const [index, setIndex] = React.useState(0);
  const span = React.useRef<HTMLSpanElement>(null);
  const entered = React.useRef(false);
  const phrase = phrases[index % phrases.length] ?? "";

  React.useLayoutEffect(() => {
    onShow(phrase);
    const node = span.current;
    /* The first one is simply there; only a swap animates in. */
    if (!entered.current) {
      entered.current = true;
      return;
    }
    if (!node?.animate || reducedMotion()) return;
    for (const running of node.getAnimations()) running.cancel();
    node.animate(
      [
        { opacity: 0, translate: "0 30%", filter: "blur(1.5px)" },
        { opacity: 1, translate: "0 0", filter: "blur(0px)" },
      ],
      { duration: PLACEHOLDER_SWAP_MS, easing: EASE_OUT },
    );
  }, [phrase, onShow]);

  React.useEffect(() => {
    if (phrases.length < 2) return;
    const next = (): void => setIndex((i) => (i + 1) % phrases.length);
    const timer = window.setInterval(() => {
      const node = span.current;
      if (!node?.animate || reducedMotion()) {
        next();
        return;
      }
      const leaving = node.animate(
        [
          { opacity: 1, translate: "0 0", filter: "blur(0px)" },
          { opacity: 0, translate: "0 -30%", filter: "blur(1.5px)" },
        ],
        {
          duration: PLACEHOLDER_SWAP_MS,
          easing: EASE_OUT,
          fill: "forwards",
        },
      );
      leaving.onfinish = next;
    }, PLACEHOLDER_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [phrases.length]);

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 flex items-start overflow-hidden",
        className,
      )}
    >
      <span
        ref={span}
        className="text-body-lg text-subtle block min-w-0 truncate"
      >
        {phrase}
      </span>
    </span>
  );
}

function PromptBar({
  leading,
  tool,
  trailing,
  attachments,
  inputProps,
  grow = "down",
  maxInputHeight = MAX_INPUT_HEIGHT,
  className,
  onFocus,
  onBlur,
  stackOnPhone = false,
  placeholders,
  ...props
}: Omit<React.ComponentProps<"form">, "children"> & {
  leading?: React.ReactNode;
  tool?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Present (non-null), the bar opens into its card layout. */
  attachments?: React.ReactNode;
  inputProps: React.ComponentProps<"textarea">;
  /** A cap in px on the card's tallest step, past which the field
        scrolls. */
  maxInputHeight?: number;
  /** Example requests rotated over the empty field in place of a fixed
        placeholder. */
  placeholders?: readonly string[];
  /** Which way the card opens: "down" in the page's flow (it pushes what
        is below), "up" when floating at a foot (it covers what is above
        and never moves the layout). */
  grow?: "down" | "up";
  /** Below sm, the card's layout even with no pictures: the field gets
        the bar's whole width and the controls sit under it. For a bar whose
        placeholder would otherwise wrap in a phone's narrow pill. "down"
        bars only: a floating "up" bar keeps the pill's height. */
  stackOnPhone?: boolean;
}) {
  const {
    className: inputClassName,
    onKeyDown: onFieldKeyDown,
    onInput: onFieldInput,
    ref: fieldRef,
    placeholder: fixedPlaceholder,
    ...field
  } = inputProps;
  const phrases = placeholders ?? [];
  const rotating = phrases.length > 0;
  const hasAttachments = attachments != null && attachments !== false;
  /* Whether what is typed would wrap at the pill's width, judged after
       every render (below). */
  const [wraps, setWraps] = React.useState(false);
  const expanded = hasAttachments || wraps;
  const up = grow === "up";
  /* An uncontrolled field re-renders the bar on input, so the wrap and
       the placeholder follow what is typed either way. */
  const [, typed] = React.useReducer((n: number) => n + 1, 0);
  const look = (part: Look): string =>
    expanded ? part.card : stackOnPhone && !up ? part.phone : part.pill;
  const radius = expanded || (stackOnPhone && !up) ? CARD_RADIUS : PILL_RADIUS;

  /* The content's natural height. The observer follows the content NODE,
       not the first one it saw: a remount (a hot reload, a parent keyed
       afresh) would otherwise pin the card at the old height. */
  const [height, setHeight] = React.useState<number | null>(null);
  const observer = React.useRef<ResizeObserver | null>(null);
  const content = React.useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!node) return;
    setHeight(node.offsetHeight);
    observer.current = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.current.observe(node);
  }, []);

  /* The field's own height follows its content, measured after every
       render (a value set by the host, not typed, grows it too). Declared
       before the move below, so it runs first: the field loses the pill's
       padding when the card opens, and a move measured before it settles
       starts every control 12px off. */
  const textarea = React.useRef<HTMLTextAreaElement | null>(null);
  const setTextarea = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      textarea.current = node;
      if (typeof fieldRef === "function") fieldRef(node);
      else if (fieldRef) fieldRef.current = node;
    },
    [fieldRef],
  );
  React.useLayoutEffect(() => {
    const node = textarea.current;
    if (!node) return;
    node.style.height = "auto";
    const needed = node.scrollHeight;
    const style = getComputedStyle(node);
    const line = parseFloat(style.lineHeight);
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    /* The card's steps: two lines, then the tallest step, then scroll.
           The pill is one line; text that would wrap there opens the card. */
    const target =
      !expanded || !Number.isFinite(line) || line <= 0
        ? needed
        : Math.min(
            maxInputHeight,
            padding +
              line *
                (Math.round((needed - padding) / line) <= CARD_LINES
                  ? CARD_LINES
                  : MAX_LINES),
          );
    node.style.height = `${target}px`;
    node.style.overflowY = needed > target ? "auto" : "hidden";
  });

  /* Would what is typed wrap in the pill? Measured in a hidden copy of the
       field at the pill field's width, remembered while the pill is showing,
       so the card's wider field never decides it. */
  const mirror = React.useRef<HTMLDivElement>(null);
  const pillWidth = React.useRef<number | null>(null);
  React.useLayoutEffect(() => {
    const node = textarea.current;
    const copy = mirror.current;
    if (!node || !copy) return;
    if (!expanded && node.clientWidth > 0) {
      pillWidth.current = node.clientWidth;
    }
    const width = pillWidth.current;
    const line = parseFloat(getComputedStyle(node).lineHeight);
    if (width === null || !Number.isFinite(line) || line <= 0) return;
    copy.style.width = `${width}px`;
    // The zero-width space keeps a trailing line break counted.
    copy.textContent = `${node.value}\u200b`;
    const next = Math.round(copy.scrollHeight / line) > 1;
    if (next !== wraps) setWraps(next);
  });

  /* Every part's move, measured from its START edge (the right, in
       Arabic). Each part's resting box is kept from the last commit; when
       the layout flips, the part is drawn back where it was and released to
       its new place. Start edge, because the field changes width: its text
       sits at the start, so the text travels one way and never across the
       mark. Vertically it is the middle, not the top: a slot changes height
       between the layouts (the mark's 36px pill slot is one line in the
       card) and its content is centred in it. `translate`, not `transform`, so a host's own transform on a
       part is left alone.

       Two guards keep it to real flips. The boxes are measured against the
       bar itself, not the viewport, so the page moving around the bar (a
       rail folding, a scroll, the page's own fade) is never mistaken for a
       part moving inside it. And a move runs only when the layout itself
       changed since the last one shown: effects re-run when a hidden page
       is shown again (React Activity) or under StrictMode, and neither is a
       flip. */
  type Box = { left: number; right: number; middle: number };
  const frame = React.useRef<HTMLDivElement>(null);
  const parts = React.useRef(new Map<SlotName, HTMLDivElement>());
  const resting = React.useRef(new Map<SlotName, Box>());
  const shown = React.useRef<boolean | null>(null);
  const part = React.useCallback(
    (name: SlotName) => (node: HTMLDivElement | null) => {
      if (node) parts.current.set(name, node);
    },
    [],
  );
  const boxOf = React.useCallback((node: HTMLElement): Box | null => {
    const origin = frame.current?.getBoundingClientRect();
    if (!origin) return null;
    const r = node.getBoundingClientRect();
    return {
      left: r.left - origin.left,
      right: r.right - origin.left,
      middle: r.top + r.height / 2 - origin.top,
    };
  }, []);
  React.useLayoutEffect(() => {
    const flipped = shown.current !== null && shown.current !== expanded;
    shown.current = expanded;
    const still =
      !flipped || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const [name, node] of parts.current) {
      if (!node.isConnected) {
        parts.current.delete(name);
        resting.current.delete(name);
        continue;
      }
      const before = resting.current.get(name);
      const after = boxOf(node);
      if (!after) continue;
      resting.current.set(name, after);
      if (still || !before) continue;
      const rtl = getComputedStyle(node).direction === "rtl";
      const dx = rtl ? before.right - after.right : before.left - after.left;
      const dy = before.middle - after.middle;
      if ((dx === 0 && dy === 0) || !node.animate) continue;
      node.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }],
        { duration: SPRING_MS, easing: SPRING },
      );
    }
  }, [expanded, boxOf]);
  /* Keep the resting boxes current (the bar may reflow between flips),
       but never record a frame of a move. */
  React.useLayoutEffect(() => {
    for (const [name, node] of parts.current) {
      if (node.getAnimations?.().length) continue;
      const box = boxOf(node);
      if (box) resting.current.set(name, box);
    }
  });

  /* The tray's pictures. Each one's place is kept from the last commit,
       measured against the tray (offsets, which a running transform does
       not move), so the card opening around it is never read as a picture
       moving. A picture the tray has not seen enters; one that shifted
       (a neighbour removed) slides from where it was. Nothing enters on the
       bar's first commit: pictures already there when it mounts are
       content, not arrivals. */
  type Spot = { left: number; top: number };
  const tray = React.useRef<HTMLDivElement | null>(null);
  const spots = React.useRef(new Map<Element, Spot>());
  const settled = React.useRef(false);
  const setTray = React.useCallback((node: HTMLDivElement | null) => {
    tray.current = node;
  }, []);
  React.useLayoutEffect(() => {
    const node = tray.current;
    const arrivals = settled.current;
    settled.current = true;
    if (!node) {
      spots.current.clear();
      return;
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<Element, Spot>();
    for (const child of Array.from(node.children)) {
      if (!(child instanceof HTMLElement)) continue;
      const spot = {
        left: child.offsetLeft - node.offsetLeft,
        top: child.offsetTop - node.offsetTop,
      };
      next.set(child, spot);
      const before = spots.current.get(child);
      if (still || !child.animate) continue;
      if (!before) {
        if (!arrivals) continue;
        child.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: TRAY_FADE_MS,
          easing: EASE_OUT,
        });
        continue;
      }
      const dx = before.left - spot.left;
      const dy = before.top - spot.top;
      if (dx === 0 && dy === 0) continue;
      child.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }],
        { duration: SPRING_MS, easing: SPRING },
      );
    }
    spots.current = next;
  });

  /* Focus that was inside the bar stays inside it. Removing a picture
       deletes the button that was pressed, and the browser drops focus to
       the page without a blur: the ring goes dark and the next keystroke
       lands nowhere. A real blur (a click elsewhere, the window losing
       focus to the file picker) clears the flag first, so only focus that
       vanished with its element is handed to the field. */
  const focused = React.useRef(false);
  React.useLayoutEffect(() => {
    const bar = frame.current;
    if (!focused.current || !bar) return;
    if (bar.contains(document.activeElement)) return;
    textarea.current?.focus({ preventScroll: true });
  });

  const slot = (name: SlotName, node: React.ReactNode, extra?: string) =>
    node ? (
      <div
        ref={part(name)}
        style={{ gridArea: name }}
        className={cn(
          "flex shrink-0 items-center [&>svg]:size-5 [&>svg]:shrink-0",
          extra,
        )}
      >
        {node}
      </div>
    ) : null;

  /* The example on show, for the arrow that takes it. */
  const showing = React.useRef("");
  const onShow = React.useCallback((phrase: string) => {
    showing.current = phrase;
  }, []);
  const empty =
    (typeof field.value === "string"
      ? field.value
      : (textarea.current?.value ?? "")) === "";

  const input = (
    <div
      ref={part("input")}
      style={{ gridArea: "input" }}
      className={cn("relative flex min-w-0", look(LOOK.input))}
    >
      {rotating && empty ? (
        <RotatingPlaceholder
          phrases={phrases}
          onShow={onShow}
          className={look(LOOK.field)}
        />
      ) : null}
      <textarea
        ref={setTextarea}
        data-slot="prompt-bar-input"
        rows={1}
        placeholder={rotating ? undefined : fixedPlaceholder}
        aria-placeholder={rotating ? phrases[0] : undefined}
        onInput={(event) => {
          onFieldInput?.(event);
          typed();
        }}
        className={cn(
          "text-body-lg placeholder:text-subtle min-w-0 flex-1 resize-none bg-transparent focus-visible:outline-none",
          /* In the pill the field is as tall as the controls beside
                       it (the 36px content box), so a single line sits exactly
                       where it always did and a tall one grows upward from the
                       controls' own row. */
          look(LOOK.field),
          inputClassName,
        )}
        onKeyDown={(event) => {
          onFieldKeyDown?.(event);
          const node = event.currentTarget;
          /* The forward arrow on an empty field takes the example
                       on show: right in English, left in Arabic. */
          const forward =
            getComputedStyle(node).direction === "rtl"
              ? "ArrowLeft"
              : "ArrowRight";
          if (
            rotating &&
            !event.defaultPrevented &&
            event.key === forward &&
            !event.shiftKey &&
            !event.altKey &&
            !event.metaKey &&
            !event.ctrlKey &&
            node.value === "" &&
            showing.current !== ""
          ) {
            event.preventDefault();
            typeInto(node, showing.current);
            return;
          }
          if (
            event.defaultPrevented ||
            event.key !== "Enter" ||
            event.shiftKey ||
            event.nativeEvent.isComposing
          ) {
            return;
          }
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
        }}
        {...field}
      />
    </div>
  );

  return (
    <form
      data-slot="prompt-bar"
      data-expanded={expanded || undefined}
      className={cn("w-full max-w-md", className)}
      onFocus={(event) => {
        focused.current = true;
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focused.current = false;
        }
        onBlur?.(event);
      }}
      {...props}
    >
      <div
        ref={frame}
        className="relative"
        style={up ? { height: PILL_HEIGHT } : undefined}
      >
        {/* The hidden copy the wrap is measured in: the field's own
                    type, wrapping as it wraps. */}
        <div
          ref={mirror}
          aria-hidden
          className="z-behind text-body-lg pointer-events-none invisible absolute start-0 top-0 break-words whitespace-pre-wrap"
        />
        {/* The card eases to the content's height. Clipped, with
                    the content pinned to the edge that stays put (top
                    growing down, foot growing up), so the new room opens
                    into view as it grows. */}
        <div
          data-slot="prompt-bar-aura"
          data-aurora-ring="focus"
          style={{ borderRadius: radius + 1 }}
          className={cn(
            "aurora-ring w-full",
            up ? "absolute inset-x-0 bottom-0" : "relative",
          )}
        >
          <div
            data-slot="prompt-bar-card"
            style={{
              borderRadius: radius,
              height: height ?? undefined,
              transition: `height ${SPRING_MS}ms ${SPRING}`,
            }}
            className={cn(
              "shadow-raised flex w-full flex-col overflow-hidden bg-background motion-reduce:transition-none",
              up ? "justify-end" : "justify-start",
            )}
          >
            {/* One grid in both layouts, its children in one
                            fixed order, so opening the card never remounts
                            a part: the field keeps its focus, caret and
                            undo, and the aurora ring stays lit. Only the
                            template changes; the pill puts every part on
                            one row, centred on it (the pill only ever holds
                            one line, and Arabic's line is taller than the
                            controls, so a foot-aligned row sat them low), the
                            card stacks the pictures over the field over
                            the controls. The mark sits one line tall
                            beside the field's first line in the card, as
                            ElevenLabs' orb does: the field opens two lines
                            tall, so a mark on the foot sat beside an empty
                            second line, under the words. */}
            <div
              ref={content}
              className={cn(
                "grid w-full shrink-0 items-end gap-x-2",
                look(LOOK.grid),
              )}
            >
              {expanded ? (
                <div
                  ref={setTray}
                  style={{ gridArea: "attach" }}
                  className="mb-3 flex flex-wrap gap-1.5"
                >
                  {attachments}
                </div>
              ) : null}
              {slot("leading", leading, look(LOOK.leading))}
              {slot("tool", tool, look(LOOK.tool))}
              {input}
              {slot("trailing", trailing, look(LOOK.trailing))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export { PromptBar };
