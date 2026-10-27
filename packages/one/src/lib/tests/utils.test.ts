import { describe, expect, it } from "vitest";

import { cn } from "../utils";

describe("cn", () => {
  it("keeps a type role beside a text colour", () => {
    for (const role of ["text-badge", "text-caption", "text-body"]) {
      expect(cn(role, "text-destructive-foreground")).toBe(
        `${role} text-destructive-foreground`,
      );
    }
  });
});
