import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectedDemo } from "../connected-demo";

describe("connected component example", () => {
  it("shares edits in both directions and invalidates the created state on a new edit", () => {
    render(<ConnectedDemo />);
    expect(
      screen
        .getByRole("group", { name: "الواجهة المتكاملة" })
        .closest('[lang="ar"][dir="rtl"]'),
    ).not.toBeNull();
    const parts = within(screen.getByRole("group", { name: "عناصر الواجهة" }));
    const whole = within(
      screen.getByRole("group", { name: "الواجهة المتكاملة" }),
    );
    fireEvent.change(parts.getByRole("textbox"), {
      target: { value: "Together" },
    });
    expect(whole.getByRole<HTMLInputElement>("textbox").value).toBe("Together");
    fireEvent.click(whole.getByRole("switch"));
    expect(parts.getByRole("switch").getAttribute("aria-checked")).toBe(
      "false",
    );
    fireEvent.click(parts.getByRole("button", { name: "إنشاء المساحة" }));
    expect(whole.getByRole("button", { name: "مساحتك جاهزة" })).not.toBeNull();
    fireEvent.change(whole.getByRole("textbox"), {
      target: { value: "One team" },
    });
    expect(parts.getByRole<HTMLInputElement>("textbox").value).toBe("One team");
    expect(whole.getByText("مسودة")).not.toBeNull();
  });
  it("keeps the Arabic demo editable and prevents empty workspaces", () => {
    render(<ConnectedDemo />);
    const fields: HTMLInputElement[] =
      screen.getAllByRole<HTMLInputElement>("textbox");
    expect(
      fields.map((input: HTMLInputElement): string => input.value),
    ).toEqual(["مساحتي", "مساحتي"]);
    fireEvent.change(fields[0], { target: { value: "   " } });
    const buttons: HTMLButtonElement[] = screen.getAllByRole<HTMLButtonElement>(
      "button",
      { name: "إنشاء المساحة" },
    );
    expect(
      buttons.every((button: HTMLButtonElement): boolean => button.disabled),
    ).toBe(true);
    fireEvent.change(fields[1], { target: { value: "مساحة الفريق" } });
    expect(fields[0].value).toBe("مساحة الفريق");
    expect(
      buttons.every((button: HTMLButtonElement): boolean => !button.disabled),
    ).toBe(true);
    fireEvent.click(buttons[1]);
    expect(screen.getByRole("status").textContent).toContain(
      "مساحتك التجريبية جاهزة",
    );
  });
});
