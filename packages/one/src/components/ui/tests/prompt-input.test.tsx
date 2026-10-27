import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PromptInput, type PromptInputProps } from "../prompt-input";

function Harness(
  props: Partial<PromptInputProps> & { initial?: string },
): React.JSX.Element {
  const [value, setValue] = useState(props.initial ?? "");
  return (
    <PromptInput
      value={value}
      onValueChange={setValue}
      onSubmit={props.onSubmit ?? (() => {})}
      placeholder="Ask about your store"
      submitLabel="Send"
      stopLabel="Stop"
      {...props}
    />
  );
}

function field(): HTMLTextAreaElement {
  return screen.getByPlaceholderText(
    "Ask about your store",
  ) as HTMLTextAreaElement;
}

describe("PromptInput", () => {
  it("sends the trimmed text on Enter and not on Shift+Enter", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} initial="  late orders  " />);

    fireEvent.keyDown(field(), { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("late orders");
  });

  it("refuses an empty or refused send", () => {
    const onSubmit = vi.fn();
    const { unmount } = render(<Harness onSubmit={onSubmit} initial="   " />);
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();

    render(
      <Harness
        onSubmit={onSubmit}
        initial="hello"
        disabledReason="Answering in another tab"
      />,
    );
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("refuses past maxLength and says why", () => {
    const onSubmit = vi.fn();
    render(
      <Harness
        onSubmit={onSubmit}
        initial="abcdef"
        maxLength={5}
        overLimitLabel="Keep it under 5 characters"
      />,
    );

    fireEvent.keyDown(field(), { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Keep it under 5 characters")).toBeTruthy();
  });

  it("turns the send into Stop while a turn runs and never sends on Enter", () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    render(
      <Harness
        onSubmit={onSubmit}
        onStop={onStop}
        initial="next question"
        streaming
      />,
    );

    fireEvent.keyDown(field(), { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /Stop/ }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /Send/ })).toBeNull();
  });
});
