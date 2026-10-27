// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "../../../theme-provider";

const seen: Array<Record<string, unknown>> = [];
vi.mock("next-themes", () => ({
  ThemeProvider: (props: Record<string, unknown>) => {
    seen.push(props);
    return props.children as React.ReactNode;
  },
}));

describe("ThemeProvider", () => {
  afterEach(() => {
    cleanup();
    seen.length = 0;
  });

  it("defaults to light with system available (SAI-762)", () => {
    render(<ThemeProvider>x</ThemeProvider>);
    expect(seen[0]).toMatchObject({
      attribute: "class",
      defaultTheme: "light",
      enableSystem: true,
    });
  });

  it("lets a host hand the first choice to the OS", () => {
    render(<ThemeProvider defaultTheme="system">x</ThemeProvider>);
    expect(seen[0]).toMatchObject({ defaultTheme: "system" });
  });
});
