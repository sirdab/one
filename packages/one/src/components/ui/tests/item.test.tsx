import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "../item";
import { Separator } from "../separator";

function classesOf(testId: string): string[] {
  return (screen.getByTestId(testId).className ?? "").split(/\s+/);
}

describe("Item", () => {
  it("is a padded row that keeps its action on the line", () => {
    render(<Item data-testid="item" />);
    const cls = classesOf("item");
    expect(cls).toEqual(
      expect.arrayContaining([
        "flex",
        "items-center",
        "gap-4",
        "px-6",
        "py-4",
        "max-sm:px-4",
        "max-sm:py-3.5",
      ]),
    );
    expect(cls).not.toContain("flex-wrap");
  });

  it("has a hairline tile and a whisper well for what sits inside a card", () => {
    render(
      <>
        <Item data-testid="tile" variant="outline" />
        <Item data-testid="well" variant="muted" />
      </>,
    );
    const tile = classesOf("tile");
    expect(tile).toEqual(
      expect.arrayContaining(["border", "border-border", "rounded-xl"]),
    );
    expect(tile).not.toContain("shadow-card");
    const well = classesOf("well");
    expect(well).toEqual(
      expect.arrayContaining(["bg-surface-whisper", "rounded-xl"]),
    );
    expect(well).not.toContain("border");
  });

  it("hovers a link row with the row wash, and leaves focus to the global outline", () => {
    render(
      <Item asChild data-testid="link">
        <a href="/app/settings">Open</a>
      </Item>,
    );
    const cls = classesOf("link");
    expect(cls).toContain("[a]:hover:bg-row-surface-hover");
    expect(cls.join(" ")).not.toMatch(/outline-none|focus-visible:ring/);
  });
});

describe("Item parts", () => {
  it("sets the title, description and actions in the house roles", () => {
    render(
      <Item>
        <ItemContent data-testid="content">
          <ItemTitle data-testid="title">Email</ItemTitle>
          <ItemDescription data-testid="description">
            sara@example.com
          </ItemDescription>
        </ItemContent>
        <ItemActions data-testid="actions">
          <button>Change</button>
        </ItemActions>
      </Item>,
    );
    expect(classesOf("title")).toEqual(
      expect.arrayContaining(["text-body", "font-medium"]),
    );
    const description = classesOf("description");
    expect(description).toEqual(
      expect.arrayContaining(["text-body-quiet", "text-muted-foreground"]),
    );
    expect(description).not.toContain("text-subtle");
    expect(classesOf("content")).toEqual(
      expect.arrayContaining(["flex-1", "min-w-0"]),
    );
    expect(classesOf("actions")).toContain("shrink-0");
  });

  it("sizes a media slot to a 40px tile", () => {
    render(
      <>
        <ItemMedia data-testid="icon" variant="icon" />
        <ItemMedia data-testid="image" variant="image" />
      </>,
    );
    expect(classesOf("icon")).toContain("size-10");
    expect(classesOf("image")).toContain("size-10");
  });

  it("groups rows in a column", () => {
    render(<ItemGroup data-testid="group" />);
    expect(classesOf("group")).toEqual(
      expect.arrayContaining(["flex", "flex-col"]),
    );
  });
});

describe("Separator", () => {
  it("is a full-width hairline in the border colour", () => {
    render(<Separator data-testid="rule" />);
    const rule = screen.getByTestId("rule");
    expect(rule.className).toContain("bg-border");
    expect(rule.className).toContain("data-[orientation=horizontal]:h-px");
    expect(rule.className).toContain("data-[orientation=horizontal]:w-full");
    expect(rule.getAttribute("role")).toBe("none");
  });

  it("is the row divider between items, flush to the card edges", () => {
    render(<ItemSeparator data-testid="rule" />);
    const rule = screen.getByTestId("rule");
    expect(rule.dataset.slot).toBe("item-separator");
    expect(rule.className).toContain("bg-border");
    expect(rule.className).toContain("my-0");
  });
});
