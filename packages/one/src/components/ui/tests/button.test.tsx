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
  it("destructive renders the red outline, not a fill", () => {
    render(<Button variant="destructive">Delete account</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("border-btn-destructive");
    expect(cls).toContain("text-btn-destructive");
    expect(cls).not.toContain("bg-primary");
    expect(cls).not.toMatch(/\bbg-destructive\b/);
  });

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

  it("chip carries the quiet icon ladder", () => {
    render(<Button variant="chip">Apparel</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("[&_svg]:icon-quiet");

    expect(cls).toContain("hover:[&_svg]:icon-quiet-hover");
    expect(cls).not.toContain("hover:[&_svg]:opacity-100");

    expect(cls).toContain("disabled:bg-transparent");
    expect(cls).not.toContain("disabled:bg-background");
  });
});

describe("Button icon squares", () => {
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

  describe("Button disabledReason", () => {
    it("stays focusable and hoverable instead of hard-disabled", () => {
      render(<Button disabledReason="اختر منتجًا أولاً">حذف</Button>);
      const button = screen.getByRole("button", { name: "حذف" });

      expect(button.hasAttribute("disabled")).toBe(false);
      expect(button.getAttribute("aria-disabled")).toBe("true");

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

    await screen.findByText("اختر منتجًا أولاً");
    expect(screen.queryByText("يحذف المنتج")).toBeNull();
  });

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
