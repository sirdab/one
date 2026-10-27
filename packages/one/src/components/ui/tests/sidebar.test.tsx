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
  function sourceOf(fn: string): string {
    const src = readFileSync(join(__dirname, "..", "sidebar.tsx"), "utf8");
    const start = src.indexOf(`function ${fn}(`);
    expect(start, `${fn} not found`).toBeGreaterThan(-1);
    const next = src.indexOf("\nfunction ", start + 1);
    return src.slice(start, next === -1 ? undefined : next);
  }

  it("keeps the zero-delay provider off the whole subtree", () => {
    expect(sourceOf("SidebarProvider")).not.toContain("<TooltipProvider");
  });

  it("scopes the zero-delay provider to the nav cluster", () => {
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

describe("the mobile drawer opens from the rail's own edge", () => {
  function mountPhone(
    dir: "ltr" | "rtl",
    side: "left" | "right",
    scheme?: "dark",
  ): void {
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
    mountPhone("rtl", "right");
    expect(drawerEdge()).toBe("right");
  });

  it("carries a dark rail's scheme into the drawer, which portals out of it", () => {
    mountPhone("ltr", "left", "dark");
    const drawer = document.querySelector('[data-mobile="true"]');
    expect(drawer?.classList.contains("dark")).toBe(true);
  });

  it("still opens from the far edge for a rail that really is on one", () => {
    mountPhone("ltr", "right");
    expect(drawerEdge()).toBe("right");
  });
});

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

describe("Sidebar peek and inert", () => {
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

    expect(container().className).toContain("duration-200");

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

    expect(container().hasAttribute("inert")).toBe(false);
  });

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
