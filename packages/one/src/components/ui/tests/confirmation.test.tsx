import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Confirmation } from "../confirmation";

/* The approval card is a two-button contract while pending and a quiet
   record once decided: a decided card that still offered buttons would
   invite a second decision on a turn that already moved on. */
describe("Confirmation", () => {
  it("calls onApprove and onDeny from its two buttons while pending", () => {
    const onApprove = vi.fn();
    const onDeny = vi.fn();
    render(
      <Confirmation
        state="pending"
        title="Cancel order #1005 and restock it?"
        approveLabel="Cancel it"
        denyLabel="Keep it"
        onApprove={onApprove}
        onDeny={onDeny}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel it" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));

    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onDeny).toHaveBeenCalledTimes(1);
  });

  it("shows the resolution instead of buttons once decided", () => {
    render(
      <Confirmation
        state="approved"
        title="Cancel order #1005 and restock it?"
        approveLabel="Cancel it"
        denyLabel="Keep it"
        resolvedLabel="Cancelled"
        onApprove={() => {}}
        onDeny={() => {}}
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Cancelled")).toBeTruthy();
  });

  it("holds both buttons while a decision is in flight", () => {
    const onApprove = vi.fn();
    render(
      <Confirmation
        state="pending"
        title="Fulfil order #1005?"
        approveLabel="Fulfil"
        denyLabel="Not now"
        deciding="approve"
        onApprove={onApprove}
        onDeny={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(
      (
        screen.getByRole("button", {
          name: "Not now",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(onApprove).not.toHaveBeenCalled();
  });
});
