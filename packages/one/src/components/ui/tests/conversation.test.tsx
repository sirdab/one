import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../conversation";

vi.mock("use-stick-to-bottom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("use-stick-to-bottom")>();
  return {
    ...actual,
    useStickToBottomContext: () => ({
      isAtBottom: false,
      scrollToBottom: vi.fn(),
      stopScroll: vi.fn(),
    }),
  };
});

describe("ConversationContent", () => {
  it("scrolls from the server render, so its gutter is there before hydration", () => {
    const html = renderToString(
      <Conversation>
        <ConversationContent>
          <p>hello</p>
        </ConversationContent>
      </Conversation>,
    );
    const scroller = /<div[^>]*class="([^"]*scrollbar-hairline[^"]*)"/.exec(
      html,
    );
    expect(scroller?.[1]).toContain("overflow-y-auto");
  });
});

describe("ConversationScrollButton", () => {
  it("is the popover frost, and its hover lays a wash over it", () => {
    render(<ConversationScrollButton label="Jump to latest" />);
    const button = screen.getByRole("button", { name: "Jump to latest" });
    expect(button.className).toContain("bg-popover-surface");
    expect(button.className).toContain("backdrop-blur-popover");
    expect(button.className).toContain("shadow-popover-sm");
    expect(button.getAttribute("data-variant")).toBe("overlay");
    expect(button.className).toContain("hover:wash-50");
    expect(button.className).not.toContain("hover:bg-");
  });
});
