import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchIcon } from "../../icons/catalogue";
import { ArrowUpRightIcon } from "../../icons/general";
import { Checkbox } from "../checkbox";
import { Icon } from "../icon";
import { Label } from "../label";
import { Switch } from "../switch";
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("is never user-resizable", () => {
    render(<Textarea placeholder="t" />);
    expect(screen.getByPlaceholderText("t").className).toContain("resize-none");
  });

  it("keeps a forced-colors focus indicator", () => {
    render(<Textarea placeholder="t" />);
    const cls = screen.getByPlaceholderText("t").className;
    expect(cls).toContain("outline-hidden");
    expect(cls).not.toContain("outline-none");
  });

  it("has no hover border rung", () => {
    render(<Textarea placeholder="t" />);
    expect(screen.getByPlaceholderText("t").className).not.toMatch(
      /hover:[^ ]*border/,
    );
  });

  it("disabled dims contents, never the border", () => {
    render(<Textarea placeholder="t" disabled />);
    const cls = screen.getByPlaceholderText("t").className;
    expect(cls).not.toContain("disabled:opacity-50");
    expect(cls).toContain("disabled:text-foreground/50");
    expect(cls).toContain("disabled:placeholder:text-subtle/50");
  });

  it("bare mode drops the chrome for the panel to own", () => {
    render(<Textarea bare placeholder="composer" />);
    const el = screen.getByPlaceholderText("composer");
    expect(el.getAttribute("data-bare")).toBe("true");
    expect(el.className).not.toContain("border-input");
    expect(el.className).not.toContain("rounded-lg");
  });
});

describe("Label", () => {
  it("wires htmlFor and renders a real label element", () => {
    render(
      <>
        <Label htmlFor="f">Product name</Label>
        <input id="f" />
      </>,
    );
    const label = screen.getByText("Product name");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe("f");
  });

  it("does not carry leading-none", () => {
    render(<Label>x</Label>);
    expect(screen.getByText("x").className).not.toContain("leading-none");
  });

  it("sits a control on the first line of a wrapping label", () => {
    render(
      <Label htmlFor="c">
        <Checkbox id="c" />
        {"حدّد كل المنتجات اللي قدامك، وبعدها غيّر حالتها مرة وحدة"}
      </Label>,
    );
    const cls = screen.getByRole("checkbox").closest("label")?.className;
    expect(cls).toContain(
      "has-[>:is([role=checkbox],[role=radio],[role=switch])]:items-start",
    );
    expect(cls).not.toContain("items-center");

    expect(cls).toContain("[&>[role=checkbox]]:mt-0.5");
    expect(cls).toContain("rtl:[&>[role=checkbox]]:mt-1");
    expect(cls).toContain("pointer-coarse:[&>[role=checkbox]]:mt-0");
    expect(cls).toContain("rtl:pointer-coarse:[&>[role=checkbox]]:mt-0.5");
    expect(cls).toContain("[&>[role=radio]]:mt-0.5");
    expect(cls).toContain("rtl:[&>[role=radio]]:mt-1");
    expect(cls).toContain("rtl:[&>[role=switch]]:mt-0.5");
  });

  it("gives a control row the 44px floor on touch, and only a control row", () => {
    render(
      <>
        <Label htmlFor="s">
          <Switch id="s" />
          Active
        </Label>
        <Label htmlFor="n">Product name</Label>
      </>,
    );
    const row = screen.getByRole("switch").closest("label")?.className;
    const plain = screen.getByText("Product name").className;
    const control = "has-[>:is([role=checkbox],[role=radio],[role=switch])]";
    expect(row).toContain(`pointer-coarse:${control}:min-h-11`);
    expect(row).toContain(`pointer-coarse:${control}:py-3`);

    expect(plain).not.toMatch(/(^|\s)pointer-coarse:min-h-11/);
    expect(plain).not.toMatch(/(^|\s)pointer-coarse:py-3/);
  });

  it("renders the optional hint as quiet caption", () => {
    render(<Label hint="(optional)">Bio</Label>);
    const hint = screen.getByText("(optional)");
    expect(hint.className).toContain("text-caption-quiet");
    expect(hint.className).toContain("text-muted-foreground");
  });
});

describe("Icon", () => {
  it("mirrors in RTL only when flip is passed", () => {
    const { container } = render(
      <>
        <Icon icon={ArrowUpRightIcon} flip data-testid="flipped" />
        <Icon icon={SearchIcon} data-testid="fixed" />
      </>,
    );
    const [flipped, fixed] = Array.from(container.querySelectorAll("svg"));
    expect(flipped.getAttribute("class")).toContain("rtl:-scale-x-100");
    expect(fixed.getAttribute("class") ?? "").not.toContain("rtl:-scale-x-100");
  });

  it("is decorative unless labelled", () => {
    const { container } = render(
      <>
        <Icon icon={SearchIcon} />
        <Icon icon={SearchIcon} aria-label="Search" />
      </>,
    );
    const [plain, labelled] = Array.from(container.querySelectorAll("svg"));
    expect(plain.getAttribute("aria-hidden")).toBe("true");
    expect(plain.getAttribute("role")).toBeNull();
    expect(labelled.getAttribute("aria-hidden")).toBeNull();
    expect(labelled.getAttribute("aria-label")).toBe("Search");

    expect(labelled.getAttribute("role")).toBe("img");
  });
});
