import { fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  restoreTriggerFocus,
  trackFocusModality,
} from "../../../lib/restore-trigger-focus";

/* The RING itself cannot be tested here: jsdom has no :focus-visible
   heuristic, which is why this behaviour was verified in Chromium against the
   shell's avatar menu. What is testable, and what actually decides the
   outcome, is the modality call: keyboard dismissals must be left to Radix
   (ring and focus restore intact), pointer dismissals must be taken over. */

function closeEvent(): Event & { defaultPrevented: boolean } {
  return new Event("closeAutoFocus", { cancelable: true }) as Event & {
    defaultPrevented: boolean;
  };
}

describe("restoreTriggerFocus modality", () => {
  beforeEach(() => {
    trackFocusModality();
  });

  it("leaves keyboard dismissals alone, so the ring survives Escape", () => {
    fireEvent.keyDown(document, { key: "Escape" });
    const event = closeEvent();
    restoreTriggerFocus(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("takes over pointer dismissals, so no ring follows a click away", () => {
    fireEvent.pointerDown(document.body);
    const event = closeEvent();
    restoreTriggerFocus(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not fight a caller that already handled the event", () => {
    fireEvent.pointerDown(document.body);
    const event = closeEvent();
    event.preventDefault();
    const spy = vi.spyOn(event, "preventDefault");
    restoreTriggerFocus(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it("re-classifies when the user switches input device", () => {
    fireEvent.pointerDown(document.body);
    const pointer = closeEvent();
    restoreTriggerFocus(pointer);
    expect(pointer.defaultPrevented).toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    const keyboard = closeEvent();
    restoreTriggerFocus(keyboard);
    expect(keyboard.defaultPrevented).toBe(false);
  });
});
