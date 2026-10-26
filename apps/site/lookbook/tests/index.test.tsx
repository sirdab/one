import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LookbookPage } from "../index";

const LOOKBOOK = join(__dirname, "..");

vi.mock("next/navigation", () => ({
  usePathname: () => "/lookbook/toast",
  useSearchParams: () => new URLSearchParams("lang=ar"),
  useParams: () => ({}),
}));

vi.mock("next/link", () => ({
  // The rail's links only need an anchor in jsdom.
  default: ({
    href,
    children,
    ...props
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("LookbookPage", () => {
  it("renders the requested section, not the index, and maps lang to dir", () => {
    render(<LookbookPage slug={["toast"]} lang="ar" />);
    // the toast section's own header, not the gallery index header
    expect(screen.getByRole("heading", { name: "Toast" })).not.toBeNull();
    expect(screen.queryByText("Sirdab design system")).toBeNull();
    expect(document.querySelector('[dir="rtl"]')).not.toBeNull();
  });

  it("falls back to the index on an unknown slug", () => {
    render(<LookbookPage slug={["nope"]} />);
    expect(screen.getByText("Sirdab design system")).not.toBeNull();
  });

  it("renders the inline 404 in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { LookbookPage: GatedPage } = await import("../index");
    render(<GatedPage slug={["toast"]} />);
    expect(
      screen.getByText("404: Lookbook is not available here."),
    ).not.toBeNull();
    vi.unstubAllEnvs();
  });

  it("keeps the rail's hrefs inside the slug registry", () => {
    const navSrc = readFileSync(
      join(LOOKBOOK, "components", "nav.tsx"),
      "utf8",
    );
    const indexSrc = readFileSync(join(LOOKBOOK, "index.tsx"), "utf8");
    const hrefs = [...navSrc.matchAll(/href: "\/lookbook\/([\w-]+)"/g)].map(
      (m) => m[1],
    );
    const keys = [...indexSrc.matchAll(/^\s+"?([\w-]+)"?:\s*\w+Page,$/gm)].map(
      (m) => m[1],
    );
    for (const href of hrefs) {
      expect(keys, `nav href /lookbook/${href} has no section`).toContain(href);
    }
    const dirs = readdirSync(join(LOOKBOOK, "sections"), {
      withFileTypes: true,
    })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    for (const dir of dirs) {
      expect(keys, `section ${dir} is not in the registry`).toContain(dir);
    }
  });
});
