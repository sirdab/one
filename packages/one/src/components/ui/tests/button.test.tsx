import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buttonVariants as barrelVariants } from "../../../index";
import { Button } from "../button";
import { buttonVariants } from "../button-variants";

describe("Button asChild", () => {
  it("renders the child element, not a nested button", () => {
    render(
      <Button asChild>
        <a href="#start">Start</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Start" });
    expect(link.tagName).toBe("A");
    expect(screen.queryByRole("button")).toBeNull();
  });

  /* Regression: `disabled` spread onto an <a> is invalid HTML and the link
       stayed navigable. asChild swaps it for aria-disabled, whose styles and
       pointer-events-none come from the glue's variant redefinition. */
  it("swaps disabled for aria-disabled on non-button children", () => {
    render(
      <Button asChild disabled>
        <a href="#start">Start</a>
      </Button>,
    );
    const link = screen.getByText("Start");
    expect(link.hasAttribute("disabled")).toBe(false);
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.className).toContain("aria-disabled:pointer-events-none");
  });

  it("keeps the real disabled attribute on real buttons", () => {
    render(<Button disabled>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveProperty("disabled", true);
    expect(button.hasAttribute("aria-disabled")).toBe(false);
  });

  /* Regression: the redefined `disabled:` variant also matches
       aria-disabled, so pointer-events for REAL disabled buttons must use
       the explicit [&:disabled] form or the two rules fight. */
  it("scopes pointer-events-auto to real :disabled only", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("[&:disabled]:pointer-events-auto");
    expect(button.className).not.toMatch(
      /(?<!\[&:)disabled:pointer-events-auto/,
    );
  });
});

describe("Button loading", () => {
  it("shows the spinner and keeps the label in the tree", () => {
    render(<Button loading>Generating</Button>);
    const button = screen.getByRole("button", { name: "Generating" });
    expect(button.getAttribute("data-loading")).toBe("true");
    expect(button.querySelector("svg.animate-spin")).not.toBeNull();
  });

  /* Regression: the foreground fallback painted a full-ink spinner over
       chip's 53% muted-foreground label. */
  it("chip's spinner matches its label tone", () => {
    render(
      <Button variant="chip" loading>
        Filtering
      </Button>,
    );
    const spinner = screen
      .getByRole("button")
      .querySelector("svg.animate-spin");
    expect(spinner?.parentElement?.className).toContain(
      "text-muted-foreground",
    );
  });

  /* Regression: Slot requires exactly one child. The spinner made it two
       and every prerender of an asChild button crashed the build. */
  it("asChild + loading renders without the spinner instead of crashing", () => {
    render(
      <Button asChild loading>
        <a href="#go">Go</a>
      </Button>,
    );
    const link = screen.getByText("Go");
    expect(link.getAttribute("data-loading")).toBe("true");
    expect(link.querySelector("svg.animate-spin")).toBeNull();
  });
});

describe("Button variants", () => {
  /* Decision: destructive is a red OUTLINE, never a fill, never primary.
       Border and text share the one button red (btn-destructive, #DD4949);
       text-destructive is the error-text red, a different job. */
  it("destructive renders the red outline, not a fill", () => {
    render(<Button variant="destructive">Delete account</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("border-btn-destructive");
    expect(cls).toContain("text-btn-destructive");
    expect(cls).not.toContain("bg-primary");
    expect(cls).not.toMatch(/\bbg-destructive\b/);
  });

  /* Regression: link inherited the default 32px box. */
  it("link is text, not a box, at any size", () => {
    render(
      <Button variant="link" size="xl">
        More
      </Button>,
    );
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("h-auto");
    expect(cls).toContain("p-0");
    expect(cls).not.toContain("h-control-xl");
  });

  /* Decision: chip is the quiet variant (icon-quiet ladder, secondary label). */
  it("chip carries the quiet icon ladder", () => {
    render(<Button variant="chip">Apparel</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("[&_svg]:icon-quiet");
    // hover steps the icon to the LABEL's tone, never full ink.
    // opacity-100 inverted the icon/label hierarchy once.
    expect(cls).toContain("hover:[&_svg]:icon-quiet-hover");
    expect(cls).not.toContain("hover:[&_svg]:opacity-100");
    // and disabled stays transparent: bg-background punched a solid
    // rectangle out of tinted surfaces.
    expect(cls).toContain("disabled:bg-transparent");
    expect(cls).not.toContain("disabled:bg-background");
  });
});

describe("Button icon squares", () => {
  /* Regression: the bridge pads every [data-slot=button] 12px inline as a
       base-layer default; without an explicit padding utility the icon
       squares grew to fit it (icon rendered 40x32, secondary 42x32). px-0 +
       aspect-square is the contract that keeps them square. */
  it("every icon size pins px-0 and aspect-square", () => {
    for (const size of [
      "icon",
      "icon-xs",
      "icon-sm",
      "icon-lg",
      "icon-xl",
    ] as const) {
      const { unmount } = render(<Button size={size} aria-label="probe" />);
      const cls = screen.getByRole("button", {
        name: "probe",
      }).className;
      expect(cls, size).toContain("px-0");
      expect(cls, size).toContain("aspect-square");
      unmount();
    }
  });

  /* Regression: chip's icon sets an explicit colour (icon-quiet), so the
       loading text-transparent never reached it. The icon rendered under
       the spinner. Direct-child icons must hide while loading. */
  it("hides direct-child icons while loading", () => {
    render(<Button loading>Go</Button>);
    expect(screen.getByRole("button").className).toContain(
      "data-[loading=true]:[&>svg]:opacity-0",
    );
  });
});

describe("Button interaction", () => {
  it("disabled real buttons do not fire clicks", () => {
    let clicks = 0;
    render(
      <Button disabled onClick={() => clicks++}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(clicks).toBe(0);
  });

  /* Regression: loading only dimmed the label. The button stayed fully
       clickable, so a double-click double-submitted. Loading now blocks
       activation (keeping focus, unlike `disabled`) and announces busy. */
  it("loading buttons announce busy and swallow clicks", () => {
    let clicks = 0;
    render(
      <Button loading onClick={() => clicks++}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(button);
    expect(clicks).toBe(0);
  });

  /* A control that refuses without saying why is a dead end, so
   disabledReason carries the WHY on a tooltip. The hard part is that it
   has to stay REACHABLE: the `disabled` attribute would drop the button
   out of the tab order and stop hover, which is exactly where the
   explanation lives. */
  describe("Button disabledReason", () => {
    it("stays focusable and hoverable instead of hard-disabled", () => {
      render(<Button disabledReason="اختر منتجًا أولاً">حذف</Button>);
      const button = screen.getByRole("button", { name: "حذف" });
      // never the real attribute: that kills focus and hover
      expect(button.hasAttribute("disabled")).toBe(false);
      expect(button.getAttribute("aria-disabled")).toBe("true");
      // and the base rule that strips pointer events from
      // aria-disabled elements has to be put back, or no hover, no
      // tooltip, no reason
      expect(button.className).toContain("aria-disabled:pointer-events-auto");
    });

    it("implies disabled and blocks activation", () => {
      const onClick = vi.fn();
      render(
        <Button disabledReason="اختر منتجًا أولاً" onClick={onClick}>
          حذف
        </Button>,
      );
      const button = screen.getByRole("button", { name: "حذف" });
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    /* Radix never opens a tooltip for a touch, so on a phone the
           reason was unreachable. A tap opens it; a mouse press does not
           (Radix closes on press, and the hover already showed it). */
    it("opens the reason on a tap, never on a mouse click", async () => {
      render(<Button disabledReason="اختر منتجًا أولاً">حذف</Button>);
      const button = screen.getByRole("button", { name: "حذف" });

      fireEvent.pointerDown(button, { pointerType: "mouse" });
      fireEvent.click(button);
      expect(screen.queryByText("اختر منتجًا أولاً")).toBeNull();

      fireEvent.pointerDown(button, { pointerType: "touch" });
      fireEvent.click(button);
      await screen.findByText("اختر منتجًا أولاً");
    });

    it("leaves a plain disabled button on the real attribute", () => {
      render(<Button disabled>حذف</Button>);
      const button = screen.getByRole("button", { name: "حذف" });
      expect(button.hasAttribute("disabled")).toBe(true);
    });
  });
});

/* The same trap the whole hint family shares: wrapping the control in
   TooltipTrigger asChild merges Radix's own data-state onto it, and every
   open/pressed pairing on a Button selects on that. The hint has to ride
   a wrapper instead. */
describe("Button hint", () => {
  it("keeps the button's own data-state when it carries a hint", () => {
    render(
      <Button data-state="on" hint="يعرض المسودات كمان">
        المسودات
      </Button>,
    );
    const button = screen.getByRole("button", { name: "المسودات" });
    expect(button.getAttribute("data-state")).toBe("on");
    expect(button.getAttribute("data-slot")).toBe("button");
  });

  it("stays enabled: a hint explains, it does not refuse", () => {
    const onClick = vi.fn();
    render(
      <Button hint="ينسخ الرابط" onClick={onClick}>
        نسخ
      </Button>,
    );
    const button = screen.getByRole("button", { name: "نسخ" });
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  /* A button that will not fire has one thing worth saying, and it is
       not what the button would have done. */
  it("says nothing on hover when it is off with no reason", async () => {
    render(
      <Button disabled hint="Mark all as read">
        x
      </Button>,
    );
    expect(document.querySelector('[data-slot="tooltip-trigger"]')).toBeNull();
  });

  it("lets disabledReason outrank hint", async () => {
    render(
      <Button disabledReason="اختر منتجًا أولاً" hint="يحذف المنتج">
        حذف
      </Button>,
    );
    const button = screen.getByRole("button", { name: "حذف" });
    fireEvent.focus(button);
    // findByText throws when it misses, so reaching the next line is
    // the assertion that the reason is what opened.
    await screen.findByText("اختر منتجًا أولاً");
    expect(screen.queryByText("يحذف المنتج")).toBeNull();
  });

  /* Placement is a PROP because Radix will not solve it: it flips a
       tooltip only when the tooltip would leave the VIEWPORT, and an icon
       button in a top bar usually has just enough room above it. So the
       hint opens back into the bar it sits in, no collision, no flip.
       Asserted on both, because the side has to follow whichever of the
       two is actually showing. */
  it("opens the hint on the side it is given", async () => {
    render(
      <Button hint="اللغة" hintSide="bottom" aria-label="اللغة">
        <span aria-hidden>A</span>
      </Button>,
    );
    fireEvent.focus(screen.getByRole("button", { name: "اللغة" }));
    const tip = await screen.findByText("اللغة");
    expect(tip.closest("[data-side]")?.getAttribute("data-side")).toBe(
      "bottom",
    );
  });

  it("places a disabledReason on that side too", async () => {
    render(
      <Button disabledReason="اختر منتجًا أولاً" hintSide="bottom">
        حذف
      </Button>,
    );
    fireEvent.focus(screen.getByRole("button", { name: "حذف" }));
    const tip = await screen.findByText("اختر منتجًا أولاً");
    expect(tip.closest("[data-side]")?.getAttribute("data-side")).toBe(
      "bottom",
    );
  });

  /* Regression: the tooltip wrapper is inline-flex, so it sizes to its
       content and a w-full button inside stops filling its row. */
  it("hands a w-full button its width back through the wrapper", () => {
    render(
      <Button className="w-full" hint="ينشر المتجر">
        نشر
      </Button>,
    );
    const wrapper = screen.getByRole("button", {
      name: "نشر",
    }).parentElement;
    expect(wrapper?.className).toContain("[&:has(>.w-full)]:w-full");
  });
});

/* shape is for IDENTITY triggers only (the account avatar). Pinned because
   the variant is invisible in every other size and would survive being
   dropped from the cva call unnoticed. */
describe("Button shape", () => {
  it("rounds fully only when asked", () => {
    render(<Button shape="circle">MT</Button>);
    expect(screen.getByRole("button").className).toContain("rounded-full");
  });

  it("keeps the house radius by default", () => {
    render(<Button>حفظ</Button>);
    expect(screen.getByRole("button").className).not.toContain("rounded-full");
  });

  it("wins over the icon size's radius", () => {
    render(
      <Button size="icon" shape="circle" aria-label="Account">
        MT
      </Button>,
    );
    const cls = screen.getByRole("button", { name: "Account" }).className;
    expect(cls).toContain("rounded-full");
    expect(cls).not.toContain("rounded-lg");
  });
});

/* A labelled button that is a lone glyph on a phone: square, the label kept
   for screen readers, and the leading glyph's optical pull toward the label
   dropped, which is what sat the glyph off centre. */
describe("Button phone=icon", () => {
  it("squares the box and hides the label below sm, keeping its name", () => {
    render(
      <Button phone="icon">
        <svg aria-hidden />
        <span>Add product</span>
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Add product" });
    expect(button.className).toContain("max-sm:aspect-square");
    expect(button.className).toContain(
      "max-sm:[&>svg:first-child]:not-only:ms-0",
    );
    expect(button.className).toContain("max-sm:[&>:not(svg)]:sr-only");
  });
});

/* A server component styles a LINK with buttonVariants (asChild around a
   server component's Link does not survive the RSC boundary). That only
   works while the recipe lives in a module without "use client": a
   client reference cannot be called from the server. */
describe("buttonVariants is server-callable", () => {
  it("gives compact buttons the Uqail touch hit area", () => {
    render(<Button size="xs">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" }).className).toContain(
      "touch-target",
    );
  });

  it("lives in a module with no client directive and the barrel serves that one", () => {
    const src = readFileSync(
      join(__dirname, "..", "button-variants.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/^["']use client["']/m);
    expect(barrelVariants).toBe(buttonVariants);
    expect(buttonVariants({ variant: "secondary", size: "xl" })).toContain(
      "h-control-xl",
    );
  });
});
