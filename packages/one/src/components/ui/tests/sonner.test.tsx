import { act, cleanup, render, waitFor } from "@testing-library/react";
import { Direction } from "radix-ui";
import { toast } from "sonner";
import { afterEach, describe, expect, it } from "vitest";

import { Toaster } from "../sonner";

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  cleanup();
});

async function toasterIn(
  dir: "ltr" | "rtl",
  position?: React.ComponentProps<typeof Toaster>["position"],
): Promise<HTMLElement> {
  render(
    <Direction.Provider dir={dir}>
      <Toaster position={position} />
    </Direction.Provider>,
  );
  act(() => {
    toast("Saved");
  });

  return waitFor(() => {
    const toaster = document.querySelector<HTMLElement>(
      "[data-sonner-toaster]",
    );
    if (toaster === null) throw new Error("no toaster yet");
    return toaster;
  });
}

describe("Toaster", () => {
  it("stacks at the bottom right in a left-to-right page", async () => {
    const toaster = await toasterIn("ltr");
    expect(toaster.getAttribute("data-y-position")).toBe("bottom");
    expect(toaster.classList.contains("light")).toBe(true);
    expect(toaster.getAttribute("data-x-position")).toBe("right");
  });

  it("stacks at the bottom left in Arabic", async () => {
    const toaster = await toasterIn("rtl");
    expect(toaster.getAttribute("data-y-position")).toBe("bottom");
    expect(toaster.getAttribute("data-x-position")).toBe("left");
  });

  it("keeps a position the caller asked for", async () => {
    const toaster = await toasterIn("rtl", "bottom-center");
    expect(toaster.getAttribute("data-x-position")).toBe("center");
  });
});
