import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchIcon } from "../../icons/catalogue";
import { Button } from "../button";
import { Icon } from "../icon";
import { Input } from "../input";

function wrapperOf(placeholder: string): HTMLElement {
  const wrapper = screen
    .getByPlaceholderText(placeholder)
    .closest('[data-slot="input-wrapper"]');
  if (!(wrapper instanceof HTMLElement)) throw new Error("no wrapper");
  return wrapper;
}

describe("Input read-only hover gate", () => {
  /* Regression: :read-only means "not :read-write", which is true of every
       plain span/div, so an UNSCOPED :has(:read-only) matches the wrapper's
       own inner spans and silently kills hover on every input. The gate must
       stay scoped to actual form elements. Same trap would bite :has(:enabled)
       or :has(:optional). */
  it("scopes the read-only check to form elements", () => {
    render(<Input placeholder="probe" />);
    const wrapper = wrapperOf("probe");
    expect(wrapper.className).toContain(
      "not-has-[:is(input,textarea,select):read-only]",
    );
    expect(wrapper.className).not.toMatch(/not-has-\[:read-only\]/);
  });

  it("editable input's wrapper does not match the scoped selector", () => {
    render(<Input placeholder="editable" />);
    expect(
      wrapperOf("editable").matches(
        ":has(:is(input,textarea,select):read-only)",
      ),
    ).toBe(false);
  });

  it("readOnly input's wrapper does match the scoped selector", () => {
    render(<Input placeholder="frozen" readOnly />);
    expect(
      wrapperOf("frozen").matches(":has(:is(input,textarea,select):read-only)"),
    ).toBe(true);
  });
});

describe("Input trailing slot", () => {
  it("snugs the end padding only when trailing content is present", () => {
    render(
      <>
        <Input placeholder="plain" />
        <Input
          placeholder="with-button"
          trailing={<Button aria-label="copy" size="icon-sm" />}
        />
      </>,
    );
    expect(wrapperOf("plain").className).not.toContain("pe-1");
    expect(wrapperOf("with-button").className).toContain("pe-1");
  });
});

describe("Input direction", () => {
  /* Regression: dir="auto" on the wrapper let a Latin value ("M") flip the
       whole box to LTR on an Arabic page, moving the trailing delete button
       to the right. Auto is about the text, so only the field takes it; a
       fixed direction (the phone field's ltr) still pins the box. */
  it("lets dir=auto reach the text without mirroring the box", () => {
    render(<Input placeholder="value" dir="auto" />);
    expect(wrapperOf("value").hasAttribute("dir")).toBe(false);
    expect(screen.getByPlaceholderText("value").getAttribute("dir")).toBe(
      "auto",
    );
  });

  it("pins the whole box for a fixed direction", () => {
    render(<Input placeholder="phone" dir="ltr" />);
    expect(wrapperOf("phone").getAttribute("dir")).toBe("ltr");
  });
});

describe("Input leading control slot", () => {
  /* The icon gutter QUIETS its content and lights it with focus. A live
       control (the phone field's country select) must not inherit that: it
       owns its own hover ladder, and dimming it at rest would say it is not
       pressable. Two slots, two jobs. */
  it("does not quiet a leading control the way it quiets a leading icon", () => {
    render(
      <>
        <Input placeholder="icon" leading={<Icon icon={SearchIcon} />} />
        <Input
          placeholder="control"
          leadingControl={<Button aria-label="country" />}
        />
      </>,
    );
    const iconSlot = wrapperOf("icon").querySelector("span");
    expect(iconSlot?.className).toContain("icon-quiet");

    const controlSlot = wrapperOf("control").querySelector(
      '[data-slot="input-leading-control"]',
    );
    expect(controlSlot?.className).not.toContain("icon-quiet");
  });

  it("snugs the start padding only when a leading control is present", () => {
    render(
      <>
        <Input placeholder="bare" />
        <Input
          placeholder="prefixed"
          leadingControl={<Button aria-label="country" />}
        />
      </>,
    );
    expect(wrapperOf("bare").className).not.toContain("ps-1");
    // 4 + 32 + 4 fills the 40px box exactly, mirroring the trailing slot.
    expect(wrapperOf("prefixed").className).toContain("ps-1");
  });
});

describe("Input disabled", () => {
  /* Decision: the trailing slot stays LIVE next to a disabled field (a copy
       button still works), so the wrapper must not kill pointer events or
       dim the slot. */
  it("keeps the trailing button clickable and undimmed", () => {
    let clicks = 0;
    render(
      <Input
        placeholder="frozen"
        disabled
        trailing={
          <Button
            aria-label="copy"
            size="icon-sm"
            variant="ghost"
            onClick={() => clicks++}
          />
        }
      />,
    );
    expect(wrapperOf("frozen").className).not.toContain("pointer-events-none");
    fireEvent.click(screen.getByRole("button", { name: "copy" }));
    expect(clicks).toBe(1);
  });
});

describe("Input invalid", () => {
  /* Decision: invalid NEVER colours the border. The error is text. */
  it("keeps neutral chrome on aria-invalid", () => {
    render(<Input placeholder="bad" aria-invalid />);
    expect(wrapperOf("bad").className).not.toMatch(/border-destructive/);
  });
});

describe("Input loading", () => {
  /* Regression: an absolutely-positioned spinner with a halo centered 4px
       off the trailing-icon column. The spinner is an in-flow trailing slot
       member (32px box) and the wrapper snugs its end padding like any
       trailing content. */
  it("renders the spinner in-flow and snugs the end padding", () => {
    render(<Input placeholder="busy" loading />);
    const wrapper = wrapperOf("busy");
    expect(wrapper.className).toContain("pe-1");
    const spinner = wrapper.querySelector("svg.animate-spin");
    expect(spinner).not.toBeNull();
    expect(spinner?.parentElement?.className).toContain("size-8");
    expect(spinner?.parentElement?.className).not.toContain("absolute");
    // ink, not the quiet ladder: activity must read at full strength
    expect(spinner?.parentElement?.className).toContain("text-foreground");
    expect(spinner?.parentElement?.className).not.toContain("icon-quiet");
  });
});

describe("Input leading icon scale", () => {
  /* The 40px default renders 20px icons (half the control height); the
       compact md/sm rungs hold 16px. */
  it("runs 20px on the default and 16px on md", () => {
    render(
      <>
        <Input placeholder="form" leading={<Icon icon={SearchIcon} />} />
        <Input
          placeholder="compact"
          size="md"
          leading={<Icon icon={SearchIcon} />}
        />
      </>,
    );
    const spanOf = (ph: string) =>
      wrapperOf(ph).firstElementChild as HTMLElement;
    expect(spanOf("form").className).toContain("[&_svg]:size-5");
    expect(spanOf("compact").className).toContain("[&_svg]:size-4");
  });
});

describe("Input default size", () => {
  /* Decision (2026-07-26): 40 is the house default; 36 is size="md". */
  it("is the 40px rounded-xl rung", () => {
    render(<Input placeholder="d" />);
    const cls = wrapperOf("d").className;
    expect(cls).toContain("h-control-xl");
    expect(cls).toContain("rounded-xl");
  });
});

describe("Input focus forwarding", () => {
  /* Regression: the wrapper hovered as one box but only the inner input
       was clickable. The padding and icon gutter were dead space. */
  it("forwards a click on the wrapper's dead space to the field", () => {
    render(
      <Input placeholder="findable" leading={<Icon icon={SearchIcon} />} />,
    );
    fireEvent.pointerDown(wrapperOf("findable"));
    expect(document.activeElement).toBe(
      screen.getByPlaceholderText("findable"),
    );
  });

  it("leaves trailing controls' clicks alone", () => {
    render(
      <Input
        placeholder="quiet"
        trailing={
          <Button variant="ghost" size="icon-sm" aria-label="copy">
            <Icon icon={SearchIcon} />
          </Button>
        }
      />,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "copy" }));
    expect(document.activeElement).not.toBe(
      screen.getByPlaceholderText("quiet"),
    );
  });

  it("does not forward focus to a disabled field", () => {
    render(<Input placeholder="off" disabled />);
    fireEvent.pointerDown(wrapperOf("off"));
    expect(document.activeElement).not.toBe(screen.getByPlaceholderText("off"));
  });
});

/* The bare field's ONLY focus cue is the global focus-visible outline. The
   bordered field suppresses that outline because its own border plus ring
   already paint the ink. Hoisting outline-none out of the ternary reads like
   a harmless dedupe and would leave the inline-edit title with no focus
   affordance at all, so both directions are pinned. */
describe("Input bare mode", () => {
  it("drops the box so the caller owns the chrome", () => {
    render(<Input bare placeholder="title" />);
    const wrapper = screen
      .getByPlaceholderText("title")
      .closest('[data-slot="input-wrapper"]');
    expect(wrapper?.className).not.toContain("border-input");
    expect(wrapper?.className).not.toContain("focus-within:ring-input-focus");
  });

  it("keeps the global focus outline that the bordered field suppresses", () => {
    render(<Input bare placeholder="bare" />);
    const cls = screen.getByPlaceholderText("bare").className;
    expect(cls).not.toContain("outline-none");
    expect(cls).not.toContain("outline-hidden");
  });

  /* outline-hidden (a transparent outline), not outline-none: the ink
       border and ring are box-shadows that forced-colors mode strips, and a
       transparent outline is what Windows High Contrast still paints. */
  it("still suppresses the outline when it has a border to pair with", () => {
    render(<Input placeholder="boxed" />);
    const cls = screen.getByPlaceholderText("boxed").className;
    expect(cls).toContain("outline-hidden");
    expect(cls).toContain("focus-visible:outline-hidden");
    expect(cls).not.toContain("outline-none");
  });
});

describe("Input direction", () => {
  it("lets an empty auto field take the page's direction, so its placeholder sits right", () => {
    const { rerender } = render(
      <Input dir="auto" value="" placeholder="أضف قيمة" readOnly />,
    );
    const field = screen.getByPlaceholderText("أضف قيمة");
    expect(field.getAttribute("dir")).toBeNull();
    rerender(<Input dir="auto" value="M" placeholder="أضف قيمة" readOnly />);
    expect(field.getAttribute("dir")).toBe("auto");
  });
});

/* The browser's own cancel glyph ignores the system; a search field clears
   through the house ghost button instead, and the caller's onChange sees the
   empty value as if it were typed. */
describe("a search field's clear button", () => {
  function SearchField(): React.JSX.Element {
    const [value, setValue] = React.useState("oud");
    return (
      <Input
        type="search"
        size="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        clearLabel="Clear search"
        aria-label="Search"
      />
    );
  }

  it("empties the field through its own onChange, and leaves with the text", () => {
    render(<SearchField />);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(
      (
        screen.getByRole("searchbox", {
          name: "Search",
        }) as HTMLInputElement
      ).value,
    ).toBe("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
});

/* The floating label is the field's name, and :placeholder-shown is the only
   way CSS can tell the box is empty, so a floating field always carries a
   placeholder, blank unless the caller gave an example. */
describe("Input with a floating label", () => {
  it("names the field and keeps a placeholder for the empty check", () => {
    render(<Input floatingLabel="Email" defaultValue="" />);
    const field = screen.getByLabelText("Email");
    expect(field.getAttribute("placeholder")).toBe(" ");
  });

  it("keeps the caller's id and example", () => {
    render(
      <Input
        id="email-field"
        floatingLabel="Email"
        placeholder="name@example.com"
      />,
    );
    const field = screen.getByLabelText("Email");
    expect(field.id).toBe("email-field");
    expect(field.getAttribute("placeholder")).toBe("name@example.com");
  });
});
