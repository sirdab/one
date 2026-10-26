import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CardPage from "../sections/card/page";
import FormsPage from "../sections/forms/page";

/* The sections are async server components, so the page function is awaited
   and its element rendered. This is a smoke test for what the critic opens at
   390 and 1440: every part of the anatomy mounts, in either direction, with
   no part missing its sample string. */
describe("Card section", () => {
  it.each(["en", "ar"])("renders the whole anatomy in %s", async (lang) => {
    render(await CardPage({ lang }));
    expect(screen.getByRole("heading", { name: "Card" })).not.toBeNull();
    for (const slot of [
      "card-header",
      "card-action",
      "card-content",
      "card-footer",
      "item-group",
      "item",
      "separator",
    ]) {
      expect(
        document.querySelector(`[data-slot="${slot}"]`),
        `${slot} is missing`,
      ).not.toBeNull();
    }
    const variants = [
      ...document.querySelectorAll<HTMLElement>('[data-slot="card"]'),
    ].map((card) => card.dataset.variant);
    expect(variants).toContain("outline");
    expect(variants).toContain("default");
  });
});

describe("Forms section", () => {
  it.each(["en", "ar"])("renders every recipe in %s", async (lang) => {
    render(await FormsPage({ lang }));
    expect(screen.getByRole("heading", { name: "Forms" })).not.toBeNull();
    for (const slot of [
      "field",
      "field-label",
      "field-description",
      "field-error",
      "field-row",
      "field-set",
      "field-legend",
    ]) {
      expect(
        document.querySelector(`[data-slot="${slot}"]`),
        `${slot} is missing`,
      ).not.toBeNull();
    }
  });

  /* The Save demo is the proof of the page recipe: absent until the field
       would save, back to absent once it is saved. */
  it("brings Save into the bar only once the field would save", async () => {
    render(await FormsPage({ lang: "en" }));
    const email = document.getElementById("lb-demo-email");
    expect(email).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();

    const field = email as HTMLInputElement;
    fireEvent.change(field, { target: { value: "not-an-email" } });
    fireEvent.blur(field);
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    const note = document.getElementById("lb-demo-email-note");
    expect(note?.getAttribute("role")).toBe("alert");
    expect(note?.textContent).toBe("That email doesn't look right.");

    fireEvent.change(field, { target: { value: "sara@example.com" } });
    const save = screen.getByRole("button", { name: "Save" });
    fireEvent.click(save);
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });
});
