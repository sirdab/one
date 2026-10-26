import * as React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIELD_HEIGHT, FIELD_RADIUS } from "../field-chrome";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

function renderOpen() {
  render(
    <Select open defaultValue="a">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Alpha</SelectItem>
      </SelectContent>
    </Select>,
  );
}

describe("Select trigger", () => {
  /* A form select is a FIELD that opens a list: Input's border ladder,
       Input's focus (ink border plus the hairline ring, no offset outline)
       and Input's value type. It used to wear Button's chrome, so the
       price Input and the category Select side by side disagreed about
       hover, focus and the corner. */
  it("wears the field chrome: Input's border, hover, focus and open look", () => {
    renderOpen();
    // The open portal aria-hides the trigger, so role queries miss it.
    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).toContain("border-input");
    expect(cls).toContain("bg-transparent");
    expect(cls).toContain("border-input-border-hover");
    expect(cls).toContain("focus-visible:border-ring");
    expect(cls).toContain("focus-visible:ring-input-focus");
    // outline-hidden, not outline-none: the ink border and ring are
    // box-shadows, which forced-colors mode (Windows High Contrast)
    // removes, and a transparent outline is the one thing it still paints.
    expect(cls).toContain("focus-visible:outline-hidden");
    expect(cls).not.toContain("outline-none");
    expect(cls).toContain("data-[state=open]:border-ring");
    expect(cls).toContain("data-[state=open]:ring-input-focus");
    expect(cls).not.toContain("border-btn-border");
    expect(cls).not.toContain("btn-surface");
  });

  /* Hover must not repaint the ink border a focused or open field wears. */
  it("hovers the border only on a field that is neither focused nor open", () => {
    renderOpen();
    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).toContain(
      "hover:not-focus-visible:not-data-[state=open]:border-input-border-hover",
    );
  });

  /* The value reads like the Input beside it: 16.8px Arabic on a phone,
       the quiet 400 body role from sm up. */
  it("sets the value in the Input's type", () => {
    renderOpen();
    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).toContain("text-body-lg");
    expect(cls).toContain("sm:text-body-quiet");
    expect(cls).toContain("data-placeholder:text-subtle");
  });

  /* Disclosure is vertical in both directions: the chevron must never
       carry the RTL flip. */
  it("renders a chevron that never flips", () => {
    renderOpen();
    const chevron = document
      .querySelector('[data-slot="select-trigger"]')
      ?.querySelector("svg");
    expect(chevron).not.toBeNull();
    expect(chevron?.getAttribute("class") ?? "").not.toContain(
      "rtl:-scale-x-100",
    );
  });
});

function renderTrigger(
  props: React.ComponentProps<typeof SelectTrigger> = {},
): HTMLElement {
  render(
    <Select defaultValue="a">
      <SelectTrigger {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Alpha</SelectItem>
      </SelectContent>
    </Select>,
  );
  const trigger = document.querySelector('[data-slot="select-trigger"]');
  if (!(trigger instanceof HTMLElement)) throw new Error("no trigger");
  return trigger;
}

describe("Select trigger flavours", () => {
  /* Two flavours, picked by the props and never by a flag of their own:
       a bordered variant at a field size (36, 40, 44) is a FIELD; anything
       else is a toolbar menu trigger wearing Button's machine. Pin the
       switch, or a refactor flips a form select back into a button. */
  it("defaults to the field flavour at 40 with the Input's 12px corner", () => {
    const trigger = renderTrigger();
    expect(trigger.getAttribute("data-flavour")).toBe("field");
    expect(trigger.getAttribute("data-variant")).toBe("secondary");
    expect(trigger.getAttribute("data-size")).toBe("xl");
    expect(trigger.className).toContain(FIELD_HEIGHT.default);
    expect(trigger.className).toContain("h-control-xl");
    expect(trigger.className).toContain("rounded-xl");
    expect(trigger.className).not.toContain("rounded-lg");
    // The tap box of a phone: the look stays 40, the box is 44.
    expect(trigger.className).toContain("touch-target");
    // A field has no wash on hover or press, only the border moves.
    expect(trigger.className).not.toContain("active:bg-");
    expect(trigger.className).not.toContain("hover:bg-");
    // WIDTH RULE: every trigger hugs; w-full is call-site layout only.
    expect(trigger.className).not.toContain("w-full");
    // Disabled dims like a FIELD: rest chrome held under opacity.
    expect(trigger.className).toContain("disabled:opacity-50");
    expect(trigger.className).toContain("disabled:cursor-not-allowed");
  });

  /* The corner map is Input's: 36 keeps the 10px step, 40 and 44 are 12. */
  it("reads the corner per size from the same map as the Input", () => {
    const lg = renderTrigger({ size: "lg" });
    expect(lg.getAttribute("data-flavour")).toBe("field");
    expect(lg.className).toContain(FIELD_HEIGHT.md);
    expect(lg.className).toContain(FIELD_RADIUS.md);
    expect(lg.className).toContain("rounded-lg");
    cleanup();
    const touch = renderTrigger({ size: "touch" });
    expect(touch.getAttribute("data-flavour")).toBe("field");
    expect(touch.className).toContain("h-control-touch");
    expect(touch.className).toContain(FIELD_RADIUS.touch);
    expect(touch.className).toContain("rounded-xl");
  });

  it("outline is the same field on a tinted surface", () => {
    const trigger = renderTrigger({ variant: "outline" });
    expect(trigger.getAttribute("data-flavour")).toBe("field");
    expect(trigger.className).toContain("border-input");
    expect(trigger.className).toContain("bg-transparent");
  });

  /* The toolbar flavour is Button's whole machine, as before: ghost and
       chip at any size, and the 32px and smaller rungs. */
  it("keeps Button's chrome on ghost and chip triggers", () => {
    const ghost = renderTrigger({ variant: "ghost", size: "xl" });
    expect(ghost.getAttribute("data-flavour")).toBe("toolbar");
    expect(ghost.className).toContain("h-control-xl");
    expect(ghost.className).not.toContain("border-btn-border");
    expect(ghost.className).not.toContain("border-input");
    expect(ghost.className).toContain("hover:bg-btn-ghost-surface-hover");
    // The 10px "calmer than a button" exception is retired: Button's own
    // 40px corner stands.
    expect(ghost.className).toContain("rounded-xl");
    expect(ghost.className).not.toContain("rounded-lg");
    cleanup();
    const chip = renderTrigger({ variant: "chip" });
    expect(chip.getAttribute("data-flavour")).toBe("toolbar");
    expect(chip.className).toContain("border-btn-border");
  });

  it("keeps Button's ladder on a secondary trigger at the toolbar sizes", () => {
    const trigger = renderTrigger({ size: "default" });
    expect(trigger.getAttribute("data-flavour")).toBe("toolbar");
    expect(trigger.className).toContain("h-control");
    expect(trigger.className).toContain("border-btn-border");
    expect(trigger.className).toContain(
      "data-[state=open]:bg-btn-surface-hover",
    );
    expect(trigger.className).toContain("bg-background");
    expect(trigger.className).not.toContain("border-input");
    // Bordered toolbar triggers repeat the hover pair on active.
    expect(trigger.className).toContain("active:bg-btn-surface-hover");
  });

  /* The chevron: 50% at rest, 70% on hover and while open, a half turn
       on open that runs 200ms ease-out (a rotation, not a colour tick). */
  it("turns the chevron over 200ms ease-out", () => {
    const trigger = renderTrigger();
    expect(trigger.innerHTML).toContain("rotate-180");
    expect(trigger.innerHTML).toContain("opacity-50");
    expect(trigger.innerHTML).toContain(
      "group-data-[state=open]/select-trigger:opacity-70",
    );
    expect(trigger.innerHTML).toContain("duration-200");
    expect(trigger.innerHTML).toContain("ease-out");
  });

  /* The chevron lives in a 16px box. Left unsized, a house icon is 24px
       and overflows it 4px a side (Button sized it through a descendant
       rule the field trigger did not carry). Size it on the glyph itself,
       and keep the descendant rule for any other icon in the trigger. */
  it("draws the chevron at 16px inside its 16px box", () => {
    const trigger = renderTrigger();
    const chevron = trigger.querySelector("svg");
    expect(chevron?.getAttribute("class") ?? "").toContain("size-4");
    expect(trigger.className).toContain("[&_svg:not([class*='size-'])]:size-4");
  });

  it("takes Button variants and sizes", () => {
    const cls = renderTrigger({ variant: "ghost", size: "xl" }).className;
    expect(cls).toContain("h-control-xl");
    expect(cls).not.toContain("border-btn-border");
    expect(cls).toContain("hover:bg-btn-ghost-surface-hover");
  });

  /* WIDTH RULE: trigger buttons hug. A chip (filter) trigger must not
       fill its row; only form selects are w-full. */
  it("chip triggers hug their content", () => {
    render(
      <Select defaultValue="a">
        <SelectTrigger variant="chip">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).not.toContain("w-full");
  });

  /* chevron={false}: a ghost text select or an icon-only trigger. No
       trailing chevron renders, and icon sizes skip the field w-full so
       the square stays square. */
  it("drops the chevron and keeps icon squares square", () => {
    render(
      <Select defaultValue="a">
        <SelectTrigger
          variant="ghost"
          size="icon"
          chevron={false}
          aria-label="Filter"
        >
          <span>x</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = document.querySelector(
      '[data-slot="select-trigger"]',
    ) as HTMLElement;
    expect(trigger.querySelector("svg")).toBeNull();
    expect(trigger.className).toContain("aspect-square");
    expect(trigger.className).not.toContain("w-full");
    // justify-between parks a lone icon at the start, so squares recenter.
    expect(trigger.className).toContain("justify-center");
    expect(trigger.className).not.toContain("justify-between");
  });

  /* A toolbar trigger's 4px gap serves the chevron, so a leading icon
       needs the extra margin to land on the 8px icon-to-text rhythm. A
       field's gap is already 8, and the extra margin would double it. */
  it("spaces a leading icon off the value on the 8px rhythm in both flavours", () => {
    const toolbar = renderTrigger({ variant: "ghost" });
    expect(toolbar.className).toContain("gap-1");
    expect(toolbar.className).toContain("[&>svg:not(:only-child)]:me-1.5");
    cleanup();
    const field = renderTrigger();
    expect(field.className).toContain("gap-2");
    expect(field.className).not.toContain("[&>svg:not(:only-child)]:me-1.5");
  });
});

describe("Select trigger value", () => {
  function textNodeClass(root: Element, text: string): string {
    const hit = [...root.querySelectorAll("*")].find(
      (el) => el.children.length === 0 && el.textContent === text,
    );
    return hit?.getAttribute("class") ?? "";
  }

  /* The value container is a flex row (icon plus text), and a flex
       container overrides line-clamp's display, so a long value was cut at
       the edge with no ellipsis. The text itself is the truncating
       element. */
  it("ends a long value in an ellipsis on one line", () => {
    const long = "Premium hand-poured soy candles and home fragrance gift sets";
    render(
      <Select defaultValue="a">
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">{long}</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = document.querySelector('[data-slot="select-trigger"]');
    if (!trigger) throw new Error("no trigger");
    expect(textNodeClass(trigger, long)).toContain("truncate");
    const value = trigger.querySelector('[data-slot="select-value"]');
    expect(value?.className).not.toContain("line-clamp-1");
  });

  it("ends a long placeholder, and a long closed reason, the same way", () => {
    const reason = "Pick a language first, the accent depends on it";
    render(
      <Select>
        <SelectTrigger className="w-40" closed={reason}>
          <SelectValue placeholder="Accent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = document.querySelector('[data-slot="select-trigger"]');
    if (!trigger) throw new Error("no trigger");
    expect(textNodeClass(trigger, reason)).toContain("truncate");
  });
});

describe("Select content", () => {
  /* Regression: the panel once defaulted to Radix's item-aligned macOS
       mode; the menu must drop below the trigger (popper). The scroll-my-1
       viewport class only renders in popper mode. */
  it("defaults to popper positioning", () => {
    renderOpen();
    const viewport = document.querySelector("[data-radix-select-viewport]");
    expect(viewport?.className).toContain("scroll-my-1");
  });

  it("is the frosted popover: translucent surface, blur, no border", () => {
    renderOpen();
    const content = document.querySelector('[data-slot="select-content"]');
    const cls = content?.className ?? "";
    expect(cls).toContain("bg-popover-surface");
    expect(cls).toContain("backdrop-blur-popover");
    expect(cls).not.toContain("border-border");
    // z-popover: the panel must layer above a dialog (z-modal). It
    // once opened behind one on z-dropdown.
    expect(cls).toContain("z-popover");
  });

  /* Regression: overflow on the content made the panel the scroller.
       The chevron strips scrolled away with the list. The viewport is the
       scroller; the panel is a flex column that clips. */
  it("scrolls in the viewport, not the panel", () => {
    renderOpen();
    const content = document.querySelector('[data-slot="select-content"]');
    const cls = content?.className ?? "";
    expect(cls).toContain("overflow-hidden");
    expect(cls).not.toContain("overflow-y-auto");
    expect(cls).toContain("flex-col");
  });
});

describe("Select trigger closed state", () => {
  /* CLOSED is the DESIGNED unavailable state (disabled is the separate,
       form-machinery one): rest look at half opacity, no HTML disabled
       attribute (but aria-disabled ON, so AT announces the state), mouse
       blocked so the wrapper's arrow cursor and tooltip take over, button
       out of the tab order while the wrapper takes focus for the keyboard
       tooltip. */
  it("dims, blocks the pointer, and keeps the disabled attr off", () => {
    render(
      <Select>
        <SelectTrigger closed="Select a language first" className="w-48">
          <SelectValue placeholder="Accent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = document.querySelector(
      '[data-slot="select-trigger"]',
    ) as HTMLButtonElement;
    expect(trigger.className).toContain("pointer-events-none");
    expect(trigger.className).toContain("opacity-50");
    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(trigger.tabIndex).toBe(-1);
    const wrapper = document.querySelector(
      '[data-slot="select-trigger-closed"]',
    ) as HTMLElement;
    expect(wrapper.tabIndex).toBe(0);
    expect(wrapper.className).toContain("cursor-default");
    // Layout width moves to the wrapper (the tooltip's anchor). A
    // full-row span once floated the tooltip far from the control.
    expect(wrapper.className).toContain("w-48");
    expect(trigger.className).not.toContain("w-48");
    // …and the trigger fills that wrapper, or a w-full form select
    // would shrink to its content the moment it closed.
    expect(trigger.className).toContain("w-full");
  });

  /* Touch has no hover, so a reason that lives only in the tooltip never
       reaches a phone. An empty closed select SHOWS the reason in the
       field, where the placeholder goes. */
  it("shows the reason as the placeholder while nothing is picked", () => {
    render(
      <Select>
        <SelectTrigger closed="Pick a language first">
          <SelectValue placeholder="Accent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = document.querySelector(
      '[data-slot="select-trigger"]',
    ) as HTMLElement;
    expect(trigger.textContent).toContain("Pick a language first");
    expect(trigger.textContent).not.toContain("Accent");
    expect(trigger.hasAttribute("data-placeholder")).toBe(true);
  });

  /* A server component's children reach the trigger as elements whose
       type is not the SelectValue function reference, so a check on the
       child's type never matches there (client-rendered tests pass
       anyway). The reason travels by context, read by whichever
       SelectValue is inside the trigger, wrapped or not. */
  it("shows the reason when the SelectValue arrives wrapped", () => {
    function Wrapped(
      props: React.ComponentProps<typeof SelectValue>,
    ): React.JSX.Element {
      return <SelectValue {...props} />;
    }
    render(
      <>
        <Select>
          <SelectTrigger closed="Pick a language first">
            <Wrapped placeholder="Accent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="a">
          <SelectTrigger closed="Locked after the first order">
            <Wrapped placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </>,
    );
    const [empty, picked] = document.querySelectorAll(
      '[data-slot="select-trigger"]',
    );
    expect(empty.textContent).toContain("Pick a language first");
    expect(empty.textContent).not.toContain("Accent");
    expect(picked.textContent).toContain("Alpha");
    expect(picked.textContent).not.toContain("Locked after");
  });

  /* A SelectValue outside any closed trigger keeps its own placeholder. */
  it("leaves an open select's placeholder alone", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Accent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(
      document.querySelector('[data-slot="select-trigger"]')?.textContent,
    ).toContain("Accent");
  });

  it("keeps a picked value in view: the reason only replaces a placeholder", () => {
    render(
      <Select defaultValue="a">
        <SelectTrigger closed="Locked after the first order">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = document.querySelector(
      '[data-slot="select-trigger"]',
    ) as HTMLElement;
    expect(trigger.textContent).toContain("Alpha");
    expect(trigger.textContent).not.toContain("Locked after");
  });
});

describe("Select item action", () => {
  /* The action slot stops its events, so pressing a row's pin/settings
       control must never select the option. */
  it("does not select the option when pressed", () => {
    const onValueChange = vi.fn();
    render(
      <Select open defaultValue="a" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="a"
            action={
              <button type="button" aria-label="pin">
                pin
              </button>
            }
          >
            Alpha
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const pin = document.querySelector(
      '[data-slot="select-item-action"] button',
    ) as HTMLElement;
    fireEvent.pointerUp(pin);
    fireEvent.click(pin);
    expect(onValueChange).not.toHaveBeenCalled();
    // Hover-revealed: hidden at rest, shown on row highlight. The
    // action is pointer-only by construction (an open Select owns the
    // keyboard), so there is deliberately no focus-within reveal.
    const slot = document.querySelector('[data-slot="select-item-action"]');
    expect(slot?.className).toContain("opacity-0");
    expect(slot?.className).toContain("group-focus/select-item:opacity-100");
    expect(slot?.className).not.toContain("focus-within:opacity-100");
  });
});

describe("Select content tone", () => {
  /* The panel-side answer to quiet triggers: tone="quiet" renders items
       at muted-foreground rising to ink on highlight (the quiet-menu
       recipe). Keyed off the content's data-tone so one attribute flips
       every item. */
  it("quiet tone dims items and raises them on highlight", () => {
    render(
      <Select open defaultValue="a">
        <SelectTrigger variant="chip">
          <SelectValue />
        </SelectTrigger>
        <SelectContent tone="quiet">
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );
    const content = document.querySelector('[data-slot="select-content"]');
    expect(content?.getAttribute("data-tone")).toBe("quiet");
    const item = document.querySelector('[data-slot="select-item"]');
    expect(item?.className).toContain(
      "in-data-[tone=quiet]:text-muted-foreground",
    );
    expect(item?.className).toContain(
      "in-data-[tone=quiet]:focus:text-foreground",
    );
  });
});

describe("Select item disabledReason", () => {
  /* An unavailable option says why: disabledReason implies disabled but
       wins pointer events back so the row can host its tooltip. */
  it("stays disabled while hoverable for the tooltip", () => {
    render(
      <Select open defaultValue="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b" disabledReason="Coming soon">
            Beta
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const items = document.querySelectorAll('[data-slot="select-item"]');
    const beta = items[1] as HTMLElement;
    expect(beta.getAttribute("data-disabled")).not.toBeNull();
    expect(beta.className).toContain("data-disabled:pointer-events-auto");
    expect(beta.className).toContain("data-disabled:cursor-default");
  });
});

describe("Select item icons", () => {
  /* Regression: icons passed as children land inside ItemText's span, so
       an item-level direct-child rule never sized them: 24px raw icons
       stacked over their labels in the panel. The row layout and the 20px
       rule live on the ItemText span itself. */
  it("sizes child icons through the ItemText span", () => {
    renderOpen();
    const item = document.querySelector('[data-slot="select-item"]');
    const textSpan = item?.querySelector("span");
    expect(textSpan?.className).toContain(
      "[&>svg:not([class*='size-'])]:size-4",
    );
    expect(textSpan?.className).toContain("items-center");
  });
});

describe("Select item", () => {
  /* Regression: an absolutely-positioned check over a pe-8 reserve. We
       keep the check IN-FLOW in an always-reserved box, so
       selection can't shift the row's text. */
  it("reserves the check's box in-flow", () => {
    renderOpen();
    const indicator = document.querySelector(
      '[data-slot="select-item-indicator"]',
    );
    const cls = indicator?.className ?? "";
    expect(cls).toContain("ms-auto");
    expect(cls).not.toContain("absolute");
  });

  /* The open panel is what a thumb scrolls: rows meet the 44px floor on a
       touch screen (the 36px row measured by the STU-06 critic). */
  it("takes the 44px floor on touch", () => {
    renderOpen();
    const item = document.querySelector('[data-slot="select-item"]');
    expect(item?.className).toContain("pointer-coarse:min-h-11");
  });

  /* foundation has no --accent on purpose: shadcn's focus:bg-accent
       resolves to nothing and the highlight silently disappears. */
  it("highlights with the ghost fill, not the dead accent token", () => {
    renderOpen();
    const item = document.querySelector('[data-slot="select-item"]');
    const cls = item?.className ?? "";
    expect(cls).toContain("focus:bg-btn-ghost-surface-hover");
    expect(cls).not.toContain("bg-accent");
  });
});
