import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreviewIcon } from "../../icons/catalogue";
import { AiIcon } from "../../icons/shell";
import { Icon } from "../icon";
import {
  Segmented,
  SEGMENTED_ITEM,
  SEGMENTED_THUMB,
  SEGMENTED_TRACK,
  SegmentedItem,
} from "../segmented";

function stubItemRects(): void {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement): DOMRect {
      const items = [
        ...document.querySelectorAll('[data-slot="segmented-item"]'),
      ];
      const index = items.indexOf(this);
      const left = index === -1 ? 0 : index * 104;
      return new DOMRect(left, 0, index === -1 ? 0 : 100, 32);
    },
  );
}

function watchStyle(root: Element): () => string {
  const observer = new MutationObserver(() => undefined);
  const seen: string[] = [];
  observer.observe(root, {
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
    attributeOldValue: true,
  });
  return () => {
    for (const record of observer.takeRecords()) {
      seen.push(record.oldValue ?? "");
    }
    observer.disconnect();
    return seen.join("|");
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

function renderSegmented() {
  render(
    <Segmented defaultValue="a" aria-label="mode">
      <SegmentedItem value="a" icon={<Icon icon={AiIcon} />} label="Alpha" />
      <SegmentedItem
        value="b"
        icon={<Icon icon={PreviewIcon} />}
        label="Beta"
      />
    </Segmented>,
  );
}

describe("Segmented text-only", () => {
  it("shows every label with the thumb still moving", () => {
    render(
      <Segmented defaultValue="a" aria-label="mode">
        <SegmentedItem value="a" label="Alpha" />
        <SegmentedItem value="b" label="Beta" />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    expect(items[0].textContent).toContain("Alpha");
    expect(items[1].textContent).toContain("Beta");
    expect(items[0].querySelector("svg")).toBeNull();
    fireEvent.click(items[1]);
    expect(
      items[1].querySelector('[data-slot="segmented-thumb"]'),
    ).not.toBeNull();
  });

  it("animates the checked padding only on icon items", () => {
    render(
      <Segmented defaultValue="a" aria-label="mode">
        <SegmentedItem value="a" icon={<Icon icon={AiIcon} />} label="Alpha" />
        <SegmentedItem value="b" label="Beta" />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    expect(items[0].className).toContain("transition-all");
    expect(items[0].className).toContain("data-[state=checked]:ps-1.5");
    expect(items[1].className).not.toContain("data-[state=checked]:ps-1.5");
  });
});

describe("Segmented static", () => {
  it("keeps the state contract without motion classes", () => {
    render(
      <Segmented defaultValue="a" animated={false} aria-label="mode">
        <SegmentedItem value="a" icon={<Icon icon={AiIcon} />} label="Alpha" />
        <SegmentedItem
          value="b"
          icon={<Icon icon={PreviewIcon} />}
          label="Beta"
        />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    expect(
      items[0].querySelector('[data-slot="segmented-thumb"]'),
    ).not.toBeNull();
    const iconWrap = items[0].querySelector("svg")?.parentElement;
    expect(iconWrap?.className ?? "").not.toContain("transition-colors");

    expect(items[1].textContent).toContain("Beta");

    expect(items[0].className).not.toContain("data-[state=checked]:ps-1.5");
    fireEvent.click(items[1]);
    expect(
      items[1].querySelector('[data-slot="segmented-thumb"]'),
    ).not.toBeNull();
    expect(items[1].textContent).toContain("Beta");
  });
});

describe("Segmented", () => {
  it("is a radio group on the nesting-math track", () => {
    renderSegmented();
    const track = document.querySelector('[data-slot="segmented"]');
    expect(track?.getAttribute("role")).toBe("radiogroup");

    expect(track?.className).toContain("rounded-xl");
    expect(track?.className).toContain("p-1");
    expect(track?.className).toContain("w-fit");
    expect(track?.className).toContain("bg-muted");
    const item = document.querySelector('[data-slot="segmented-item"]');
    expect(item?.className).toContain("rounded-md");
    expect(item?.className).not.toContain("rounded-lg");
  });

  it("is 40 high, 44 on touch, with 32 and 36 items", () => {
    renderSegmented();
    const track = document.querySelector('[data-slot="segmented"]');
    expect(track?.className).toContain("h-control-xl");
    expect(track?.className).toContain("pointer-coarse:h-control-touch");
    const item = document.querySelector('[data-slot="segmented-item"]');
    expect(item?.className).toContain("h-8");
    expect(item?.className).toContain("pointer-coarse:h-9");
  });

  it("makes glyph-only items 32 square and 44 wide on touch", () => {
    render(
      <Segmented defaultValue="a" aria-label="section">
        <SegmentedItem
          value="a"
          icon={<Icon icon={AiIcon} />}
          label="Alpha"
          iconOnly
        />
        <SegmentedItem
          value="b"
          icon={<Icon icon={PreviewIcon} />}
          label="Beta"
          iconOnly
        />
      </Segmented>,
    );
    for (const item of document.querySelectorAll(
      '[data-slot="segmented-item"]',
    )) {
      expect(item.className).toContain("w-8");
      expect(item.className).toContain("pointer-coarse:w-11");
      expect(item.className).toContain("px-0");
    }
  });

  it("brings an unchosen label to ink on hover", () => {
    render(
      <Segmented defaultValue="a" aria-label="mode">
        <SegmentedItem value="a" label="Alpha" />
        <SegmentedItem value="b" label="Beta" />
      </Segmented>,
    );
    const [, second] = document.querySelectorAll(
      '[data-slot="segmented-label"]',
    );
    expect(second.className).toContain("text-muted-foreground");
    expect(second.className).toContain("group-hover:text-foreground");
    renderSegmented();
    const iconWrap = document
      .querySelectorAll('[data-slot="segmented-item"]')[2]
      .querySelector("svg")?.parentElement;
    expect(iconWrap?.className).toContain("group-hover:text-foreground");
  });

  it("wears the shared track, item and thumb recipe", () => {
    render(
      <Segmented defaultValue="a" aria-label="mode">
        <SegmentedItem value="a" label="Alpha" />
        <SegmentedItem value="b" label="Beta" />
      </Segmented>,
    );
    const track = document.querySelector('[data-slot="segmented"]');
    for (const token of SEGMENTED_TRACK.split(" ")) {
      expect(track?.classList.contains(token)).toBe(true);
    }
    const item = document.querySelector('[data-slot="segmented-item"]');
    for (const token of SEGMENTED_ITEM.split(" ")) {
      expect(item?.classList.contains(token)).toBe(true);
    }
    const thumb = document.querySelector('[data-slot="segmented-thumb"]');
    for (const token of SEGMENTED_THUMB.split(" ")) {
      expect(thumb?.classList.contains(token)).toBe(true);
    }
    expect(SEGMENTED_THUMB).toContain("bg-background");
    expect(SEGMENTED_THUMB).toContain("shadow-raised");
    expect(SEGMENTED_THUMB).toContain("rounded-md");
    expect(SEGMENTED_TRACK).not.toMatch(/\bbg-gray-\d+\b/);
  });

  it("never truncates a label: the track scrolls instead", () => {
    render(
      <Segmented defaultValue="a" aria-label="mode">
        <SegmentedItem value="a" label="المنتجات اللي نفدت من المخزون" />
        <SegmentedItem value="b" label="الكل" />
      </Segmented>,
    );
    const track = document.querySelector('[data-slot="segmented"]');
    expect(track?.className).toContain("max-w-full");
    expect(track?.className).toContain("overflow-x-auto");
    expect(track?.className).not.toContain("overflow-hidden");
    const item = document.querySelector('[data-slot="segmented-item"]');
    expect(item?.className).toContain("shrink-0");
    expect(item?.textContent).not.toContain("…");
    const label = document.querySelector('[data-slot="segmented-label"]');
    expect(label?.className).toContain("whitespace-nowrap");
    expect(label?.className).not.toContain("truncate");
  });

  it("mounts the thumb on the checked item and names every item", () => {
    renderSegmented();
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    expect(
      items[0].querySelector('[data-slot="segmented-thumb"]'),
    ).not.toBeNull();
    expect(items[1].querySelector('[data-slot="segmented-thumb"]')).toBeNull();
    expect(items[0].textContent).toContain("Alpha");

    expect(items[1].querySelector(".sr-only")?.textContent).toBe("Beta");

    expect(
      items[1].querySelector(".reveal-inline")?.hasAttribute("data-open"),
    ).toBe(false);
    expect(
      items[0].querySelector(".reveal-inline")?.hasAttribute("data-open"),
    ).toBe(true);
  });

  it("opens the checked label and closes the old one by data-open", () => {
    renderSegmented();
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    const reveal = (i: number) => items[i].querySelector(".reveal-inline");
    expect(reveal(0)?.className).toContain("duration-200");
    expect(reveal(0)?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(items[1]);
    expect(reveal(1)?.hasAttribute("data-open")).toBe(true);
    expect(reveal(0)?.hasAttribute("data-open")).toBe(false);
    expect(reveal(0)?.textContent).toContain("Alpha");
  });

  it("slides the thumb from the previous item and says so while it runs", () => {
    stubItemRects();
    renderSegmented();
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    const first = items[0].querySelector('[data-slot="segmented-thumb"]');
    expect(first?.hasAttribute("data-sliding")).toBe(false);
    expect(first?.getAttribute("style")).toBeNull();
    fireEvent.click(items[1]);
    const thumb = items[1].querySelector('[data-slot="segmented-thumb"]');
    expect(thumb?.hasAttribute("data-sliding")).toBe(true);
    expect(thumb?.className).toContain("transition-all");
    expect(thumb?.className).toContain("duration-200");

    expect(thumb?.getAttribute("style") ?? "").not.toContain("left");
    fireEvent.transitionEnd(thumb as Element);
    expect(thumb?.hasAttribute("data-sliding")).toBe(false);
  });

  it("starts the slide at the previous item's edges, transitions off", () => {
    stubItemRects();
    renderSegmented();
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    const read = watchStyle(
      document.querySelector('[data-slot="segmented"]') as Element,
    );
    fireEvent.click(items[1]);
    const history = read();
    expect(history).toContain("transition: none");

    expect(history).toContain("left: -104px");
    expect(history).toContain("right: 104px");
  });

  it("never slides on the first paint", () => {
    stubItemRects();
    renderSegmented();
    const thumb = document.querySelector('[data-slot="segmented-thumb"]');
    expect(thumb?.hasAttribute("data-sliding")).toBe(false);
    expect(thumb?.getAttribute("style")).toBeNull();
  });

  it("does not slide under reduced motion", () => {
    stubItemRects();
    const matchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...matchMedia(query),
      matches: query.includes("prefers-reduced-motion"),
    })) as typeof window.matchMedia;
    try {
      renderSegmented();
      const items = document.querySelectorAll('[data-slot="segmented-item"]');
      fireEvent.click(items[1]);
      const thumb = items[1].querySelector('[data-slot="segmented-thumb"]');
      expect(thumb?.hasAttribute("data-sliding")).toBe(false);
    } finally {
      window.matchMedia = matchMedia;
    }
  });

  it("places the thumb with no slide when animated is off", () => {
    stubItemRects();
    render(
      <Segmented defaultValue="a" animated={false} aria-label="mode">
        <SegmentedItem value="a" label="Alpha" />
        <SegmentedItem value="b" label="Beta" />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    fireEvent.click(items[1]);
    const thumb = items[1].querySelector('[data-slot="segmented-thumb"]');
    expect(thumb?.hasAttribute("data-sliding")).toBe(false);
    expect(thumb?.className).not.toContain("transition-all");
  });

  it("moves thumb and label on selection", () => {
    renderSegmented();
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    fireEvent.click(items[1]);
    expect(
      items[1].querySelector('[data-slot="segmented-thumb"]'),
    ).not.toBeNull();
    expect(items[1].textContent).toContain("Beta");
    expect(items[0].querySelector('[data-slot="segmented-thumb"]')).toBeNull();
  });

  it("keeps a controlled value fixed when the parent ignores changes", () => {
    render(
      <Segmented value="a" aria-label="مقاسات">
        <SegmentedItem value="a" label="Alpha" />
        <SegmentedItem value="b" label="Beta" />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    fireEvent.click(items[1]);
    expect(
      items[0].querySelector('[data-slot="segmented-thumb"]'),
    ).not.toBeNull();
    expect(items[1].querySelector('[data-slot="segmented-thumb"]')).toBeNull();
  });

  it("quiets unchecked icons and inks the checked one", () => {
    renderSegmented();
    const wrap = document
      .querySelectorAll('[data-slot="segmented-item"]')[0]
      .querySelector("svg")?.parentElement;
    const cls = wrap?.className ?? "";
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("group-data-[state=checked]:text-foreground");
    expect(cls).toContain("[&_svg]:duration-200");
  });

  it("opens an item's hint below it", () => {
    render(
      <Segmented defaultValue="list" aria-label="view">
        <SegmentedItem value="list" label="List" hint="As a list" />
        <SegmentedItem value="grid" label="Cards" hint="As cards" />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    fireEvent.keyDown(window, { key: "Tab" });
    act(() => (items[1] as HTMLElement).focus());
    const chip = document.querySelector('[data-slot="tooltip-content"]');
    expect(chip?.textContent).toContain("As cards");
    expect(chip?.getAttribute("data-side")).toBe("bottom");
  });

  it("keeps the radio's data-state when an item carries a hint", () => {
    render(
      <Segmented defaultValue="image" aria-label="الوضع">
        <SegmentedItem value="image" label="صورة" hint="صورة ثابتة" />
        <SegmentedItem value="video" label="فيديو" hint="مقطع قصير" />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute("data-state")).toBe("checked");
    expect(items[1].getAttribute("data-state")).toBe("unchecked");

    expect(items[0].getAttribute("data-slot")).toBe("segmented-item");
  });

  it("gives every item the 44px touch floor", () => {
    render(
      <Segmented defaultValue="chat" aria-label="الشاشة">
        <SegmentedItem value="chat" label="المحادثة" />
        <SegmentedItem
          value="preview"
          icon={<Icon icon={PreviewIcon} />}
          label="متجرك"
          iconOnly
        />
      </Segmented>,
    );
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item.classList.contains("touch-target")).toBe(true);
    }
  });
});

describe("Segmented concealed", () => {
  function renderGroup(concealed: boolean | undefined): HTMLElement {
    render(
      <Segmented defaultValue="a" aria-label="mode" concealed={concealed}>
        <SegmentedItem value="a" label="Alpha" />
        <SegmentedItem value="b" label="Beta" />
      </Segmented>,
    );
    return document.querySelector('[data-slot="segmented"]') as HTMLElement;
  }

  it("keeps its width but is invisible, inert and out of the accessibility tree", () => {
    const group = renderGroup(true);
    expect(group.classList.contains("invisible")).toBe(true);
    expect(group.hasAttribute("inert")).toBe(true);
    expect(group.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("radiogroup", { name: "mode" })).toBeNull();
  });

  it("springs in when it can act", () => {
    const group = renderGroup(false);
    expect(group.classList.contains("invisible")).toBe(false);
    expect(group.hasAttribute("inert")).toBe(false);
    expect(group.getAttribute("aria-hidden")).toBeNull();
    expect(group.className).toContain("animate-in");
    expect(group.className).toContain("zoom-in-75");
    expect(screen.getByRole("radiogroup", { name: "mode" })).not.toBeNull();
  });

  it("is untouched when the prop is left out", () => {
    const group = renderGroup(undefined);
    expect(group.classList.contains("invisible")).toBe(false);
    expect(group.hasAttribute("inert")).toBe(false);
    expect(group.className).not.toContain("animate-in");
  });
});

describe("SegmentedItem mark", () => {
  function renderMarked(): void {
    render(
      <Segmented defaultValue="a" aria-label="mode">
        <SegmentedItem value="a" label="Alpha" />
        <SegmentedItem value="b" label="Beta" mark="Has gaps" />
      </Segmented>,
    );
  }

  it("draws a 6px dot after the label of the marked item only", () => {
    renderMarked();
    const items = document.querySelectorAll('[data-slot="segmented-item"]');
    expect(items[0]?.querySelector('[data-slot="segmented-mark"]')).toBeNull();
    const dot = items[1]?.querySelector('[data-slot="segmented-mark"]');
    expect(dot?.getAttribute("class")).toContain("size-1.5");
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
  });

  it("names the dot for assistive tech, in the item's accessible name", () => {
    renderMarked();
    expect(
      screen.getByRole("radio", { name: /Beta.*Has gaps/ }),
    ).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Alpha" })).not.toBeNull();
  });

  it("leaves the checked state alone", () => {
    renderMarked();
    fireEvent.click(screen.getByRole("radio", { name: /Beta/ }));
    expect(
      screen.getByRole("radio", { name: /Beta/ }).getAttribute("data-state"),
    ).toBe("checked");
  });
});
