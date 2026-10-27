import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatValue } from "@sirdab/one/foundation";

import { FilterTrigger } from "../filter-trigger";

const items = [
  { value: "apparel", label: "ملابس" },
  { value: "beauty", label: "عناية" },
  { value: "perfumes", label: "عطور" },
];

function count(): HTMLElement {
  const node = document.querySelector(
    '[data-slot="filter-trigger-values"] [dir="ltr"]',
  );
  if (!(node instanceof HTMLElement)) throw new Error("no count");
  return node;
}

describe("FilterTrigger's +N count", () => {
  it("sits apart from the first pick, in the quiet tier, left to right", () => {
    render(
      <FilterTrigger
        label="التصنيف"
        items={items}
        empty="لا نتائج"
        numeralLocale="ar-SA"
        defaultValues={["apparel", "beauty", "perfumes"]}
      />,
    );
    const classes = count().className.split(" ");
    expect(classes).toContain("ms-2");
    expect(classes).not.toContain("ms-1");
    expect(classes).toContain("text-muted-foreground");
    expect(classes).toContain("tabular");
    expect(classes).toContain("shrink-0");
  });

  it("takes its sign from the number formatter, Western digits in Arabic", () => {
    render(
      <FilterTrigger
        label="التصنيف"
        items={items}
        empty="لا نتائج"
        numeralLocale="ar-SA"
        defaultValues={["apparel", "beauty", "perfumes"]}
      />,
    );
    expect(count().textContent).toBe(
      formatValue(2, "ar-SA", { signDisplay: "always" }),
    );
    expect(count().textContent).toContain("+2");
  });
});
