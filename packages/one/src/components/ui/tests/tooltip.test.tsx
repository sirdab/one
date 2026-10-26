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
  /* Switching desktops never fires a pointer leave: the hint waited on
       the trigger for the merchant's return. */
  it("closes when the window loses focus", () => {
    render(<Hint defaultOpen />);
    expect(screen.getAllByText("More actions").length).toBeGreaterThan(0);
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(screen.queryByText("More actions")).toBeNull();
  });

  /* A "more" button that opened its menu does not also show its hint
       over that menu. */
  it("stays shut while its trigger has something open", () => {
    render(<Hint expanded />);
    fireEvent.focus(screen.getByRole("button", { name: "More" }));
    fireEvent.pointerMove(screen.getByRole("button", { name: "More" }));
    expect(screen.queryByText("More actions")).toBeNull();
  });

  /* A menu trigger prevents its pointer-down, and Radix then skips its own
       close: the hint the hover opened stayed over the menu. */
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

  /* Closing the assistant rail hands focus back to its button. After any
       tabbing that focus matches :focus-visible, and the hint came up with
       no one pointing at it. */
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

  /* The owner's repro (2026-10-03): open the notifications panel, close
       it (focus returns to the bell), move the pointer away, switch tabs,
       come back: the bell's hint was up. Button wraps itself in a span to
       carry a hint, so the trigger is the span while the focused element is
       the button inside, and the hand-back guard compared the two with ===
       and let the window's returning focus open it. */
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
    /* The window comes back and re-focuses the button; a navigation
           key just before (the chord that switched tabs) must not count. */
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

  /* The ink chip: the one ink surface that is not an action, text only.
       One size (the body role), a max width so a long hint wraps instead of
       running across the screen, and pretty (not balanced) wrapping so a
       two-line Arabic hint does not leave a hole at the end of its box. */
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

  /* No size knob: the unused caption variant and its map are gone. */
  it("takes no size prop", () => {
    render(<Hint defaultOpen />);
    expect(chip().hasAttribute("size")).toBe(false);
  });

  /* At 4px the chip merged with the ink focus ring and the ink primary
       beside it; 8px clears both. */
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
  /* Chrome's autofill fires keydown with no key at all (UQAIL-21, the
       OTP field on /app/studio): the page-wide listener threw on it. */
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
