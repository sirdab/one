import * as React from "react";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PromptBar } from "../prompt-bar";

let shift = 0;
let inner = 0;
const animate = vi.fn();

function rect(left: number): DOMRect {
  return {
    x: left,
    y: 0,
    left,
    right: left + 100,
    top: 0,
    bottom: 52,
    width: 100,
    height: 52,
    toJSON: () => ({}),
  } as DOMRect;
}

beforeEach(() => {
  shift = 0;
  inner = 0;
  animate.mockClear();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      shift += 40;
      const isFrame = this.parentElement?.dataset.slot === "prompt-bar";
      return rect(isFrame ? shift : shift + inner);
    },
  );
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: animate,
  });
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function bar(attachments: React.ReactNode): React.JSX.Element {
  return (
    <PromptBar
      leading={<span>mark</span>}
      tool={<button type="button">plus</button>}
      trailing={<button type="submit">send</button>}
      attachments={attachments}
      inputProps={{ "aria-label": "prompt" }}
    />
  );
}

describe("the prompt bar's move", () => {
  it("never runs when nothing flipped, even as effects re-run and the page moves", () => {
    const { rerender } = render(
      <React.StrictMode>{bar(null)}</React.StrictMode>,
    );
    rerender(<React.StrictMode>{bar(null)}</React.StrictMode>);
    expect(animate).not.toHaveBeenCalled();
  });

  it("runs when the bar opens into its card and its parts move inside it", () => {
    const { rerender } = render(bar(null));
    inner = 60;
    rerender(bar(<span>photo</span>));
    expect(animate).toHaveBeenCalled();
  });
});

describe("the prompt bar's card", () => {
  it("keeps the same field, still focused, when it opens and closes", () => {
    const { rerender, getByLabelText } = render(bar(null));
    const field = getByLabelText("prompt");
    field.focus();
    rerender(bar(<span>photo</span>));
    expect(getByLabelText("prompt")).toBe(field);
    expect(document.activeElement).toBe(field);
    rerender(bar(null));
    expect(getByLabelText("prompt")).toBe(field);
    expect(document.activeElement).toBe(field);
  });

  it("hands focus to the field when the focused control goes with its picture", () => {
    const { rerender, getByLabelText, getByRole } = render(
      bar(<button type="button">remove</button>),
    );
    getByRole("button", { name: "remove" }).focus();
    rerender(bar(null));
    expect(document.activeElement).toBe(getByLabelText("prompt"));
  });

  it("leaves focus alone once it has really left the bar", () => {
    const { rerender, getByRole } = render(
      <>
        {bar(<button type="button">remove</button>)}
        <button type="button">elsewhere</button>
      </>,
    );
    getByRole("button", { name: "remove" }).focus();
    getByRole("button", { name: "elsewhere" }).focus();
    rerender(
      <>
        {bar(null)}
        <button type="button">elsewhere</button>
      </>,
    );
    expect(document.activeElement).toBe(
      getByRole("button", { name: "elsewhere" }),
    );
  });

  it("brings a new picture in, but not the ones there when it mounted", () => {
    const entered = (): number =>
      animate.mock.calls.filter(
        ([frames]) => (frames as Keyframe[])[0]?.opacity === 0,
      ).length;
    const { rerender } = render(bar([<span key="a">a</span>]));
    expect(entered()).toBe(0);
    rerender(bar([<span key="a">a</span>, <span key="b">b</span>]));
    expect(entered()).toBe(1);
  });
});

describe("the prompt bar's field", () => {
  function sendable(): { onSubmit: ReturnType<typeof vi.fn> } {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <PromptBar
        onSubmit={onSubmit}
        trailing={<button type="submit">send</button>}
        inputProps={{ "aria-label": "prompt" }}
      />,
    );
    return { onSubmit };
  }

  it("is a textarea", () => {
    sendable();
    expect(
      document.querySelector('[data-slot="prompt-bar-input"]')?.tagName,
    ).toBe("TEXTAREA");
  });

  it("sends on Enter", () => {
    const { onSubmit } = sendable();
    const field = document.querySelector(
      '[data-slot="prompt-bar-input"]',
    ) as HTMLTextAreaElement;
    field.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("breaks the line on Shift+Enter instead of sending", () => {
    const { onSubmit } = sendable();
    const field = document.querySelector(
      '[data-slot="prompt-bar-input"]',
    ) as HTMLTextAreaElement;
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    field.dispatchEvent(event);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("the prompt bar's examples", () => {
  function Host({
    onType,
  }: {
    onType: (value: string) => void;
  }): React.JSX.Element {
    const [value, setValue] = React.useState("");
    return (
      <PromptBar
        placeholders={["Add a discount...", "Show best sellers..."]}
        inputProps={{
          "aria-label": "prompt",
          placeholder: "fixed",
          value,
          onChange: (event) => {
            setValue(event.target.value);
            onType(event.target.value);
          },
        }}
      />
    );
  }

  it("shows the first example over the empty field, not the fixed placeholder", () => {
    const { getByLabelText, getByText } = render(<Host onType={vi.fn()} />);
    expect(getByText("Add a discount...")).toBeTruthy();
    expect(getByLabelText("prompt").getAttribute("placeholder")).toBeNull();
  });

  it("takes the example on show with the forward arrow, and hides once there is text", () => {
    const onType = vi.fn();
    const { getByLabelText } = render(<Host onType={onType} />);
    fireEvent.keyDown(getByLabelText("prompt"), { key: "ArrowRight" });
    expect(onType).toHaveBeenCalledWith("Add a discount...");

    expect(
      Array.from(document.querySelectorAll("span")).some(
        (node) => node.textContent === "Add a discount...",
      ),
    ).toBe(false);
  });
});
