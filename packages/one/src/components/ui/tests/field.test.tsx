import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRow,
  FieldSet,
} from "../field";
import { Input } from "../input";

function classesOf(testId: string): string[] {
  return (screen.getByTestId(testId).className ?? "").split(/\s+/);
}

describe("Field", () => {
  /* The stacked recipe: label, control, then help or error, 6px apart.
       Stock gap-3 was 12px, and its invalid rule painted the label red, which
       the field chrome forbids (invalid never colours; the text under the
       field carries it). */
  it("stacks label, control and help 6px apart, and never paints the label red", () => {
    render(<Field data-testid="field" />);
    const cls = classesOf("field");
    expect(cls).toEqual(
      expect.arrayContaining(["flex", "flex-col", "gap-1.5"]),
    );
    expect(cls).not.toContain("gap-3");
    expect(cls.join(" ")).not.toContain("text-destructive");
  });

  it("lays a switch or checkbox row on one axis, 12px apart", () => {
    render(<Field data-testid="field" orientation="horizontal" />);
    const cls = classesOf("field");
    expect(cls).toEqual(
      expect.arrayContaining(["flex-row", "items-center", "gap-3"]),
    );
    expect(screen.getByTestId("field").dataset.orientation).toBe("horizontal");
  });

  /* Rule 1: a field is 44px tall on a phone. The rung is the Field's, so
       Input, Select and Combobox inside it all take it with no call-site
       size prop and no pointer-coarse patch. */
  it("raises the controls inside it to the 44px touch rung below sm", () => {
    render(<Field data-testid="field" />);
    const cls = classesOf("field");
    for (const slot of [
      "input-wrapper",
      "select-trigger",
      "combobox-trigger",
    ]) {
      expect(cls).toContain(`max-sm:[&_[data-slot=${slot}]]:h-control-touch`);
    }
  });

  it("names its control through the label, and carries the optional hint", () => {
    render(
      <Field>
        <FieldLabel htmlFor="sku" hint="(optional)">
          SKU
        </FieldLabel>
        <Input id="sku" />
      </Field>,
    );
    const input = screen.getByLabelText(/SKU/);
    expect(input.id).toBe("sku");
    screen.getByText("(optional)");
    const label = document.querySelector('[data-slot="field-label"]');
    expect(label?.tagName).toBe("LABEL");
    expect(label?.className).toContain("font-medium");
  });
});

describe("FieldGroup", () => {
  it("is a 16px stack and the container the two-up rows query", () => {
    render(<FieldGroup data-testid="group" />);
    const cls = classesOf("group");
    expect(cls).toContain("@container/field-group");
    expect(cls).toEqual(expect.arrayContaining(["flex-col", "gap-4"]));
    expect(cls).not.toContain("gap-7");
  });
});

describe("FieldRow", () => {
  /* Two-up only when the group is wide enough for a pair, so a side column
       and a phone both stack. */
  it("goes two-up by container width, not by viewport", () => {
    render(<FieldRow data-testid="row" />);
    const cls = classesOf("row");
    expect(cls).toEqual(expect.arrayContaining(["grid", "gap-4"]));
    expect(cls).toContain("@md/field-group:grid-cols-2");
    expect(cls).not.toContain("md:grid-cols-2");
  });

  /* Short numbers (length, width, height) are the one trio that stays
       three across on a phone. */
  it("stays three across for a trio of short numbers", () => {
    render(<FieldRow data-testid="row" columns={3} />);
    const cls = classesOf("row");
    expect(cls).toContain("grid-cols-3");
    expect(cls.join(" ")).not.toContain("field-group");
  });
});

describe("FieldDescription", () => {
  /* Help is read, not decoration: muted-foreground, not the quieter subtle
       tone that measures 3.4:1. */
  it("is the quiet caption in a readable tone", () => {
    render(<FieldDescription data-testid="d">Shape: 05 1234</FieldDescription>);
    const cls = classesOf("d");
    expect(cls).toContain("text-caption-quiet");
    expect(cls).toContain("text-muted-foreground");
    expect(cls).not.toContain("text-subtle");
  });
});

describe("FieldError", () => {
  it("is an alert in destructive caption text", () => {
    render(<FieldError>Enter a valid mobile number.</FieldError>);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Enter a valid mobile number.");
    expect(alert.className).toContain("text-caption");
    expect(alert.className).toContain("text-destructive");
  });

  it("renders nothing when there is nothing to say", () => {
    render(<FieldError>{null}</FieldError>);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("FieldSet", () => {
  it("names a group with a legend in the large body role", () => {
    render(
      <FieldSet>
        <FieldLegend>Analytics</FieldLegend>
        <FieldDescription>Paste an id.</FieldDescription>
        <FieldContent>
          <Field />
        </FieldContent>
      </FieldSet>,
    );
    const legend = screen.getByText("Analytics");
    expect(legend.tagName).toBe("LEGEND");
    expect(legend.className).toContain("text-body-lg");
    expect(legend.className).toContain("font-medium");
    expect(screen.getByRole("group", { name: "Analytics" })).toBeTruthy();
  });

  it("has a label-sized legend for a sub-group", () => {
    render(
      <FieldSet>
        <FieldLegend variant="label">Sizes</FieldLegend>
      </FieldSet>,
    );
    const legend = screen.getByText("Sizes");
    expect(legend.dataset.variant).toBe("label");
    expect(legend.className).toContain("data-[variant=label]:text-body");
  });
});
