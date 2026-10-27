import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TablesPage from "../sections/tables/page";

describe("Tables section", () => {
  it.each(["en", "ar"])("renders the sortable demo in %s", async (lang) => {
    render(await TablesPage({ lang }));
    const ascending = document.querySelector('[aria-sort="ascending"]');
    expect(ascending).not.toBeNull();
    expect(
      document.querySelectorAll('[aria-sort="none"]').length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      document.querySelectorAll('[data-slot="table-sort-glyph"]').length,
    ).toBe(3);
  });
});
