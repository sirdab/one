import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHeldWhileClosing } from "../held-while-closing";

describe("useHeldWhileClosing", () => {
  it("keeps the last open value through the close, then follows again on reopen", () => {
    const { result, rerender } = renderHook(
      ({ open, value }: { open: boolean; value: string }) =>
        useHeldWhileClosing(open, value),
      { initialProps: { open: true, value: "step 1" } },
    );
    rerender({ open: true, value: "step 2" });

    rerender({ open: false, value: "step 1" });
    expect(result.current).toBe("step 2");

    rerender({ open: true, value: "step 1" });
    expect(result.current).toBe("step 1");
  });
});
