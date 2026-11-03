import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormSheet } from "../form-sheet";

function slot(name: string): HTMLElement {
  const node = document.querySelector<HTMLElement>(`[data-slot="${name}"]`);
  if (!node) throw new Error(`no ${name} rendered`);
  return node;
}

describe("FormSheet", () => {
  it("keeps the header and footer outside the one band that scrolls", () => {
    render(
      <FormSheet
        defaultOpen
        title="New carrier"
        description="The carrier's basics."
        onSubmit={() => undefined}
        cancelLabel="Cancel"
        submitLabel="Save"
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    const content = slot("form-sheet");
    const header = slot("form-sheet-header");
    const body = slot("form-sheet-body");
    const footer = slot("form-sheet-footer");

    expect(Array.from(content.children)).toEqual(
      expect.arrayContaining([header, body, footer]),
    );
    expect(body.className).toContain("overflow-y-auto");
    expect(body.className).toContain("min-h-0");
    expect(header.className).not.toContain("overflow-y-auto");
    expect(footer.className).not.toContain("overflow-y-auto");
    expect(header.contains(screen.getByText("New carrier"))).toBe(true);
    expect(header.contains(screen.getByText("The carrier's basics."))).toBe(
      true,
    );
    expect(body.contains(screen.getByLabelText("Name"))).toBe(true);
  });

  it("puts Cancel before the primary action in reading order", () => {
    render(
      <FormSheet
        defaultOpen
        title="Edit"
        onSubmit={() => undefined}
        cancelLabel="Cancel"
        submitLabel="Save"
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    const buttons = Array.from(
      slot("form-sheet-footer").querySelectorAll("button"),
    ).map((button) => button.textContent);
    expect(buttons).toEqual(["Cancel", "Save"]);
  });

  it("takes the full width below 640px", () => {
    render(
      <FormSheet
        defaultOpen
        title="Edit"
        onSubmit={() => undefined}
        cancelLabel="Cancel"
        submitLabel="Save"
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    const cls = slot("form-sheet").className;
    expect(cls).toContain("max-sm:start-2");
    expect(cls).toContain("max-sm:w-auto");
    expect(cls).toContain("sm:max-w-sm");
  });

  it("submits the form it renders from the footer button", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <FormSheet
        defaultOpen
        title="Edit"
        onSubmit={onSubmit}
        cancelLabel="Cancel"
        submitLabel="Save"
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    const save = screen.getByRole("button", { name: "Save" });
    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    expect(form?.contains(save)).toBe(false);
    expect(save.getAttribute("form")).toBe(form?.id);

    fireEvent.click(save);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("points the primary at a form the caller renders, by id", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <FormSheet
        defaultOpen
        title="Zone"
        formId="zone-form"
        cancelLabel="Cancel"
        submitLabel="Save"
      >
        <form id="zone-form" onSubmit={onSubmit}>
          <input aria-label="Name" />
        </form>
        <section aria-label="Members" />
      </FormSheet>,
    );
    expect(document.querySelectorAll("form")).toHaveLength(1);
    const save = screen.getByRole("button", { name: "Save" });
    expect(save.getAttribute("form")).toBe("zone-form");

    fireEvent.click(save);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("holds the primary while pending and keeps Cancel live", () => {
    render(
      <FormSheet
        defaultOpen
        title="Edit"
        onSubmit={() => undefined}
        cancelLabel="Cancel"
        submitLabel="Save"
        pending
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    const save = screen.getByRole("button", { name: "Save" });
    expect(save.getAttribute("aria-busy")).toBe("true");
    expect(save.getAttribute("data-loading")).toBe("true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("does not submit again on a click while pending", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <FormSheet
        defaultOpen
        title="Edit"
        onSubmit={onSubmit}
        cancelLabel="Cancel"
        submitLabel="Save"
        pending
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the primary while the form cannot be sent", () => {
    render(
      <FormSheet
        defaultOpen
        title="Edit"
        onSubmit={() => undefined}
        cancelLabel="Cancel"
        submitLabel="Save"
        submitDisabled
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("closes through Cancel", () => {
    const onOpenChange = vi.fn();
    render(
      <FormSheet
        open
        onOpenChange={onOpenChange}
        title="Edit"
        onSubmit={() => undefined}
        cancelLabel="Cancel"
        submitLabel="Save"
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("opens from its own trigger", () => {
    render(
      <FormSheet
        trigger={<button type="button">New carrier</button>}
        title="New carrier"
        onSubmit={() => undefined}
        cancelLabel="Cancel"
        submitLabel="Save"
      >
        <input aria-label="Name" />
      </FormSheet>,
    );
    expect(document.querySelector('[data-slot="form-sheet"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "New carrier" }));
    expect(document.querySelector('[data-slot="form-sheet"]')).not.toBeNull();
  });
});
