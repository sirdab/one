import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "../code-block";
import { SiteProvider } from "../site-provider";
import { toast } from "sonner";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => toast.dismiss());

describe("copyable examples", () => {
  it("copies the exact snippet and announces completion", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <SiteProvider>
        <CodeBlock label="Install" code="npm install ./sirdab-one.tgz" />
      </SiteProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy Install" }));
    await waitFor(() =>
      expect(
        screen
          .getByText("Code copied")
          .closest("[data-sonner-toast]")
          ?.getAttribute("data-type"),
      ).toBe("success"),
    );
    expect(writeText).toHaveBeenCalledWith("npm install ./sirdab-one.tgz");
  });
  it("keeps the snippet selectable when clipboard access fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) },
    });
    render(
      <SiteProvider>
        <CodeBlock label="Install" code="npm install ./sirdab-one.tgz" />
      </SiteProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy Install" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "copy it manually",
      ),
    );
    expect(screen.getByText("npm install ./sirdab-one.tgz")).not.toBeNull();
    expect(screen.queryByText("Code copied")).toBeNull();
  });
});
