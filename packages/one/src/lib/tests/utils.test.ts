import { describe, expect, it } from "vitest";

import { cn } from "../utils";

describe("cn", () => {
  /* tailwind-merge reads an unknown text-* as a colour, so a type role next
       to a text colour was dropped and the role never applied (the bell's
       count kept the default size). */
  it("keeps a type role beside a text colour", () => {
    for (const role of ["text-badge", "text-caption", "text-body"]) {
      expect(cn(role, "text-destructive-foreground")).toBe(
        `${role} text-destructive-foreground`,
      );
    }
  });
});
