import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* Reference image imported with the Uqail snapshot: 390 CSS pixels at 2x.
   This checks the asset, not current browser rendering. */
const FIXTURE = join(__dirname, "mood-board-390.png");
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const BOARD_FIXTURE_WIDTH = 390;
const BOARD_FIXTURE_SCALE = 2;

describe("the 390px board fixture", () => {
  it("is checked in as a PNG of the board at the phone width", () => {
    const bytes = readFileSync(FIXTURE);
    expect(bytes.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    // IHDR is always the first chunk: 8 signature bytes, 4 of length,
    // 4 of type, then the width as a big-endian 32-bit integer.
    expect(bytes.readUInt32BE(16)).toBe(
      BOARD_FIXTURE_WIDTH * BOARD_FIXTURE_SCALE,
    );
  });
});
