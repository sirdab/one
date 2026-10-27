import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";

function classesOf(testId: string): string[] {
  return (screen.getByTestId(testId).className ?? "").split(/\s+/);
}

describe("Card", () => {
  it("is the raised page card: 16px corner, card shadow, no border, no padding", () => {
    render(<Card data-testid="card" />);
    const cls = classesOf("card");
    expect(cls).toContain("bg-card");
    expect(cls).toContain("rounded-2xl");
    expect(cls).toContain("shadow-card");
    expect(cls).not.toContain("border");
    expect(cls).not.toContain("border-border");
    expect(cls.filter((c) => /^p[xytblrse]?-\d/.test(c))).toEqual([]);
  });

  it("has an outline variant: the hairline card, no shadow", () => {
    render(<Card data-testid="card" variant="outline" />);
    const cls = classesOf("card");
    expect(cls).toContain("border");
    expect(cls).toContain("border-border");
    expect(cls).not.toContain("shadow-card");
    expect(screen.getByTestId("card").dataset.variant).toBe("outline");
  });

  it("keeps `raised` as an alias of the default", () => {
    render(
      <>
        <Card data-testid="plain" />
        <Card data-testid="alias" variant="raised" />
      </>,
    );
    expect(classesOf("alias")).toEqual(classesOf("plain"));
    expect(screen.getByTestId("alias").dataset.variant).toBe("default");
  });

  it("never stacks a shadow and a border", () => {
    render(
      <>
        <Card data-testid="a" />
        <Card data-testid="b" variant="outline" />
        <Card data-testid="c" variant="raised" />
      </>,
    );
    for (const id of ["a", "b", "c"]) {
      const cls = classesOf(id);
      expect(cls.includes("shadow-card") && cls.includes("border")).toBe(false);
    }
  });

  it("dissolves at lg when flat, in either variant", () => {
    render(
      <>
        <Card data-testid="a" flat="lg" />
        <Card data-testid="b" variant="outline" flat="lg" />
      </>,
    );
    for (const id of ["a", "b"]) {
      const cls = classesOf(id);
      expect(cls).toContain("lg:bg-transparent");
      expect(cls).toContain("lg:shadow-none");
      expect(cls).toContain("lg:border-transparent");
    }
  });
});

describe("Card parts", () => {
  it("composes header, title, description, content and footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>What shows on the storefront</CardDescription>
          <CardAction>
            <button>Edit</button>
          </CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    screen.getByRole("heading", { name: "Basics" });
    screen.getByText("What shows on the storefront");
    screen.getByRole("button", { name: "Edit" });
    screen.getByText("Body");
    screen.getByText("Footer");
  });

  it("pads the header, content and footer themselves, 24px from sm and 16px below", () => {
    render(
      <Card>
        <CardHeader data-testid="header" />
        <CardContent data-testid="content" />
        <CardFooter data-testid="footer" />
      </Card>,
    );
    const header = classesOf("header");
    expect(header).toEqual(
      expect.arrayContaining(["px-6", "pt-6", "max-sm:px-4", "max-sm:pt-4"]),
    );
    const content = classesOf("content");
    expect(content).toEqual(expect.arrayContaining(["p-6", "max-sm:p-4"]));
    const footer = classesOf("footer");
    expect(footer).toEqual(
      expect.arrayContaining([
        "px-6",
        "py-4",
        "max-sm:px-4",
        "max-sm:py-3",
        "border-t",
        "border-border",
      ]),
    );
  });

  it("gives a header-only card its own bottom padding", () => {
    render(
      <Card>
        <CardHeader data-testid="header" />
      </Card>,
    );
    expect(classesOf("header")).toEqual(
      expect.arrayContaining(["last:pb-6", "max-sm:last:pb-4"]),
    );
  });

  it("opens the content 16px under a header", () => {
    render(<CardContent data-testid="content" />);
    expect(classesOf("content")).toContain("[[data-slot=card-header]+&]:pt-4");
  });

  it("titles the card as an h2 in the heading-xs role, with no ink bar", () => {
    render(<CardTitle data-testid="title">Contact</CardTitle>);
    const title = screen.getByTestId("title");
    expect(title.tagName).toBe("H2");
    const cls = classesOf("title");
    expect(cls).toContain("text-heading-xs");
    expect(cls.filter((c) => c.includes("before:"))).toEqual([]);
  });

  it("describes in the quiet muted body, readable on a card", () => {
    render(<CardDescription data-testid="d">Hint</CardDescription>);
    const cls = classesOf("d");
    expect(cls).toContain("text-body-quiet");
    expect(cls).toContain("text-muted-foreground");
    expect(cls).not.toContain("text-subtle");
  });

  it.each(["rtl", "ltr"] as const)(
    "puts the action at the header's end, top-aligned, in %s",
    (dir) => {
      render(
        <div dir={dir}>
          <Card>
            <CardHeader data-testid="header">
              <CardTitle>Domain</CardTitle>
              <CardAction data-testid="action">
                <button>Open</button>
              </CardAction>
            </CardHeader>
          </Card>
        </div>,
      );
      const action = classesOf("action");
      expect(action).toEqual(
        expect.arrayContaining([
          "col-start-2",
          "row-start-1",
          "self-start",
          "justify-self-end",
        ]),
      );
      expect(
        action.filter((c) =>
          /^(-?m[lr]-|float-|text-(left|right)|left-|right-)/.test(c),
        ),
      ).toEqual([]);
      expect(classesOf("header")).toContain("grid");
    },
  );

  it("drops the header and the parts' padding when the card is flat at lg", () => {
    render(
      <Card flat="lg">
        <CardHeader data-testid="header" />
        <CardContent data-testid="content" />
      </Card>,
    );
    expect(classesOf("header")).toContain(
      "lg:group-data-[flat=lg]/card:hidden",
    );
    expect(classesOf("content")).toContain("lg:group-data-[flat=lg]/card:p-0");
  });
});
