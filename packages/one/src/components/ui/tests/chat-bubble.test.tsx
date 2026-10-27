import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatBubble } from "../chat-bubble";

describe("ChatBubble", () => {
  it("paints merchant turns muted, never primary", () => {
    const { container } = render(
      <ChatBubble role="merchant">hello</ChatBubble>,
    );
    const bubble = container.firstElementChild as HTMLElement;
    expect(bubble.className).toContain("bg-muted");
    expect(bubble.className).not.toContain("bg-primary");
    expect(bubble.getAttribute("data-role")).toBe("merchant");
  });

  it("shrinks to its column and breaks a long unbroken run", () => {
    render(<ChatBubble role="merchant">{"a".repeat(400)}</ChatBubble>);
    const bubble = document.querySelector('[data-slot="chat-bubble"]');
    expect(bubble?.className).toContain("min-w-0");
    expect(bubble?.className).toContain("max-w-full");
    expect(bubble?.className).toContain("wrap-anywhere");
  });

  it("keeps the merchant on the right in both directions", () => {
    const { container } = render(
      <ChatBubble role="merchant">ابيع خضار طازج مستورد</ChatBubble>,
    );
    const classes = (container.firstElementChild as HTMLElement).classList;
    expect(classes).toContain("self-end");
    expect(classes).toContain("[[dir=rtl]_&]:self-start");
    expect([...classes].some((c) => c.startsWith("rtl:"))).toBe(false);
  });

  it("keeps the assistant on the other side in both directions", () => {
    const { container } = render(<ChatBubble>وش اسم متجرك؟</ChatBubble>);
    const bubble = container.firstElementChild as HTMLElement;
    expect(bubble.className).toContain("bg-surface-whisper");
    expect(bubble.classList).toContain("self-start");
    expect(bubble.classList).toContain("[[dir=rtl]_&]:self-end");
  });

  it("returns assistant turns to the page tone on the sunken backdrop", () => {
    const { container } = render(<ChatBubble surface="sunken">hi</ChatBubble>);
    const bubble = container.firstElementChild as HTMLElement;
    expect(bubble.className).toContain("bg-background");
    expect(bubble.className).not.toContain("bg-surface-whisper");
  });

  it("renders as the caller's element with asChild for semantic lists", () => {
    const { container } = render(
      <ul className="flex flex-col">
        <ChatBubble asChild role="merchant">
          <li data-testid="chat-merchant">hello</li>
        </ChatBubble>
      </ul>,
    );
    const item = container.querySelector("li");
    expect(item).not.toBeNull();
    expect(item?.className).toContain("bg-muted");
  });
});
