import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";

describe("CollapsibleContent", () => {
  it("carries the house open and close motion, and keeps the caller's classes", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent className="min-w-0">Body</CollapsibleContent>
      </Collapsible>,
    );
    const content = document.querySelector('[data-slot="collapsible-content"]');
    const cls = content?.className ?? "";
    expect(cls).toContain("data-[state=open]:animate-disclose-open");
    expect(cls).toContain("data-[state=closed]:animate-disclose-close");
    expect(cls).toContain("motion-reduce:animate-none");
    expect(cls).toContain("min-w-0");
  });
});
