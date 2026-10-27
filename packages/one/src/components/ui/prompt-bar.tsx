"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

const SPRING_MS = 700;
const SPRING =
  "linear(0, 0.026 2%, 0.088 4%, 0.166 6%, 0.251 8%, 0.335 10%, 0.453 13%, 0.555 16%, 0.667 20%, 0.77 25%, 0.843 30%, 0.893 35%, 0.927 40%, 0.966 50%, 0.984 60%, 0.993 70%, 0.998 85%, 1)";

const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";

type SlotName = "leading" | "tool" | "input" | "trailing";

const CARD_LINES = 2;
const MAX_LINES = 5;

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

const TRAY_FADE_MS = 150;

const PILL_HEIGHT = 52;

const CARD_RADIUS = 26;
const PILL_RADIUS = 30;

const MAX_INPUT_HEIGHT = Number.POSITIVE_INFINITY;

const PLACEHOLDER_EVERY_MS = 3500;
const PLACEHOLDER_SWAP_MS = 300;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function typeInto(node: HTMLTextAreaElement, value: string): void {
  Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set?.call(node, value);
  node.dispatchEvent(new Event("input", { bubbles: true }));
}

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

  attachments?: React.ReactNode;
  inputProps: React.ComponentProps<"textarea">;

  maxInputHeight?: number;

  placeholders?: readonly string[];

  grow?: "down" | "up";

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

  const [wraps, setWraps] = React.useState(false);
  const expanded = hasAttachments || wraps;
  const up = grow === "up";

  const [, typed] = React.useReducer((n: number) => n + 1, 0);
  const look = (part: Look): string =>
    expanded ? part.card : stackOnPhone && !up ? part.phone : part.pill;
  const radius = expanded || (stackOnPhone && !up) ? CARD_RADIUS : PILL_RADIUS;

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

    copy.textContent = `${node.value}\u200b`;
    const next = Math.round(copy.scrollHeight / line) > 1;
    if (next !== wraps) setWraps(next);
  });

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

  React.useLayoutEffect(() => {
    for (const [name, node] of parts.current) {
      if (node.getAnimations?.().length) continue;
      const box = boxOf(node);
      if (box) resting.current.set(name, box);
    }
  });

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

          look(LOOK.field),
          inputClassName,
        )}
        onKeyDown={(event) => {
          onFieldKeyDown?.(event);
          const node = event.currentTarget;

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
        <div
          ref={mirror}
          aria-hidden
          className="z-behind text-body-lg pointer-events-none invisible absolute start-0 top-0 break-words whitespace-pre-wrap"
        />

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
