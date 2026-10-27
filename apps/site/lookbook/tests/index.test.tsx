import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LookbookPage } from "../index";
import { CATALOG } from "../catalog";
import { SECTIONS } from "../registry";
import { LookbookShell } from "../components/shell";
import { generateStaticParams } from "../../app/lookbook/[[...slug]]/page";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/lookbook",
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.ComponentProps<"a"> & { href: string }): React.JSX.Element => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("public lookbook", () => {
  it("gives body portals the specimen locale and restores the host on exit", () => {
    const root: HTMLElement = document.documentElement;
    const language: string | null = root.getAttribute("lang");
    const direction: string | null = root.getAttribute("dir");
    const { rerender, unmount } = render(
      <LookbookShell locale="ar">Specimen</LookbookShell>,
    );
    expect([root.lang, root.dir]).toEqual(["ar", "rtl"]);
    rerender(<LookbookShell locale="en">Specimen</LookbookShell>);
    expect([root.lang, root.dir]).toEqual(["en", "ltr"]);
    rerender(<LookbookShell locale="ar">Specimen</LookbookShell>);
    unmount();
    expect([root.getAttribute("lang"), root.getAttribute("dir")]).toEqual([
      language,
      direction,
    ]);
  });

  it("renders the requested section and gives Arabic specimens their language and direction", () => {
    render(<LookbookPage slug={["toast"]} lang="ar" />);
    expect(screen.getByRole("heading", { name: "Toast" })).not.toBeNull();
    expect(document.querySelector('[dir="rtl"][lang="ar"]')).not.toBeNull();
  });

  it("shows the public catalog at its index", () => {
    render(<LookbookPage />);
    expect(
      screen.getByRole("heading", { name: "The One lookbook" }),
    ).not.toBeNull();
  });

  it("keeps the lookbook available in production without a feature flag", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    try {
      const { LookbookPage: ProductionLookbook } = await import("../index");
      render(<ProductionLookbook slug={["toast"]} />);
      expect(screen.getByRole("heading", { name: "Toast" })).not.toBeNull();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("filters navigation and keeps Arabic in section links", () => {
    render(<LookbookPage slug={["toast"]} lang="ar" />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "buttons" },
    });
    expect(
      screen.getByRole("link", { name: "Buttons" }).getAttribute("href"),
    ).toBe("/lookbook/buttons");
    expect(screen.queryByRole("link", { name: "Card" })).toBeNull();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "no-such-component" },
    });
    expect(screen.getByText(/No matches/)).not.toBeNull();
  });

  it("uses the shared sidebar disclosure", () => {
    render(<LookbookPage slug={["toast"]} />);
    const trigger: HTMLElement = screen.getByRole("button", {
      name: "Toggle lookbook navigation",
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps the section while switching direction", () => {
    render(<LookbookPage slug={["toast"]} />);
    fireEvent.click(screen.getByRole("radio", { name: "English / LTR" }));
    expect(push).toHaveBeenCalledWith("/lookbook/en/toast");
  });

  it("routes every inherited section and every navigation destination", () => {
    const directories: string[] = readdirSync(
      join(__dirname, "..", "sections"),
      { withFileTypes: true },
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    const links: string[] = CATALOG.flatMap((group) =>
      group.items.map((item) => item.href.slice("/lookbook/".length)),
    );
    expect(Object.keys(SECTIONS).sort()).toEqual(directories.sort());
    expect(links.sort()).toEqual(directories.sort());
    expect(
      generateStaticParams()
        .map(({ slug }) => slug.join("/"))
        .sort(),
    ).toEqual(
      [
        "",
        "ar",
        "en",
        ...directories.flatMap((section: string) => [
          section,
          `ar/${section}`,
          `en/${section}`,
        ]),
      ].sort(),
    );
  });
});
