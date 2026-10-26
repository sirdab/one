import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConversationHold } from "../conversation";
import { Reasoning } from "../reasoning";

/* The disclosure's contract is its timing: open while thinking streams, fold
   itself once a beat after it ends (so the reply below it gets the room), and
   never fold on someone who opened it by hand. A persisted turn starts
   folded, because a reload is not the moment to replay a thought. */
describe("Reasoning", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays open while streaming, then folds itself under the finished label", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Reasoning streaming label="Thinking">
        checking this week's orders
      </Reasoning>,
    );
    expect(screen.getByText("checking this week's orders")).toBeTruthy();

    rerender(
      <Reasoning streaming={false} label="Thought for 8s">
        checking this week's orders
      </Reasoning>,
    );
    expect(screen.getByText("Thought for 8s")).toBeTruthy();
    expect(screen.getByText("checking this week's orders")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("checking this week's orders")).toBeNull();
  });

  /* With auto off the disclosure never moves on its own: folded from the
       start, while it streams and after, and open only when someone opens
       it, where it stays. */
  it("starts folded with auto off, live or saved, and only the trigger opens it", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Reasoning streaming auto={false} label="Thinking">
        checking this week's orders
      </Reasoning>,
    );
    expect(screen.queryByText("checking this week's orders")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Thinking/ }));
    expect(screen.getByText("checking this week's orders")).toBeTruthy();
    rerender(
      <Reasoning streaming={false} auto={false} label="Thought for 8s">
        checking this week's orders
      </Reasoning>,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("checking this week's orders")).toBeTruthy();
  });

  it("starts folded for a finished thought and opens on the trigger", () => {
    render(
      <Reasoning streaming={false} label="Thought for 3s">
        the reasoning
      </Reasoning>,
    );
    expect(screen.queryByText("the reasoning")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Thought for 3s/ }));
    expect(screen.getByText("the reasoning")).toBeTruthy();
  });

  it("never folds on someone who opened it by hand", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Reasoning streaming={false} label="Thought for 2s">
        kept open
      </Reasoning>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Thought for 2s/ }));
    rerender(
      <Reasoning streaming={false} label="Thought for 2s">
        kept open
      </Reasoning>,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("kept open")).toBeTruthy();
  });

  /* Opening a thought at the bottom of a chat must not slide the view to
       keep the bottom pinned: it opens downward, in place, at once. */
  it("holds the conversation's scroll when opened by hand", () => {
    const hold = vi.fn();
    render(
      <ConversationHold value={hold}>
        <Reasoning streaming={false} label="Thought for 3s">
          checked the orders
        </Reasoning>
      </ConversationHold>,
    );
    fireEvent.click(screen.getByText("Thought for 3s"));
    expect(hold).toHaveBeenCalledTimes(1);
  });
});
