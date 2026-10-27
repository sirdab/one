import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Direction } from "radix-ui";
import type { JSX, ReactNode } from "react";

import { OneProvider } from "../provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";

const seen: Array<Record<string, unknown>> = [];
vi.mock("next-themes", () => ({
  ThemeProvider: (props: Record<string, unknown>): ReactNode => {
    seen.push(props);
    return props.children as ReactNode;
  },
}));

function DirectionProbe(): JSX.Element {
  const direction: "ltr" | "rtl" = Direction.useDirection();
  return <output data-testid="direction">{direction}</output>;
}

describe("OneProvider", () => {
  afterEach((): void => {
    seen.length = 0;
  });

  it("defaults to light and provides direction without taking over document language", (): void => {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    render(
      <OneProvider>
        <DirectionProbe />
      </OneProvider>,
    );
    expect(screen.getByTestId("direction").textContent).toBe("ltr");
    expect(seen[0]).toMatchObject({
      defaultTheme: "light",
      enableSystem: true,
    });
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    document.documentElement.removeAttribute("lang");
    document.documentElement.removeAttribute("dir");
  });

  it.each(["light", "dark", "system"] as const)(
    "forwards %s and CSP nonce while sharing RTL context",
    (defaultTheme): void => {
      render(
        <OneProvider dir="rtl" defaultTheme={defaultTheme} nonce="host-nonce">
          <DirectionProbe />
        </OneProvider>,
      );
      expect(screen.getByTestId("direction").textContent).toBe("rtl");
      expect(seen[0]).toMatchObject({
        defaultTheme,
        nonce: "host-nonce",
        attribute: "class",
      });
    },
  );

  it("mounts shared tooltip context", (): void => {
    render(
      <OneProvider>
        <Tooltip open>
          <TooltipTrigger>Details</TooltipTrigger>
          <TooltipContent>A hint</TooltipContent>
        </Tooltip>
      </OneProvider>,
    );
    expect(screen.getByRole("tooltip").textContent).toBe("A hint");
  });
});
