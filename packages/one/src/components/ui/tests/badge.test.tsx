import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Badge,
  LegacyBadge,
  STATUS_TONES,
  StatusNote,
  type StatusTone,
} from "../badge";

const WASH: Record<StatusTone, string[]> = {
  neutral: ["bg-muted", "text-foreground"],
  attention: ["bg-attention-subtle", "text-attention"],
  warning: ["bg-warning-subtle", "text-warning"],
  critical: ["bg-destructive-subtle", "text-destructive"],
  success: ["bg-success-subtle", "text-success"],
};

const chip = (container: HTMLElement): Element => {
  const node = container.firstElementChild;
  if (!node) throw new Error("nothing rendered");
  return node;
};

describe("STATUS_TONES", () => {
  it("is the five tones, neutral first", () => {
    expect([...STATUS_TONES]).toEqual([
      "neutral",
      "attention",
      "warning",
      "critical",
      "success",
    ]);
  });
});

describe("Badge as a status", () => {
  it.each(STATUS_TONES)(
    "%s renders data-tone, exactly one dot and the word",
    (tone) => {
      const { container } = render(<Badge tone={tone}>Draft</Badge>);
      const node = chip(container);
      expect(node.getAttribute("data-slot")).toBe("badge");
      expect(node.getAttribute("data-tone")).toBe(tone);
      expect(node.getAttribute("data-variant")).toBeNull();
      const dots = node.querySelectorAll('[data-slot="badge-dot"]');
      expect(dots).toHaveLength(1);
      expect(dots[0]?.getAttribute("aria-hidden")).toBe("true");
      expect(node.textContent).toBe("Draft");
    },
  );

  it.each(STATUS_TONES)("%s wears its wash and its own text step", (tone) => {
    const { container } = render(<Badge tone={tone}>x</Badge>);
    const cls = chip(container).className;
    for (const token of WASH[tone]) expect(cls).toContain(token);
  });

  it("puts the dot before the word, at the start of the reading direction", () => {
    const { container } = render(<Badge tone="attention">Draft</Badge>);
    expect(chip(container).firstElementChild?.getAttribute("data-slot")).toBe(
      "badge-dot",
    );
  });

  it("draws the dot in CSS, 6px, and never as an icon", () => {
    const { container } = render(<Badge tone="success">Live</Badge>);
    const dot = chip(container).querySelector('[data-slot="badge-dot"]');
    expect(dot?.tagName).toBe("SPAN");
    expect(dot?.querySelector("svg")).toBeNull();
    expect(dot?.className).toContain("size-1.5");
    expect(dot?.className).toContain("rounded-full");
  });

  it("lets the neutral dot fade to --subtle while the word stays foreground", () => {
    const { container } = render(<Badge tone="neutral">Done</Badge>);
    const node = chip(container);
    expect(node.querySelector('[data-slot="badge-dot"]')?.className).toContain(
      "bg-subtle",
    );
    expect(node.className).toContain("text-foreground");
  });

  it("takes the dot from the text colour on every other tone", () => {
    for (const tone of STATUS_TONES.filter((t) => t !== "neutral")) {
      const { container } = render(<Badge tone={tone}>x</Badge>);
      expect(
        chip(container).querySelector('[data-slot="badge-dot"]')?.className,
      ).toContain("bg-current");
    }
  });

  it("is not interactive and never ink", () => {
    const { container } = render(<Badge tone="critical">Failed</Badge>);
    const cls = chip(container).className;
    expect(cls).not.toContain("hover:");
    expect(cls).not.toContain("bg-primary");
  });
});

describe("Badge as a tag", () => {
  it.each(["secondary", "outline", "ghost"] as const)(
    "%s renders no dot and no data-tone",
    (variant) => {
      const { container } = render(<Badge variant={variant}>Digital</Badge>);
      const node = chip(container);
      expect(node.getAttribute("data-variant")).toBe(variant);
      expect(node.getAttribute("data-tone")).toBeNull();
      expect(node.querySelector('[data-slot="badge-dot"]')).toBeNull();
    },
  );

  it("defaults to the quiet secondary tag, not ink", () => {
    const { container } = render(<Badge>3</Badge>);
    const node = chip(container);
    expect(node.getAttribute("data-variant")).toBe("secondary");
    expect(node.className).toContain("bg-muted");
    expect(node.className).not.toContain("bg-primary");
  });

  it("draws an outline tag as a hairline, never a fill", () => {
    const { container } = render(<Badge variant="outline">Digital</Badge>);
    const cls = chip(container).className;
    expect(cls).toContain("border-border");
    expect(cls).not.toContain("bg-primary");
    expect(cls).not.toContain("bg-muted");
  });

  it("still renders as its child when asChild", () => {
    const { container } = render(
      <Badge asChild variant="secondary">
        <a href="/orders">3</a>
      </Badge>,
    );
    expect(chip(container).tagName).toBe("A");
  });
});

describe("StatusNote", () => {
  it("is the tone's wash as a centred sentence with no dot", () => {
    const { container } = render(
      <StatusNote tone="attention">Draft: only you can see it</StatusNote>,
    );
    const node = chip(container);
    expect(node.getAttribute("data-slot")).toBe("status-note");
    expect(node.getAttribute("data-tone")).toBe("attention");
    expect(node.querySelector('[data-slot="badge-dot"]')).toBeNull();
    for (const token of WASH.attention) {
      expect(node.className).toContain(token);
    }
    expect(node.className).toContain("text-center");
    expect(node.className).toContain("whitespace-normal");
  });

  it("wraps instead of clipping: a minimum height, never a fixed one", () => {
    const { container } = render(<StatusNote tone="warning">x</StatusNote>);
    const cls = chip(container).className;
    expect(cls).toContain("min-h-7");
    expect(cls).not.toMatch(/(^|\s)h-\d/);
  });
});

describe("LegacyBadge (the console's old variant names)", () => {
  it("maps success, warning and destructive onto the matching tone", () => {
    const pairs = [
      ["success", "success"],
      ["warning", "warning"],
      ["destructive", "critical"],
    ] as const;
    for (const [variant, tone] of pairs) {
      const { container } = render(
        <LegacyBadge variant={variant}>x</LegacyBadge>,
      );
      const node = chip(container);
      expect(node.getAttribute("data-tone")).toBe(tone);
      expect(node.querySelectorAll('[data-slot="badge-dot"]')).toHaveLength(1);
      for (const token of WASH[tone]) {
        expect(node.className).toContain(token);
      }
    }
  });

  it("keeps default as the ink fill the console already shows", () => {
    const { container } = render(
      <LegacyBadge variant="default">x</LegacyBadge>,
    );
    const node = chip(container);
    expect(node.className).toContain("bg-primary");
    expect(node.getAttribute("data-tone")).toBeNull();
  });

  it("passes the tag variants straight through", () => {
    const { container } = render(
      <LegacyBadge variant="outline">x</LegacyBadge>,
    );
    expect(chip(container).getAttribute("data-variant")).toBe("outline");
  });
});

describe("the type guard", () => {
  it("refuses a status variant on Badge and a tone with a variant", () => {
    // @ts-expect-error a status look is a tone, not a variant
    const status = <Badge variant="success" />;
    // @ts-expect-error the ink fill is gone
    const ink = <Badge variant="default" />;
    // @ts-expect-error a chip is a tone or a tag, never both
    const both = <Badge tone="success" variant="outline" />;
    // @ts-expect-error `link` is dropped: a badge is never a link style
    const link = <Badge variant="link" />;
    expect([status, ink, both, link]).toHaveLength(4);
  });
});
