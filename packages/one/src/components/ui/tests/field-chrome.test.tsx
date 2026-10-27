import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Combobox } from "../combobox";
import {
  FIELD_BORDER,
  FIELD_FOCUS_VISIBLE,
  FIELD_FOCUS_WITHIN,
  FIELD_HEIGHT,
  FIELD_RADIUS,
  FIELD_VALUE,
  type FieldSize,
} from "../field-chrome";
import { Input } from "../input";
import { Select, SelectTrigger, SelectValue } from "../select";
import { Textarea } from "../textarea";

describe("the shared field chrome", () => {
  it("is 12px at 40 and 44, 10px below", () => {
    const sizes: FieldSize[] = ["sm", "md", "default", "search", "touch"];
    const expected: Record<FieldSize, string> = {
      sm: "rounded-lg",
      md: "rounded-lg",
      default: "rounded-xl",
      search: "rounded-xl",
      touch: "rounded-xl",
    };
    for (const size of sizes) {
      expect(FIELD_RADIUS[size]).toBe(expected[size]);
    }
    expect(FIELD_HEIGHT.default).toBe("h-control-xl");
    expect(FIELD_HEIGHT.touch).toBe("h-control-touch");
  });

  it("sets the value at 16px on a phone and the quiet body role from sm up", () => {
    expect(FIELD_VALUE).toBe("text-body-lg sm:text-body-quiet");
  });

  it("leaves the Input's recipe as it was at every size", () => {
    const hover =
      "hover:not-focus-within:not-has-[:is(input,textarea,select):read-only]:border-input-border-hover";
    const sizes: FieldSize[] = ["sm", "md", "default", "search", "touch"];
    const px: Record<FieldSize, string> = {
      sm: "px-2.5",
      md: "px-3",
      default: "px-3",
      search: "px-3",
      touch: "px-3",
    };
    for (const size of sizes) {
      const { unmount } = render(
        <Input size={size} placeholder={`field-${size}`} />,
      );
      const wrapper = screen
        .getByPlaceholderText(`field-${size}`)
        .closest('[data-slot="input-wrapper"]');
      const cls = wrapper?.className ?? "";
      expect(cls).toContain(
        `${FIELD_HEIGHT[size]} ${FIELD_RADIUS[size]} ${px[size]} ${hover}`,
      );
      expect(cls).toContain(FIELD_BORDER);
      expect(cls).toContain(FIELD_FOCUS_WITHIN);
      unmount();
    }
  });

  it("gives the Textarea the Input's corner, border and focus", () => {
    render(<Textarea placeholder="notes" />);
    const cls = screen.getByPlaceholderText("notes").className;
    expect(cls).toContain(FIELD_RADIUS.default);
    expect(cls).toContain("rounded-xl");
    expect(cls).not.toContain("rounded-lg");
    expect(cls).toContain(FIELD_BORDER);
    expect(cls).toContain(FIELD_FOCUS_VISIBLE);
    expect(cls).toContain(FIELD_VALUE);
  });

  it("gives the Select the same corner, border, focus and value type", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="category" />
        </SelectTrigger>
      </Select>,
    );
    const cls =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    expect(cls).toContain(FIELD_RADIUS.default);
    expect(cls).toContain(FIELD_HEIGHT.default);
    expect(cls).toContain(FIELD_BORDER);
    expect(cls).toContain(FIELD_FOCUS_VISIBLE);
    expect(cls).toContain(FIELD_VALUE);
  });

  it("gives the Combobox trigger the Select's field exactly", () => {
    render(
      <Combobox
        aria-label="Sections"
        options={[{ value: "a", label: "Alpha" }]}
        value={[]}
        onValueChange={() => undefined}
        placeholder="No section"
        searchPlaceholder="Search"
        emptyLabel="Nothing"
      />,
    );
    const combobox =
      document.querySelector('[data-slot="combobox-trigger"]')?.className ?? "";
    cleanup();
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="category" />
        </SelectTrigger>
      </Select>,
    );
    const select =
      document.querySelector('[data-slot="select-trigger"]')?.className ?? "";
    for (const part of [
      FIELD_RADIUS.default,
      FIELD_HEIGHT.default,
      FIELD_BORDER,
      FIELD_FOCUS_VISIBLE,
      FIELD_VALUE,
    ]) {
      expect(combobox).toContain(part);
      expect(select).toContain(part);
    }
    expect(combobox).not.toContain("btn-surface");
    expect(combobox).not.toContain("border-btn-border");
  });
});
