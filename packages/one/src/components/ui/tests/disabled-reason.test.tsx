import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Segmented, SegmentedItem } from "../segmented";
import { Switch } from "../switch";
import { Textarea } from "../textarea";

/* Anything unavailable says WHY, and the reason has to stay REACHABLE.
   The `disabled` attribute drops an element from the tab order and
   suppresses hover, which are the two ways anyone would look for the
   explanation, so a control with a reason goes aria-disabled instead.
   These pin the contract on every control that can refuse. */

const REASON = "اختر خطة مدفوعة أولاً";

describe("disabledReason, controls", () => {
  it.each([
    ["checkbox", <Checkbox key="c" disabledReason={REASON} />],
    ["switch", <Switch key="s" aria-label="تتبّع" disabledReason={REASON} />],
    [
      "radio item",
      <RadioGroup key="r" defaultValue="a">
        <RadioGroupItem value="b" aria-label="ب" disabledReason={REASON} />
      </RadioGroup>,
    ],
    [
      "segmented item",
      <Segmented key="g" defaultValue="a" aria-label="الوضع">
        <SegmentedItem value="a" label="أ" />
        <SegmentedItem value="b" label="ب" disabledReason={REASON} />
      </Segmented>,
    ],
  ])("%s stays reachable rather than hard-disabled", (_name, node) => {
    render(node);
    const target = document.querySelector("[aria-disabled='true']");
    expect(target).not.toBeNull();
    // the real attribute would make the reason unreachable
    expect(target?.hasAttribute("disabled")).toBe(false);
  });

  it("blocks the toggle instead of only looking disabled", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox disabledReason={REASON} onCheckedChange={onCheckedChange} />,
    );
    const box = screen.getByRole("checkbox");
    fireEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(box.getAttribute("data-state")).toBe("unchecked");
  });
});

describe("disabledReason, fields", () => {
  /* A field cannot refuse the way a button does: aria-disabled alone
       still accepts typing, so readOnly is what actually stops editing
       while keeping the field focusable. */
  it.each([
    ["input", <Input key="i" aria-label="السعر" disabledReason={REASON} />],
    [
      "textarea",
      <Textarea key="t" aria-label="الوصف" disabledReason={REASON} />,
    ],
  ])("%s refuses with readOnly, not disabled", (_name, node) => {
    render(node);
    const field = document.querySelector("input, textarea");
    expect(field?.getAttribute("aria-disabled")).toBe("true");
    expect((field as HTMLInputElement).readOnly).toBe(true);
    expect(field?.hasAttribute("disabled")).toBe(false);
  });

  it("keeps a plain disabled field on the real attribute", () => {
    render(<Input aria-label="السعر" disabled />);
    const field = document.querySelector("input");
    expect(field?.hasAttribute("disabled")).toBe(true);
    expect(field?.getAttribute("aria-disabled")).toBeNull();
  });
});
