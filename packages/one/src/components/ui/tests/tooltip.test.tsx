import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

function Hint({
  expanded = false,
  defaultOpen = false,
}: {
  expanded?: boolean;
  defaultOpen?: boolean;
}): React.JSX.Element {
  return (
    <Tooltip defaultOpen={defaultOpen}>
      <TooltipTrigger aria-expanded={expanded}>More</TooltipTrigger>
      <TooltipContent>More actions</TooltipContent>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("closes when the window loses focus", () => {
    render(<Hint defaultOpen />);
    expect(screen.getAllByText("More actions").length).toBeGreaterThan(0);
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(screen.queryByText("More actions")).toBeNull();
  });

  it("stays shut while its trigger has something open", () => {
    render(<Hint expanded />);
    fireEvent.focus(screen.getByRole("button", { name: "More" }));
    fireEvent.pointerMove(screen.getByRole("button", { name: "More" }));
    expect(screen.queryByText("More actions")).toBeNull();
  });

  it("closes on a press even when the trigger prevents it", () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <button
            type="button"
            onPointerDown={(event) => event.preventDefault()}
          >
            More
          </button>
        </TooltipTrigger>
        <TooltipContent>More actions</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getAllByText("More actions").length).toBeGreaterThan(0);
    fireEvent.pointerDown(screen.getByRole("button", { name: "More" }));
    expect(screen.queryByText("More actions")).toBeNull();
  });

  it("stays shut when focus is handed back, and opens when Tab brings it", () => {
    render(<Hint />);
    const trigger = screen.getByRole("button", { name: "More" });
    act(() => trigger.focus());
    expect(screen.queryByText("More actions")).toBeNull();

    act(() => trigger.blur());
    fireEvent.keyDown(window, { key: "Tab" });
    act(() => trigger.focus());
    expect(screen.getAllByText("More actions").length).toBeGreaterThan(0);
  });

  it("stays shut when the window hands focus back to a button inside a wrapped trigger", () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <button type="button">Notifications</button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Your notifications</TooltipContent>
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "Notifications" });

    fireEvent.keyDown(window, { key: "Tab" });
    act(() => {
      window.dispatchEvent(new Event("focus"));
      button.focus();
    });
    expect(screen.queryByText("Your notifications")).toBeNull();
  });
});

describe("TooltipContent", () => {
  function chip(): HTMLElement {
    const el = document.querySelector('[data-slot="tooltip-content"]');
    if (!(el instanceof HTMLElement)) throw new Error("no tooltip");
    return el;
  }

  it("is the ink chip: body type, capped at 256px, pretty-wrapped", () => {
    render(<Hint defaultOpen />);
    const cls = chip().className;
    expect(cls).toContain("bg-primary");
    expect(cls).toContain("text-primary-foreground");
    expect(cls).toContain("text-body");
    expect(cls).not.toContain("text-caption");
    expect(cls).toContain("max-w-64");
    expect(cls).toContain("text-pretty");
    expect(cls).not.toContain("text-balance");
    expect(cls).toContain("rounded-md");
    expect(cls).toContain("shadow-popover-sm");
  });

  it("takes no size prop", () => {
    render(<Hint defaultOpen />);
    expect(chip().hasAttribute("size")).toBe(false);
  });

  it("sits 8px off its trigger", async () => {
    render(<Hint defaultOpen />);
    const wrapper = document.querySelector(
      "[data-radix-popper-content-wrapper]",
    );
    await waitFor(() => {
      const transform = (wrapper as HTMLElement).style.transform;
      const match = /translate(?:3d)?\(\s*-?\d+px,\s*(-?\d+)px/.exec(transform);
      expect(match).not.toBeNull();
      expect(Math.abs(Number(match?.[1]))).toBe(8);
    });
  });

  it("ignores a keydown that carries no key", () => {
    render(<Hint />);
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent): void => {
      event.preventDefault();
      errors.push(event.error);
    };
    window.addEventListener("error", onError);
    try {
      window.dispatchEvent(new Event("keydown"));
    } finally {
      window.removeEventListener("error", onError);
    }
    expect(errors).toEqual([]);
  });
});
