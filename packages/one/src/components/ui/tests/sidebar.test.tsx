import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { Direction } from "radix-ui";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../sidebar";

function Rail(): React.JSX.Element {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Orders">Orders</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

function state(): string | null {
  return document
    .querySelector('[data-slot="sidebar"]')
    ?.getAttribute("data-state") as string | null;
}

describe("SidebarProvider open state", () => {
  // document.cookie is shared across the file, so neither cookie test may
  // depend on the other having run first.
  beforeEach(() => {
    document.cookie = "sidebar_state=; path=/; max-age=0";
  });

  it("toggles its own state when uncontrolled", () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
        <Rail />
      </SidebarProvider>,
    );
    expect(state()).toBe("expanded");
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(state()).toBe("collapsed");
  });

  /* The shell forces the rail shut in the studio view by holding `open`
       itself. If the internal state ever won instead, the rail would refuse
       to collapse and the whole assistant interplay would break. */
  it("lets a controlled open win over its internal state", () => {
    const onOpenChange = vi.fn();
    render(
      <SidebarProvider open={false} onOpenChange={onOpenChange}>
        <SidebarTrigger />
        <Rail />
      </SidebarProvider>,
    );
    expect(state()).toBe("collapsed");

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(state()).toBe("collapsed");
  });

  /* A controlled host owns persistence. Writing here too would record a
       value nothing reads, and in the studio view a value the rail never had. */
  it("does not write the cookie when a host controls it", () => {
    render(
      <SidebarProvider open onOpenChange={() => {}}>
        <SidebarTrigger />
        <Rail />
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(document.cookie).not.toContain("sidebar_state");
  });

  it("writes the cookie when it owns the state", () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
        <Rail />
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(document.cookie).toContain("sidebar_state=false");
  });

  it("throws outside a provider rather than rendering half a rail", () => {
    function Orphan(): React.JSX.Element {
      useSidebar();
      return <span />;
    }
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(
      /must be used within a SidebarProvider/,
    );
    quiet.mockRestore();
  });
});

describe("Sidebar chrome", () => {
  /* Stock wraps the subtree in TooltipProvider delayDuration={0}, and our
       Tooltip defers to an ancestor provider: that would silently re-tune
       every hint in the host's shell to fire instantly. */
  /* Radix's TooltipProvider renders NO DOM: it is pure context, so nothing
       in the rendered tree can tell you where one sits. The source is the only
       observable, and it is the right one anyway, since the regression to
       guard against is the next `shadcn add sidebar` pasting the stock wrapper
       back onto the whole subtree. */
  function sourceOf(fn: string): string {
    const src = readFileSync(join(__dirname, "..", "sidebar.tsx"), "utf8");
    const start = src.indexOf(`function ${fn}(`);
    expect(start, `${fn} not found`).toBeGreaterThan(-1);
    const next = src.indexOf("\nfunction ", start + 1);
    return src.slice(start, next === -1 ? undefined : next);
  }

  it("keeps the zero-delay provider off the whole subtree", () => {
    // Stock puts one here, which re-tunes every hint in the host's shell.
    expect(sourceOf("SidebarProvider")).not.toContain("<TooltipProvider");
  });

  it("scopes the zero-delay provider to the nav cluster", () => {
    // The rows ARE their labels when collapsed, so they open instantly.
    expect(sourceOf("SidebarMenu")).toContain(
      "<TooltipProvider delayDuration={0}>",
    );
  });

  it("collapses to the rail's icon width, not stock's", () => {
    render(
      <SidebarProvider open={false}>
        <Rail />
      </SidebarProvider>,
    );
    const gap = document.querySelector('[data-slot="sidebar-gap"]');
    expect(gap?.className).toContain(
      "group-data-[collapsible=icon]:w-shell-rail-icon",
    );
  });

  /* Nav rows are the ladder's 0 rung. A row-level transition-all would ease
       the hover FILL over the rail's own 300ms, which reads as lag. */
  it("snaps the nav row rather than easing its fill", () => {
    render(
      <SidebarProvider>
        <Rail />
      </SidebarProvider>,
    );
    const row = screen.getByRole("button", { name: "Orders" });
    expect(row.className).not.toContain("transition-all duration-300");
  });

  it("announces the current row, not just paints it", () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Orders</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(
      screen
        .getByRole("button", { name: "Orders" })
        .getAttribute("aria-current"),
    ).toBe("page");
  });

  /* button.tsx's rule: icon-only sizes need a label AND a hint. The hint
       has to follow the state, since "expand" and "collapse" are different
       promises about what the click will do. */
  it("hints at the result of the press, and follows the state", async () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
        <Rail />
      </SidebarProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Toggle sidebar" });
    fireEvent.focus(trigger);
    expect(await screen.findByText("Collapse the sidebar")).toBeDefined();

    fireEvent.click(trigger);
    fireEvent.focus(trigger);
    expect(await screen.findByText("Expand the sidebar")).toBeDefined();
  });

  it("never sets outline-none on the nav row", () => {
    render(
      <SidebarProvider>
        <Rail />
      </SidebarProvider>,
    );
    const row = screen.getByRole("button", { name: "Orders" });
    expect(row.className).not.toContain("outline-none");
    expect(row.className).not.toContain("outline-hidden");
  });
});

/* The RTL mirror [Sirdab 2026-08-01]: side stays physical (doctrine), so the
   HOST picks it per direction, and everything downstream of that choice has
   to follow. Two things read `side` today: the container's own position, and
   the collapsed row's tooltip, which has to open AWAY from whichever edge
   the rail lands on. A future refactor of SidebarMenuButton has nothing else
   to catch a regression here. */
describe("Sidebar RTL mirroring", () => {
  it("carries side onto the container, defaulting to left", () => {
    render(
      <SidebarProvider>
        <Rail />
      </SidebarProvider>,
    );
    expect(
      document
        .querySelector('[data-slot="sidebar"]')
        ?.getAttribute("data-side"),
    ).toBe("left");
  });

  it("carries an explicit side onto the container", () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="icon" side="right">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Orders">Orders</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(
      document
        .querySelector('[data-slot="sidebar"]')
        ?.getAttribute("data-side"),
    ).toBe("right");
  });

  it("opens the collapsed row's tooltip away from the default left rail", async () => {
    render(
      <SidebarProvider open={false}>
        <Rail />
      </SidebarProvider>,
    );
    fireEvent.focus(screen.getByRole("button", { name: "Orders" }));
    expect(
      (
        await screen.findByText("Orders", {
          selector: '[data-slot="tooltip-content"]',
        })
      ).getAttribute("data-side"),
    ).toBe("right");
  });

  /* This is the bug the RTL gate caught: a hardcoded side="right" here put
       the tooltip off the edge of the viewport once the rail itself mirrored
       to the right, since there was no room left for it to open further
       right. */
  it("opens the collapsed row's tooltip away from a mirrored right rail", async () => {
    render(
      <SidebarProvider open={false}>
        <Sidebar collapsible="icon" side="right">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Orders">Orders</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    fireEvent.focus(screen.getByRole("button", { name: "Orders" }));
    expect(
      (
        await screen.findByText("Orders", {
          selector: '[data-slot="tooltip-content"]',
        })
      ).getAttribute("data-side"),
    ).toBe("left");
  });
});

/* The mobile rail is a Sheet, and the Sheet speaks LOGICAL sides while this
   component's `side` prop is PHYSICAL. Composing the two translations is
   where it went wrong, and it went wrong silently: the desktop rail sat on
   the correct edge in Arabic while the phone drawer came out of the opposite
   one, which is not something a test of either half alone can see. */
describe("the mobile drawer opens from the rail's own edge", () => {
  function mountPhone(
    dir: "ltr" | "rtl",
    side: "left" | "right",
    scheme?: "dark",
  ): void {
    /* Under the hook's breakpoint, which is what turns the rail into a
           Sheet. useIsMobile decides on innerWidth and only uses matchMedia
           to hear about changes, so the width is the part that matters. */
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 480,
    });

    render(
      <Direction.Provider dir={dir}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon" side={side} scheme={scheme}>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Orders</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarTrigger>open</SidebarTrigger>
        </SidebarProvider>
      </Direction.Provider>,
    );
    fireEvent.click(screen.getByText("open"));
  }

  /* The PHYSICAL edge vaul settled on, not the logical side handed to the
       Sheet. That is the whole point: both translations were individually
       defensible and the physical result was still wrong, so the assertion
       has to be the thing the merchant actually sees move. */
  function drawerEdge(): string | null | undefined {
    return document
      .querySelector("[data-vaul-drawer-direction]")
      ?.getAttribute("data-vaul-drawer-direction");
  }

  it("opens from the left in LTR, where the rail is on the left", () => {
    mountPhone("ltr", "left");
    expect(drawerEdge()).toBe("left");
  });

  it("opens from the right in RTL, where the rail is on the right", () => {
    /* The regression. The host passes side="right" in Arabic BECAUSE
           right is the inline start there; mapping right→end sent the drawer
           to physical left, the opposite edge from the rail it stands in for. */
    mountPhone("rtl", "right");
    expect(drawerEdge()).toBe("right");
  });

  it("carries a dark rail's scheme into the drawer, which portals out of it", () => {
    /* Regression (2026-09-30): the drawer renders in <body>, outside the
           host's dark scope, so the studio's ink rail opened as a light
           drawer on a phone. */
    mountPhone("ltr", "left", "dark");
    const drawer = document.querySelector('[data-mobile="true"]');
    expect(drawer?.classList.contains("dark")).toBe(true);
  });

  it("still opens from the far edge for a rail that really is on one", () => {
    // Not every Sidebar is this app's rail: right-in-LTR is a genuine
    // end-side panel and must not be dragged along by the fix.
    mountPhone("ltr", "right");
    expect(drawerEdge()).toBe("right");
  });
});

/* Regression (2026-10-01): a nav row tapped in the phone drawer changed
   the route and left the drawer open over the new page. */
describe("the mobile drawer closes on navigation", () => {
  function mountPhoneWithLinks(): void {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 480,
    });
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="/app/orders"
                    /* As next/link does: it cancels the
                                           click to route on the client. */
                    onClick={(event) => event.preventDefault()}
                  >
                    Orders
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Switch store</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarTrigger>open</SidebarTrigger>
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByText("open"));
  }

  function drawerOpen(): boolean {
    return document.querySelector('[data-mobile="true"]') !== null;
  }

  it("closes when a link in it is tapped, even one that routes itself", () => {
    mountPhoneWithLinks();
    expect(drawerOpen()).toBe(true);
    fireEvent.click(screen.getByText("Orders"));
    expect(
      document
        .querySelector('[data-mobile="true"]')
        ?.getAttribute("data-state"),
    ).not.toBe("open");
  });

  it("stays open for a row that is not a link, and for a new-tab click", () => {
    mountPhoneWithLinks();
    fireEvent.click(screen.getByText("Switch store"));
    expect(drawerOpen()).toBe(true);
    fireEvent.click(screen.getByText("Orders"), { metaKey: true });
    expect(
      document
        .querySelector('[data-mobile="true"]')
        ?.getAttribute("data-state"),
    ).toBe("open");
  });
});

/* The studio's folding rail (SAI-1177). Offcanvas hides by translating, and a
   translate hides nothing from the keyboard: Tab walked into a nav nobody
   could see. `peek` is the hover reveal: the container comes back OVER the
   page while the gap stays shut, so the layout never moves under it. */
describe("Sidebar peek and inert", () => {
  /* The mobile block above pins innerWidth to a phone for good, and this
       rail is the DESKTOP branch: without the width back, every case here
       renders a closed Sheet and asserts against an empty document. */
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });
  });

  function OffcanvasRail({
    peek = false,
    side = "left",
  }: {
    peek?: boolean;
    side?: "left" | "right";
  }): React.JSX.Element {
    return (
      <Sidebar collapsible="offcanvas" peek={peek} side={side}>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Orders">Orders</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }

  function container(): HTMLElement {
    const node = document.querySelector('[data-slot="sidebar-container"]');
    if (!node) throw new Error("container not rendered");
    return node as HTMLElement;
  }

  it("takes a collapsed offcanvas rail out of the tab order", () => {
    render(
      <SidebarProvider open={false}>
        <OffcanvasRail />
      </SidebarProvider>,
    );
    expect(container().hasAttribute("inert")).toBe(true);
    expect(container().className).toContain("-translate-x-full");
    expect(container().className).not.toContain("shadow-popover-sm");
  });

  it("slides a peeked rail in over the page and keeps the gap shut", () => {
    render(
      <SidebarProvider open={false}>
        <OffcanvasRail peek />
      </SidebarProvider>,
    );
    expect(
      document
        .querySelector('[data-slot="sidebar"]')
        ?.getAttribute("data-peek"),
    ).toBe("true");
    expect(container().hasAttribute("inert")).toBe(false);
    expect(container().className).not.toContain("translate-x-full");
    expect(container().className).toContain("shadow-popover-sm");
    // The 200 rung: a panel over content, not the layout reflowing.
    expect(container().className).toContain("duration-200");
    // The gap is what pushes the layout. A peek must never widen it.
    expect(
      document.querySelector('[data-slot="sidebar-gap"]')?.className,
    ).toContain("group-data-[collapsible=offcanvas]:w-0");
  });

  it("mirrors the hide for a rail on the right edge", () => {
    render(
      <SidebarProvider open={false}>
        <OffcanvasRail side="right" />
      </SidebarProvider>,
    );
    expect(container().className).toContain("translate-x-full");
    expect(container().className).not.toContain("-translate-x-full");
  });

  it("leaves an expanded rail and the icon rail reachable", () => {
    const { unmount } = render(
      <SidebarProvider open>
        <OffcanvasRail />
      </SidebarProvider>,
    );
    expect(container().hasAttribute("inert")).toBe(false);
    expect(container().className).not.toContain("translate-x-full");
    unmount();

    render(
      <SidebarProvider open={false}>
        <Rail />
      </SidebarProvider>,
    );
    // Icon mode never leaves the screen: its rows are real tab stops.
    expect(container().hasAttribute("inert")).toBe(false);
  });

  /* The row tooltip is the icon rail's: it stands in for a label that is
       gone. A peeked offcanvas rail is "collapsed" with every label on
       screen, so the same gate that opens it there would say the word
       twice. Radix keeps the content mounted and marks it hidden, which is
       what the expanded icon rail already does. */
  it("keeps the row tooltips shut while peeked, the label is right there", async () => {
    render(
      <SidebarProvider open={false}>
        <OffcanvasRail peek />
      </SidebarProvider>,
    );
    fireEvent.focus(screen.getByRole("button", { name: "Orders" }));
    expect(
      (
        await screen.findByText("Orders", {
          selector: '[data-slot="tooltip-content"]',
        })
      ).hasAttribute("hidden"),
    ).toBe(true);
  });
});
