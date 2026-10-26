import * as React from "react";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PromptBar } from "../prompt-bar";

/* jsdom has no layout and no Web Animations. Every box sits at a page
   offset that moves on every read (the page moving around the bar: a rail
   folding, the page fading in), and the parts sit `inner` px into the bar,
   which only the bar's own layout changes. */
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

/* Opening the card re-places the parts, it never remounts them: a remount
   dropped the field's focus (and its caret and undo) mid-sentence and put
   the aurora ring out. */
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

/* The field is a textarea: a request can run to a paragraph. Enter still
   sends, the way a one-line bar did; Shift+Enter breaks the line. */
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

/* The examples rotate over the empty field in place of a fixed
   placeholder; the forward arrow takes the one on show. */
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
    // The example now sits in the field, and the overlay is gone.
    expect(
      Array.from(document.querySelectorAll("span")).some(
        (node) => node.textContent === "Add a discount...",
      ),
    ).toBe(false);
  });
});
