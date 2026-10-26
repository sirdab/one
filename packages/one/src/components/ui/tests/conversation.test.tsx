import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../conversation";

/* The scroll button only mounts once the reader has left the bottom, which
   needs a real scroller. The library's context is the seam. */
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

/* The scroller's hairline gutter is stable on both edges, and a gutter only
   exists on an element that scrolls. use-stick-to-bottom sets the overflow
   from script, so without the class a server render draws the column 4px
   wider on each side until hydration, and the chat's first line slides on
   refresh. The class carries it from the first byte. */
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

/* The button floats over the reply. COLORS.md answers a floating layer with
   the popover frost, and a hover must not thin it: the overlay variant lays
   its wash over the frosted paper instead of swapping the paper for a
   translucent fill, so the reply behind never shows through under the
   pointer. */
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
