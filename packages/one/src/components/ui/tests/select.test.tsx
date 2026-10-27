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
  it("wears the field chrome: Input's border, hover, focus and open look", () => {
    renderOpen();

    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).toContain("border-input");
    expect(cls).toContain("bg-transparent");
    expect(cls).toContain("border-input-border-hover");
    expect(cls).toContain("focus-visible:border-ring");
    expect(cls).toContain("focus-visible:ring-input-focus");

    expect(cls).toContain("focus-visible:outline-hidden");
    expect(cls).not.toContain("outline-none");
    expect(cls).toContain("data-[state=open]:border-ring");
    expect(cls).toContain("data-[state=open]:ring-input-focus");
    expect(cls).not.toContain("border-btn-border");
    expect(cls).not.toContain("btn-surface");
  });

  it("hovers the border only on a field that is neither focused nor open", () => {
    renderOpen();
    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).toContain(
      "hover:not-focus-visible:not-data-[state=open]:border-input-border-hover",
    );
  });

  it("sets the value in the Input's type", () => {
    renderOpen();
    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).toContain("text-body-lg");
    expect(cls).toContain("sm:text-body-quiet");
    expect(cls).toContain("data-placeholder:text-subtle");
  });

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
  it("defaults to the field flavour at 40 with the Input's 12px corner", () => {
    const trigger = renderTrigger();
    expect(trigger.getAttribute("data-flavour")).toBe("field");
    expect(trigger.getAttribute("data-variant")).toBe("secondary");
    expect(trigger.getAttribute("data-size")).toBe("xl");
    expect(trigger.className).toContain(FIELD_HEIGHT.default);
    expect(trigger.className).toContain("h-control-xl");
    expect(trigger.className).toContain("rounded-xl");
    expect(trigger.className).not.toContain("rounded-lg");

    expect(trigger.className).toContain("touch-target");

    expect(trigger.className).not.toContain("active:bg-");
    expect(trigger.className).not.toContain("hover:bg-");

    expect(trigger.className).not.toContain("w-full");

    expect(trigger.className).toContain("disabled:opacity-50");
    expect(trigger.className).toContain("disabled:cursor-not-allowed");
  });

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

  it("keeps Button's chrome on ghost and chip triggers", () => {
    const ghost = renderTrigger({ variant: "ghost", size: "xl" });
    expect(ghost.getAttribute("data-flavour")).toBe("toolbar");
    expect(ghost.className).toContain("h-control-xl");
    expect(ghost.className).not.toContain("border-btn-border");
    expect(ghost.className).not.toContain("border-input");
    expect(ghost.className).toContain("hover:bg-btn-ghost-surface-hover");

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

    expect(trigger.className).toContain("active:bg-btn-surface-hover");
  });

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

    expect(trigger.className).toContain("justify-center");
    expect(trigger.className).not.toContain("justify-between");
  });

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

    expect(cls).toContain("z-popover");
  });

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

    expect(wrapper.className).toContain("w-48");
    expect(trigger.className).not.toContain("w-48");

    expect(trigger.className).toContain("w-full");
  });

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

    const slot = document.querySelector('[data-slot="select-item-action"]');
    expect(slot?.className).toContain("opacity-0");
    expect(slot?.className).toContain("group-focus/select-item:opacity-100");
    expect(slot?.className).not.toContain("focus-within:opacity-100");
  });
});

describe("Select content tone", () => {
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
  it("reserves the check's box in-flow", () => {
    renderOpen();
    const indicator = document.querySelector(
      '[data-slot="select-item-indicator"]',
    );
    const cls = indicator?.className ?? "";
    expect(cls).toContain("ms-auto");
    expect(cls).not.toContain("absolute");
  });

  it("takes the 44px floor on touch", () => {
    renderOpen();
    const item = document.querySelector('[data-slot="select-item"]');
    expect(item?.className).toContain("pointer-coarse:min-h-11");
  });

  it("highlights with the ghost fill, not the dead accent token", () => {
    renderOpen();
    const item = document.querySelector('[data-slot="select-item"]');
    const cls = item?.className ?? "";
    expect(cls).toContain("focus:bg-btn-ghost-surface-hover");
    expect(cls).not.toContain("bg-accent");
  });
});
