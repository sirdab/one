import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AssistantAuroraIcon } from "../shell";

const MARK_ROLE = /^var\(--aurora-mark-[\w-]+\)$/;

const stopColor = (stop: Element): string =>
  /stop-color:\s*([^;]+)/.exec(stop.getAttribute("style") ?? "")?.[1]?.trim() ??
  "";

const roleOf = (stop: Element): string =>
  /^var\(--aurora-mark-([\w-]+)\)$/.exec(stopColor(stop))?.[1] ?? "";

const fillOf = (container: HTMLElement): string =>
  /^url\(#(.+)\)$/.exec(
    container.querySelector("path")?.getAttribute("fill") ?? "",
  )?.[1] ?? "";

describe("AssistantAuroraIcon", () => {
  it("ramps from warm through cool into the fold, every stop a mark role", () => {
    const { container } = render(<AssistantAuroraIcon />);
    const stops = [...container.querySelectorAll("stop")];
    expect(stops.map(stopColor).filter((c) => !MARK_ROLE.test(c))).toEqual([]);
    expect(
      stops.map((stop) => [Number(stop.getAttribute("offset")), roleOf(stop)]),
    ).toEqual([
      [0.1, "warm"],
      [0.4, "cool"],
      [0.7, "fold"],
    ]);
  });

  it("fills the mark from its ramp until a texture is handed in", () => {
    const { container } = render(<AssistantAuroraIcon />);
    expect(fillOf(container)).toBe(
      container.querySelector("linearGradient")?.id,
    );
    expect(container.querySelector("pattern")).toBeNull();
  });

  it("fills the mark from the texture once there is one", () => {
    const { container } = render(
      <AssistantAuroraIcon texture="data:image/png;base64,AAAA" />,
    );
    const pattern = container.querySelector("pattern");
    expect(fillOf(container)).toBe(pattern?.id);
    expect(pattern?.querySelector("image")?.getAttribute("href")).toBe(
      "data:image/png;base64,AAAA",
    );
  });

  it("gives two copies on one page distinct paint ids", () => {
    const { container } = render(
      <>
        <AssistantAuroraIcon texture="data:image/png;base64,AAAA" />
        <AssistantAuroraIcon texture="data:image/png;base64,AAAA" />
      </>,
    );
    const ids = [...container.querySelectorAll("linearGradient, pattern")].map(
      (paint) => paint.id,
    );
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });
});
