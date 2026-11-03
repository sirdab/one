import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Palette,
  PaletteEmpty,
  PaletteGroup,
  PaletteInput,
  PaletteItem,
  PaletteList,
} from "../palette";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

describe("PaletteItem forceMount and optional subtitle", () => {
  it("keeps a forceMount row whatever is typed, and counts it for its group and the empty state", () => {
    render(
      <Palette openLabel="Open">
        <PaletteInput aria-label="Search" />
        <PaletteList aria-label="Results">
          <PaletteEmpty>No results</PaletteEmpty>
          <PaletteGroup groupId="actions" heading="Actions">
            <PaletteItem
              value="action-a"
              title="Alpha action"
              subtitle="Local"
              leading={<span />}
            />
          </PaletteGroup>
          <PaletteGroup groupId="server" heading="Server hits">
            <PaletteItem
              value="hit-a"
              title="+966501234567"
              subtitle="Matched by the server, not by this text"
              leading={<span />}
              forceMount
            />
          </PaletteGroup>
        </PaletteList>
      </Palette>,
    );
    const input = screen.getByRole("combobox", { name: "Search" });
    fireEvent.change(input, { target: { value: "0501234567" } });

    expect(screen.queryByText("Alpha action")).toBeNull();
    expect(screen.queryByText("+966501234567")).not.toBeNull();
    expect(screen.queryByText("Server hits")).not.toBeNull();
    expect(screen.queryByText("No results")).toBeNull();
    expect(
      screen.getByRole("option", { name: /966501234567/ }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("renders no empty subtitle line when a row has only a title", () => {
    render(
      <Palette openLabel="Open">
        <PaletteInput aria-label="Search" />
        <PaletteList aria-label="Results">
          <PaletteGroup groupId="g" heading="Group">
            <PaletteItem value="see-all" title="See all" leading={<span />} />
          </PaletteGroup>
        </PaletteList>
      </Palette>,
    );
    expect(screen.getByText("See all")).not.toBeNull();
    expect(
      document.querySelector('[data-slot="palette-item-subtitle"]'),
    ).toBeNull();
  });
});

describe("Table scroll and sticky header", () => {
  it("drops its own scroller when the parent owns the scroll", () => {
    render(
      <div data-testid="owner">
        <Table scroll="none">
          <TableBody>
            <TableRow>
              <TableCell>شنطة جلد</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>,
    );
    expect(document.querySelector('[data-slot="table-container"]')).toBeNull();
    expect(screen.getByTestId("owner").firstElementChild).toBe(
      screen.getByRole("table"),
    );
  });

  it("pins a sticky header above raised cells with an opaque head", () => {
    render(
      <Table scroll="none">
        <TableHeader sticky>
          <TableRow>
            <TableHead>المنتج</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const header = document.querySelector('[data-slot="table-header"]');
    expect(header?.className).toContain("sticky");
    expect(header?.className).toContain("z-raised-more");
    expect(header?.hasAttribute("data-sticky")).toBe(true);
    const head = document.querySelector('[data-slot="table-head"]');
    expect(head?.className).toContain("group-data-sticky/header:bg-background");
  });

  it("keeps its scroller and a plain header by default", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    expect(
      document.querySelector('[data-slot="table-container"]')?.className,
    ).toContain("overflow-x-auto");
    const header = document.querySelector('[data-slot="table-header"]');
    expect(header?.hasAttribute("data-sticky")).toBe(false);
  });
});
