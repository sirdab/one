import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ButtonBase } from "../button-base";
import { Input } from "../input";
import { InputBase } from "../input-base";

describe("ButtonBase", () => {
  it("draws the same variant classes as Button and fires clicks", () => {
    const onClick = vi.fn();
    render(
      <ButtonBase variant="secondary" size="lg" onClick={onClick}>
        Send
      </ButtonBase>,
    );
    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("data-variant", "secondary");
    expect(button).toHaveAttribute("data-size", "lg");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("swallows clicks while loading and marks itself busy", () => {
    const onClick = vi.fn();
    render(
      <ButtonBase loading onClick={onClick}>
        Send
      </ButtonBase>,
    );
    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("aria-busy", "true");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is natively disabled", () => {
    render(<ButtonBase disabled>Send</ButtonBase>);
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });
});

describe("InputBase", () => {
  it("draws the same field chrome as Input at every size", () => {
    for (const size of ["sm", "md", "default", "touch"] as const) {
      const { unmount } = render(
        <>
          <Input aria-label="full" size={size} />
          <InputBase aria-label="base" size={size} />
        </>,
      );
      const full = screen
        .getByRole("textbox", { name: "full" })
        .closest('[data-slot="input-wrapper"]');
      const base = screen
        .getByRole("textbox", { name: "base" })
        .closest('[data-slot="input-wrapper"]');
      expect(base?.className).toBe(full?.className);
      unmount();
    }
  });

  it("passes input props through and stays editable", () => {
    const onChange = vi.fn();
    render(
      <InputBase
        aria-label="Email"
        type="email"
        autoComplete="email"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    fireEvent.change(input, { target: { value: "a@b.co" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("LegacyCard", () => {
  it("keeps the pre-One padded, bordered box and lets callers override padding", async () => {
    const { LegacyCard, LegacyCardContent, LegacyCardHeader } =
      await import("../card");
    render(
      <>
        <LegacyCard data-testid="plain">
          <LegacyCardHeader>Head</LegacyCardHeader>
          <LegacyCardContent>Body</LegacyCardContent>
        </LegacyCard>
        <LegacyCard data-testid="flush" className="p-0" />
      </>,
    );
    const plain = screen.getByTestId("plain");
    expect(plain.className).toContain("p-4");
    expect(plain.className).toContain("border");
    expect(plain.className).toContain("rounded-lg");
    expect(screen.getByTestId("flush").className).not.toContain("p-4");
    expect(screen.getByText("Body").className).toContain("mt-3");
  });
});
