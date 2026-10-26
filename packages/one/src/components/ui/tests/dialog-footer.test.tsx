import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DialogFooter, DialogSubmit } from "../dialog";

const TAILWIND = readFileSync(
  join(__dirname, "..", "..", "..", "foundation", "tailwind.css"),
  "utf8",
);

/* Reveal closes by giving back one gap of the row it sits in; the footer's
   row gap has to be exactly that, or a hidden primary leaves the cancel
   button short of the edge. */
describe("DialogFooter", () => {
  it("has the row gap Reveal gives back, so Cancel sits flush when the primary is hidden", () => {
    const slot =
      /@utility reveal-slot \{[\s\S]*?margin-inline-start:\s*calc\(var\(--spacing\) \* -(\d+)\)/.exec(
        TAILWIND,
      );
    expect(slot?.[1]).toBe("2");
    render(<DialogFooter data-testid="footer" />);
    const cls = screen.getByTestId("footer").className.split(/\s+/);
    expect(cls).toContain("sm:gap-2");
    expect(cls).toContain("sm:flex-row");
    expect(cls).toContain("flex-col-reverse");
  });
});

describe("DialogSubmit", () => {
  it("is the visible primary once the draft can be saved", () => {
    render(
      <DialogFooter>
        <DialogSubmit ready>Save</DialogSubmit>
      </DialogFooter>,
    );
    const save = screen.getByRole("button", { name: "Save" });
    expect(save.getAttribute("type")).toBe("submit");
    expect(save.hasAttribute("inert")).toBe(false);
    expect(save.className).not.toContain("invisible");
  });

  /* Not rendered until it can run: out of the accessibility tree and the tab
       order, yet laid out so the sheet is the same height with or without it. */
  it("is concealed, inert and held in place while it cannot run", () => {
    render(
      <DialogFooter>
        <DialogSubmit ready={false}>Save</DialogSubmit>
      </DialogFooter>,
    );
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    const held = screen.getByText("Save", { selector: "button" });
    expect(held.getAttribute("aria-hidden")).toBe("true");
    expect(held.hasAttribute("inert")).toBe(true);
    expect(held.className).toContain("invisible");
  });

  /* Below sm the footer is a stack, so the slot stays open and the hidden
       primary holds its row; from sm the slot closes and Cancel sits flush. */
  it("holds its row below sm and closes from sm", () => {
    render(
      <DialogFooter>
        <DialogSubmit ready={false}>Save</DialogSubmit>
      </DialogFooter>,
    );
    const slot = document.querySelector('[data-slot="reveal"]');
    expect(slot?.className).toContain("max-sm:reveal-slot-open");
    expect(slot?.hasAttribute("data-open")).toBe(false);
    const held = screen.getByText("Save", { selector: "button" });
    expect(held.className).toContain("max-sm:w-full");
  });

  it("spins while the request is in flight, and stays on screen", () => {
    render(
      <DialogFooter>
        <DialogSubmit ready busy>
          Save
        </DialogSubmit>
      </DialogFooter>,
    );
    const save = screen.getByRole("button", { name: "Save" });
    expect(save.getAttribute("aria-busy")).toBe("true");
  });
});
