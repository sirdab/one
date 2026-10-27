import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroPreview } from "../hero-preview";

describe("workspace preview", () => {
  it("accepts changes, reports a local save, and clears that state on the next edit", () => {
    render(<HeroPreview />);
    fireEvent.change(screen.getByRole("textbox", { name: "Workspace name" }), {
      target: { value: "My studio" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByRole("status").textContent).toBe(
      "Saved in this preview.",
    );
    fireEvent.click(screen.getByRole("switch", { name: "Team notifications" }));
    expect(screen.getByRole("status").textContent).toBe(
      "Try it. This space is yours to play with.",
    );
  });
  it("switches the specimen language and direction while preserving the edited value", () => {
    render(<HeroPreview />);
    fireEvent.change(screen.getByRole("textbox", { name: "Workspace name" }), {
      target: { value: "My studio" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "العربية" }));
    expect(document.querySelector('[lang="ar"][dir="rtl"]')).not.toBeNull();
    expect(
      (screen.getByRole("textbox", { name: "اسم المساحة" }) as HTMLInputElement)
        .value,
    ).toBe("My studio");
    expect(
      screen.getByRole("button", { name: "حفظ التغييرات" }),
    ).not.toBeNull();
  });
});
