import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConversationHold } from "../conversation";
import { Tool, ToolDetail } from "../tool";

describe("Tool", () => {
  it("renders a static row with its state and no trigger when there is no detail", () => {
    const { container } = render(
      <Tool state="running" label="Looking up orders" />,
    );
    const row = container.querySelector('[data-slot="tool"]');
    expect(row?.getAttribute("data-tool-state")).toBe("running");
    expect(screen.getByText("Looking up orders")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("marks a failed step and keeps its label", () => {
    const { container } = render(
      <Tool state="failed" label="Could not read discounts" />,
    );
    expect(
      container
        .querySelector('[data-slot="tool"]')
        ?.getAttribute("data-tool-state"),
    ).toBe("failed");
    expect(screen.getByText("Could not read discounts")).toBeTruthy();
  });

  it("folds its detail behind the label and opens it on click", () => {
    render(
      <Tool state="done" label="Looked at 14 orders">
        <ToolDetail title="Result" value={{ count: 14 }} />
      </Tool>,
    );
    expect(screen.queryByText("Result")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /Looked at 14 orders/ }),
    );
    expect(screen.getByText("Result")).toBeTruthy();
    expect(screen.getByText(/"count": 14/)).toBeTruthy();
  });

  it("holds the conversation's scroll when a step is opened by hand", () => {
    const hold = vi.fn();
    render(
      <ConversationHold value={hold}>
        <Tool state="done" label="Read your orders">
          three orders
        </Tool>
      </ConversationHold>,
    );
    fireEvent.click(screen.getByText("Read your orders"));
    expect(hold).toHaveBeenCalledTimes(1);
  });
});
