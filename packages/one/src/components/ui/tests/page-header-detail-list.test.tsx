import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DetailItem,
  DetailList,
  FactStrip,
  FactStripItem,
} from "../detail-list";
import { PageHeader } from "../page-header";

describe("PageHeader", () => {
  it("puts the title in the page's one H1, with its status, line and actions", () => {
    render(
      <PageHeader
        title="LD-000123"
        status={<span>In transit</span>}
        description="Riyadh to Jeddah"
        lineage={<nav aria-label="Lineage" />}
        actions={<button type="button">Edit</button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "LD-000123",
    );
    expect(screen.getByText("In transit")).toBeTruthy();
    expect(screen.getByText("Riyadh to Jeddah")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Lineage" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
  });

  it("lets the title column take the room, so a long line wraps beside the actions", () => {
    const { container } = render(
      <PageHeader
        title="Equipment"
        description="A long line that says what the catalog drives."
        actions={<button type="button">Add</button>}
      />,
    );
    const column = container.querySelector('[data-slot="page-header-title"]')
      ?.parentElement?.parentElement;
    expect(column?.className).toContain("flex-1");
    expect(column?.className).toContain("basis-80");
  });

  it("works for a list page: a title alone, nothing empty left behind", () => {
    const { container } = render(<PageHeader title="Orders" />);
    expect(screen.getByRole("heading", { name: "Orders" })).toBeTruthy();
    expect(
      container.querySelector('[data-slot="page-header-description"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slot="page-header-actions"]'),
    ).toBeNull();
  });
});

describe("DetailList and FactStrip", () => {
  it("pairs each value with its label", () => {
    render(
      <>
        <DetailList aria-label="Details">
          <DetailItem label="Customer">Nakheel Foods</DetailItem>
        </DetailList>
        <FactStrip aria-label="Facts">
          <FactStripItem label="Lane" wide>
            Riyadh to Jeddah
          </FactStripItem>
        </FactStrip>
      </>,
    );
    expect(screen.getByText("Customer").tagName).toBe("DT");
    expect(screen.getByText("Nakheel Foods").tagName).toBe("DD");
    expect(
      screen.getByText("Riyadh to Jeddah").closest("div")?.className,
    ).toContain("col-span-2");
  });
});
