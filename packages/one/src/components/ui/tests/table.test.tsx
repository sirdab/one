import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
  TableRowLink,
  TableSortLink,
} from "../table";

function renderTable({
  interactive = false,
  multiline = false,
}: { interactive?: boolean; multiline?: boolean } = {}) {
  render(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>المنتج</TableHead>
          <TableHead numeric>السعر</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow interactive={interactive}>
          <TableCell multiline={multiline}>
            {interactive ? (
              <TableRowLink href="/products/1">شنطة جلد</TableRowLink>
            ) : (
              "شنطة جلد"
            )}
          </TableCell>
          <TableCell numeric>٢٤٩</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

const PLAIN_HOVER =
  "group-data-interactive/row:group-not-data-selected/row:group-hover/row:bg-row-surface-hover";

const band = (): Element | null =>
  document.querySelector('[data-slot="table-cell-band"]');

const bodyRow = (): Element | null =>
  document.querySelector('[data-slot="table-body"] [data-slot="table-row"]');

describe("Table", () => {
  it("keeps rows on the 52px data rhythm", () => {
    renderTable();
    expect(band()?.className).toContain("h-row");
  });

  it("lets stacked records determine their height without changing compact rows", () => {
    renderTable({ multiline: true });
    expect(band()?.className).not.toContain("h-row");
    expect(band()?.closest("td")?.className).toContain("align-top");
  });

  it("renders 40px label-tone header cells", () => {
    renderTable();
    const head = document.querySelector('[data-slot="table-head"]');
    const cls = head?.className ?? "";
    expect(cls).toContain("h-control-xl");
    expect(cls).toContain("text-label");
    expect(cls).toContain("text-muted-foreground");
  });

  it("divides every row at the band's edge", () => {
    renderTable();
    for (const slot of ["table-head", "table-cell"]) {
      const el = document.querySelector(`[data-slot="${slot}"]`);
      expect(el?.className).toContain("border-b");
      expect(el?.className).toContain("border-row-divider");
    }
    expect(
      document.querySelector('[data-slot="table-cell"]')?.className,
    ).toContain("p-0");
    expect(band()?.className).toContain("my-1.5");
  });

  it("hovers as one rounded pill, painted on the cell bands", () => {
    renderTable({ interactive: true });
    const table = document.querySelector('[data-slot="table"]');
    expect(table?.className).toContain("border-separate");
    const row = bodyRow();
    expect(row?.className).toContain("group/row");
    expect(row?.hasAttribute("data-interactive")).toBe(true);
    for (const cell of bodyRow()?.querySelectorAll(
      '[data-slot="table-cell-band"]',
    ) ?? []) {
      expect(cell.className).toContain(PLAIN_HOVER);
    }

    expect(row?.className).not.toContain("row-surface");
  });

  it("hangs nothing off a row: no pseudo-element, no positioned child", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>شنطة جلد</TableCell>
          </TableRow>
          <TableRow interactive>
            <TableCell>شنطة جلد</TableCell>
          </TableRow>
          <TableRow interactive selected>
            <TableCell>شنطة جلد</TableCell>
          </TableRow>
          <TableRow selected={false}>
            <TableCell>شنطة جلد</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const rows = document.querySelectorAll("tr");
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      expect(row.className).not.toMatch(/(^|[\s:])(before|after):/);
      expect(row.className.split(/\s+/)).not.toContain("absolute");
    }
  });

  it("leaves a display-only row unlit and unpointered", () => {
    renderTable();
    const row = bodyRow();
    expect(row?.hasAttribute("data-interactive")).toBe(false);
    expect(row?.className).not.toContain("cursor-pointer");
  });

  it("opens the row through a stretched link, actions above it", () => {
    render(
      <Table>
        <TableBody>
          <TableRow interactive>
            <TableCell>
              <TableRowLink href="/products/1">شنطة جلد</TableRowLink>
            </TableCell>
            <TableCell>
              <TableRowActions>
                <button type="button">حذف</button>
              </TableRowActions>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = bodyRow();
    expect(row?.getAttribute("role")).toBeNull();
    expect(row?.className).toContain("relative");
    const link = screen.getByRole("link", { name: "شنطة جلد" });
    expect(link.className).toContain("after:absolute");
    expect(link.className).toContain("after:inset-0");

    expect(screen.getByRole("button", { name: "حذف" })).not.toBeNull();
    const actions = document.querySelector('[data-slot="table-row-actions"]');
    expect(actions?.className).toContain("z-raised");
    expect(actions?.className).toContain("relative");
  });

  it("ends and tabularises numeric columns", () => {
    renderTable();
    const heads = document.querySelectorAll('[data-slot="table-head"]');
    expect(heads[0].className).not.toContain("text-end");
    expect(heads[1].className).toContain("text-end");
    const bands = document.querySelectorAll('[data-slot="table-cell-band"]');
    expect(bands[1].className).toContain("justify-end");
    expect(bands[1].className).toContain("tabular");
    expect(bands[0].className).not.toContain("tabular");
  });

  it("keeps numbers right-flush under RTL", () => {
    renderTable();
    const heads = document.querySelectorAll('[data-slot="table-head"]');
    expect(heads[1].className).toContain("rtl:text-start");
    const bands = document.querySelectorAll('[data-slot="table-cell-band"]');
    expect(bands[1].className).toContain("rtl:justify-start");

    expect(heads[0].className).not.toContain("rtl:");
    expect(bands[0].className).not.toContain("rtl:");
  });

  it("lets one fill column take the rest and give back its min-content", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead fill>المنتج</TableHead>
            <TableHead numeric>السعر</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell fill>شنطة جلد</TableCell>
            <TableCell numeric>٢٤٩</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const heads = document.querySelectorAll('[data-slot="table-head"]');
    const cells = document.querySelectorAll('[data-slot="table-cell"]');
    for (const fill of [heads[0], cells[0]]) {
      expect(fill.className).toContain("w-full");
      expect(fill.className).toContain("max-w-0");
    }
    expect(heads[1].className).not.toContain("max-w-0");
    expect(cells[1].className).not.toContain("max-w-0");
  });

  it("tints a selected row's bands, and deepens the tint under the pointer", () => {
    render(
      <Table>
        <TableBody>
          <TableRow interactive selected>
            <TableCell>شنطة جلد</TableCell>
            <TableCell>٢٤٩</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = bodyRow();
    expect(row?.hasAttribute("data-selected")).toBe(true);
    expect(row?.className).not.toContain("row-surface");
    const bands = document.querySelectorAll('[data-slot="table-cell-band"]');
    expect(bands).toHaveLength(2);
    for (const band of bands) {
      expect(band.className).toContain(
        "group-data-selected/row:bg-row-surface-selected",
      );
      expect(band.className).toContain(
        "group-data-selected/row:group-data-interactive/row:group-hover/row:bg-row-surface-selected-hover",
      );
      expect(band.className).toContain(PLAIN_HOVER);
    }
  });

  it("leaves a row that is not selected unflagged", () => {
    render(
      <Table>
        <TableBody>
          <TableRow interactive selected={false}>
            <TableCell>شنطة جلد</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = bodyRow();
    expect(row?.hasAttribute("data-selected")).toBe(false);
    expect(row?.hasAttribute("data-interactive")).toBe(true);
  });

  it("flags and anchors a selectable row that opens nothing", () => {
    render(
      <Table>
        <TableBody>
          <TableRow selected>
            <TableCell>شنطة جلد</TableCell>
          </TableRow>
          <TableRow selected={false}>
            <TableCell>عطر</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const [ticked, rest] = Array.from(
      document.querySelectorAll('[data-slot="table-body"] tr'),
    );
    expect(ticked.hasAttribute("data-selected")).toBe(true);
    expect(ticked.className).toContain("relative");
    expect(rest.className).toContain("relative");
    expect(rest.className).not.toContain("row-surface");
  });

  it("insets and rounds the cells a phone shows at its edges, not the DOM's first and last", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="max-sm:hidden">x</TableCell>
            <TableCell>شنطة جلد</TableCell>
            <TableCell className="hidden sm:table-cell">٢٤٩</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const shown =
      ':not([class~="hidden"],[class~="max-sm:hidden"],[class~="max-md:hidden"])';
    const bands = document.querySelectorAll('[data-slot="table-cell-band"]');
    expect(bands).toHaveLength(3);
    for (const band of bands) {
      expect(band.className).toContain(
        `max-sm:[td:nth-child(1_of_${shown})>&]:ps-0`,
      );
      expect(band.className).toContain(
        `max-sm:[td:nth-last-child(1_of_${shown})>&]:pe-0`,
      );
      expect(band.className).toContain(
        `max-sm:[td:nth-child(1_of_${shown})>&]:rounded-s-xl`,
      );
      expect(band.className).toContain(
        `max-sm:[td:nth-last-child(1_of_${shown})>&]:rounded-e-xl`,
      );

      expect(band.className).toContain("[td:first-child>&]:rounded-s-xl");
      expect(band.className).toContain("[td:last-child>&]:rounded-e-xl");
    }

    for (const cell of document.querySelectorAll('[data-slot="table-cell"]')) {
      expect(cell.className).not.toContain("rounded");
    }
  });

  it("keeps real table semantics", () => {
    renderTable();
    expect(screen.getByRole("table")).not.toBeNull();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("cell")).toHaveLength(2);
  });
});

describe("sortable heads", () => {
  const head = (): Element | null =>
    document.querySelector('[data-slot="table-head"]');
  const glyph = (): Element | null =>
    document.querySelector('[data-slot="table-sort-glyph"]');

  function renderHead(sort: "ascending" | "descending" | "none"): void {
    render(
      <table>
        <thead>
          <tr>
            <TableHead sort={sort}>
              <TableSortLink asChild sort={sort}>
                <a href="?sort=name">الاسم</a>
              </TableSortLink>
            </TableHead>
          </tr>
        </thead>
      </table>,
    );
  }

  it("announces aria-sort only when the head is given a sort", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>plain</TableHead>
            <TableHead sort="none">idle</TableHead>
            <TableHead sort="descending">active</TableHead>
          </tr>
        </thead>
      </table>,
    );
    const heads = document.querySelectorAll('[data-slot="table-head"]');
    expect(heads[0]?.hasAttribute("aria-sort")).toBe(false);
    expect(heads[1]?.getAttribute("aria-sort")).toBe("none");
    expect(heads[2]?.getAttribute("aria-sort")).toBe("descending");
    expect(head()).not.toBeNull();
  });

  it("draws a different glyph for ascending, descending and idle", () => {
    const paths: string[] = [];
    for (const sort of ["ascending", "descending", "none"] as const) {
      renderHead(sort);
      paths.push(glyph()?.innerHTML ?? "");
      document.body.innerHTML = "";
    }
    expect(paths.every((markup) => markup.length > 0)).toBe(true);
    expect(new Set(paths).size).toBe(3);
  });

  it("holds the idle glyph's space, reveals it on hover, focus and touch", () => {
    renderHead("none");
    const cls = glyph()?.getAttribute("class") ?? "";
    expect(cls).toContain("opacity-0");
    expect(cls).toContain("group-hover/sort:opacity-100");
    expect(cls).toContain("group-focus-visible/sort:opacity-100");
    expect(cls).toContain("pointer-coarse:opacity-100");
    expect(cls).not.toContain("hidden");
  });

  it("keeps the active glyph visible", () => {
    renderHead("ascending");
    expect(glyph()?.getAttribute("class")).not.toContain("opacity-0");
  });

  it("gives the link a 44px tap area", () => {
    renderHead("none");
    const cls =
      document.querySelector('[data-slot="table-sort-link"]')?.className ?? "";
    expect(cls).toContain("relative");
    expect(cls).toContain("touch-target");
    expect(cls).toContain("whitespace-nowrap");
  });

  it("asChild renders the child anchor with its href, not a nested one", () => {
    renderHead("none");
    const anchors = document.querySelectorAll("a");
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.getAttribute("href")).toBe("?sort=name");
    expect(anchors[0]?.textContent).toBe("الاسم");
    expect(anchors[0]?.querySelector("svg")).not.toBeNull();
  });

  it("renders its own anchor without asChild", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead sort="none">
              <TableSortLink href="?sort=x" sort="none">
                X
              </TableSortLink>
            </TableHead>
          </tr>
        </thead>
      </table>,
    );
    expect(document.querySelectorAll("a")).toHaveLength(1);
    expect(document.querySelector("a")?.getAttribute("href")).toBe("?sort=x");
  });
});

describe("existing row tone compatibility", () => {
  it("keeps exception rows distinct without changing the default band", () => {
    render(
      <Table>
        <TableBody>
          <TableRow tone="warning">
            <TableCell>Needs review</TableCell>
          </TableRow>
          <TableRow tone="muted">
            <TableCell>Archived</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(
      screen.getByText("Needs review").closest("tr")?.getAttribute("data-tone"),
    ).toBe("warning");
    expect(screen.getByText("Archived").closest("tr")?.className).toContain(
      "text-muted-foreground",
    );
  });
});
