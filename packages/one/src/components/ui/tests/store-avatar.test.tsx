import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreAvatar } from "../store-avatar";
import {
  dealStoreOrbs,
  storeOrbFor,
  STORE_ORB_COUNT,
} from "../../../lib/store-orbs";

describe("store identity", () => {
  it("keeps every existing orb when a new store joins and avoids repeats within the set", () => {
    const ids: string[] = Array.from(
      { length: STORE_ORB_COUNT },
      (_value: unknown, i: number): string => `store-${i}`,
    );
    const before: Map<string, string> = dealStoreOrbs(ids);
    const after: Map<string, string> = dealStoreOrbs([...ids, "new-store"]);
    expect(new Set(before.values()).size).toBe(STORE_ORB_COUNT);
    for (const id of ids) expect(after.get(id)).toBe(before.get(id));
  });
  it("paints the seeded image immediately and keeps its identity on rerender", () => {
    const { rerender } = render(
      <StoreAvatar seed="store-a" data-testid="face" />,
    );
    const image = (): HTMLImageElement =>
      screen.getByTestId("face").querySelector("img")!;
    expect(image().getAttribute("src")).toBe(storeOrbFor("store-a"));
    const src: string = image().src;
    rerender(<StoreAvatar seed="store-a" size="xl" data-testid="face" />);
    expect(image().src).toBe(src);
    expect(image().alt).toBe("");
  });
});
