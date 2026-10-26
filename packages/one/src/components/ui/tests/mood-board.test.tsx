import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { contrastRatio } from "@sirdab/one/foundation";

import {
  MOOD_BOARD_DEFAULT_PALETTE,
  MoodBoard,
  moodBoardFontsHref,
  MoodBoardThumb,
  paintedPalette,
  type MoodBoardModel,
} from "../mood-board";

const LABELS = {
  board: "ملامح متجرك",
  tempName: "اسم مؤقت",
  roles: {
    ground: "الخلفية",
    ink: "النص",
    accent: "اللون المميز",
    secondary: "لون مساند",
  },
  typeRoles: { display: "خط الهوية", body: "خط الواجهة" },
  typeUse: {
    display: "للعناوين الكبيرة وأقسام المنتجات",
    body: "للأزرار والنصوص والقوائم",
  },
  displaySample: "تشكيلة الموسم",
  bodySample: "بهذا الخط يقرا عملاؤك تفاصيل كل منتج.",
  interfaceSample: {
    button: "أضف للسلة",
    nav: ["الرئيسية", "المتجر", "تواصل معنا"] as [string, string, string],
  },
  sections: {
    colors: "الألوان",
    type: "الخطوط",
    radius: "الزوايا",
    spacing: "المسافات",
  },
  radiusFull: "دائري",
};

function model(overrides: Partial<MoodBoardModel> = {}): MoodBoardModel {
  return {
    name: "نخلة",
    nameTemporary: true,
    nameAlternatives: ["بيت التمر", "مزرعة سدير"],
    summary: "متجر تمور من القصيم، سكري وعجوة بعبوات كيلو.",
    category: "تمور فاخرة",
    palette: {
      ground: "#f6efe4",
      ink: "#2b1d12",
      accent: "#8a4b1f",
      secondary: ["#c9862b", "#3b2418"],
    },
    typography: { display: "Aref Ruqaa", body: "Readex Pro" },
    mood: "عصرية نخل في القصيم، وريحة قهوة",
    heroImageUrl: "https://images.pexels.com/photos/1/hero.jpeg",
    products: [
      {
        key: "sukkari",
        title: "تمر سكري",
        priceMinor: 14900,
        panelColor: "#c9862b",
        panelShape: "box",
        imageUrl: "https://images.pexels.com/photos/2/a.jpeg",
      },
      {
        key: "ajwa",
        title: "تمر عجوة",
        priceMinor: null,
        panelColor: "#3b2418",
        panelShape: "jar",
        imageUrl: null,
      },
    ],
    source: null,
    locale: "ar",
    currency: "SAR",
    ...overrides,
  };
}

/* Nothing the board draws has landed yet: the first frame a stream sends. */
const NAME_ONLY: Partial<MoodBoardModel> = {
  nameAlternatives: [],
  summary: null,
  category: null,
  palette: null,
  typography: null,
  mood: null,
  heroImageUrl: null,
  products: [],
};

function board(container: HTMLElement): HTMLElement {
  const node = container.querySelector('[data-testid="mood-board"]');
  if (!(node instanceof HTMLElement)) throw new Error("no board rendered");
  return node;
}

function slot(container: HTMLElement, name: string): HTMLElement | null {
  const node = container.querySelector(`[data-slot="${name}"]`);
  return node instanceof HTMLElement ? node : null;
}

function fontLinks(): HTMLLinkElement[] {
  return [
    ...document.head.querySelectorAll<HTMLLinkElement>(
      'link[data-slot="mood-board-font"]',
    ),
  ];
}

afterEach(() => {
  cleanup();
});

describe("MoodBoard", () => {
  it("is one scrollable region named by the caller, in the store's direction", () => {
    const { container, rerender } = render(
      <MoodBoard model={model()} labels={LABELS} />,
    );
    const root = board(container);
    expect(screen.getByRole("region", { name: "ملامح متجرك" })).toBe(root);
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(root.getAttribute("tabindex")).toBe("0");
    expect(root.className).toContain("overflow-y-auto");

    rerender(<MoodBoard model={model({ locale: "en" })} labels={LABELS} />);
    expect(board(container).getAttribute("dir")).toBe("ltr");
  });

  /* A brand board, generic on purpose: her system, not her store. */
  it("draws her colours, her two fonts, the radii and the spacing, and nothing of the store itself", () => {
    const { container } = render(<MoodBoard model={model()} labels={LABELS} />);
    const titles = [...container.querySelectorAll("h3")].map(
      (title) => title.textContent,
    );
    expect(titles).toEqual(["الألوان", "الخطوط", "الزوايا", "المسافات"]);
    const text = board(container).textContent ?? "";
    expect(text).not.toContain("نخلة");
    expect(text).not.toContain("عصرية نخل");
    expect(text).not.toContain("تمر سكري");
    expect(container.querySelector("img")).toBeNull();
  });

  it("holds a pulsing place for her colours and fonts while they are on their way", () => {
    const { container, rerender } = render(
      <MoodBoard model={model(NAME_ONLY)} labels={LABELS} drawing />,
    );
    expect(board(container).getAttribute("aria-busy")).toBe("true");
    for (const piece of ["palette", "type"]) {
      const placeholder = slot(container, `mood-board-placeholder-${piece}`);
      expect(placeholder, piece).not.toBeNull();
      expect(placeholder?.getAttribute("aria-hidden")).toBe("true");
      expect(placeholder?.className).toContain("animate-pulse");
    }

    rerender(<MoodBoard model={model()} labels={LABELS} drawing />);
    expect(
      container.querySelectorAll('[data-slot^="mood-board-placeholder"]'),
    ).toHaveLength(0);
    expect(slot(container, "mood-board-palette")).not.toBeNull();
    expect(slot(container, "mood-board-type")).not.toBeNull();
  });

  it("leaves her colours and fonts off the board when they never came, and keeps the generic system", () => {
    const { container } = render(
      <MoodBoard model={model(NAME_ONLY)} labels={LABELS} />,
    );
    expect(board(container).getAttribute("aria-busy")).toBeNull();
    expect(
      container.querySelectorAll('[data-slot^="mood-board-placeholder"]'),
    ).toHaveLength(0);
    expect(slot(container, "mood-board-palette")).toBeNull();
    expect(slot(container, "mood-board-type")).toBeNull();
    expect(slot(container, "mood-board-radius")).not.toBeNull();
    expect(slot(container, "mood-board-spacing")).not.toBeNull();
  });

  it("draws a swatch per colour, each with its role and its hex isolated", () => {
    const { container } = render(<MoodBoard model={model()} labels={LABELS} />);
    const swatches = [
      ...container.querySelectorAll<HTMLElement>(
        '[data-slot="mood-board-swatch"]',
      ),
    ];
    expect(swatches.map((swatch) => swatch.dataset.role)).toEqual([
      "ground",
      "ink",
      "accent",
      "secondary",
      "secondary",
    ]);
    expect(swatches.map((swatch) => swatch.textContent)).toEqual([
      "الخلفية#F6EFE4",
      "النص#2B1D12",
      "اللون المميز#8A4B1F",
      "لون مساند#C9862B",
      "لون مساند#3B2418",
    ]);
    const hex = swatches[0]?.querySelector('[data-slot="mood-board-hex"]');
    expect(hex?.tagName).toBe("BDI");
    expect(hex?.className).toContain("latin");
  });

  it("paints the ink the store will paint, pushed until it reads", () => {
    const { container } = render(
      <MoodBoard
        model={model({
          palette: {
            ground: "#ffffff",
            ink: "#f5f5f5",
            accent: "#dddddd",
            secondary: [],
          },
        })}
        labels={LABELS}
      />,
    );
    const style = board(container).style;
    expect(style.getPropertyValue("--mb-ground")).toBe("#ffffff");
    const ink = style.getPropertyValue("--mb-ink");
    expect(ink).not.toBe("#f5f5f5");
    expect(contrastRatio(ink, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    const accent = style.getPropertyValue("--mb-accent");
    expect(contrastRatio(accent, "#ffffff")).toBeGreaterThanOrEqual(3);
    expect(
      container.querySelectorAll('[data-slot="mood-board-swatch"]'),
    ).toHaveLength(3);
    expect(paintedPalette(null)).toEqual(MOOD_BOARD_DEFAULT_PALETTE);
  });

  it("sets titles in the brand font and buttons, the nav and body text in the interface font, saying what each is for", () => {
    const { container } = render(<MoodBoard model={model()} labels={LABELS} />);
    const specimen = slot(container, "mood-board-specimen");
    expect(specimen?.textContent).toBe("أب Aa");
    expect(specimen?.style.fontFamily).toContain("Aref Ruqaa");
    // The house face behind hers, so nothing is invisible while it loads.
    expect(specimen?.style.fontFamily).toContain("var(--font-display)");
    const headline = slot(container, "mood-board-display-sample");
    expect(headline?.textContent).toBe("تشكيلة الموسم");
    expect(headline?.style.fontFamily).toContain("Aref Ruqaa");
    expect(slot(container, "mood-board-brand-font")?.textContent).toContain(
      LABELS.typeUse.display,
    );
    expect(slot(container, "mood-board-display-family")?.textContent).toBe(
      "خط الهوية Aref Ruqaa",
    );

    const ui = slot(container, "mood-board-interface-font");
    expect(ui?.style.fontFamily).toContain("Readex Pro");
    expect(ui?.style.fontFamily).toContain("var(--font-sans)");
    expect(slot(container, "mood-board-nav-sample")?.textContent).toBe(
      "الرئيسيةالمتجرتواصل معنا",
    );
    expect(slot(container, "mood-board-button-sample")?.textContent).toBe(
      "أضف للسلة",
    );
    expect(slot(container, "mood-board-body-sample")?.textContent).toBe(
      LABELS.bodySample,
    );
    expect(ui?.textContent).toContain(LABELS.typeUse.body);
    expect(
      slot(container, "mood-board-body-family")?.querySelector("bdi")
        ?.textContent,
    ).toBe("Readex Pro");
  });

  it("shows four corner radii, the last one round, and the spacing scale in Western digits", () => {
    const { container } = render(<MoodBoard model={model()} labels={LABELS} />);
    const radii = [
      ...(slot(container, "mood-board-radius")?.querySelectorAll("li") ?? []),
    ].map((item) => item.textContent);
    expect(radii).toEqual(["0", "8", "16", "دائري"]);
    const spacing = [
      ...(slot(container, "mood-board-spacing")?.querySelectorAll("li") ?? []),
    ].map((item) => item.textContent);
    expect(spacing).toEqual(["4", "8", "16", "24", "32", "48"]);
  });

  it("loads exactly her pair from Google Fonts while a board shows it, once however many boards do", () => {
    expect(
      moodBoardFontsHref({ display: "Aref Ruqaa", body: "Readex Pro" }),
    ).toBe(
      "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Readex+Pro:wght@400;700&display=swap",
    );
    expect(moodBoardFontsHref({ display: "Cairo", body: "Cairo" })).toBe(
      "https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap",
    );
    expect(moodBoardFontsHref(null)).toBeNull();

    const first = render(<MoodBoard model={model()} labels={LABELS} />);
    const second = render(<MoodBoardThumb model={model()} label="متجرك" />);
    expect(fontLinks()).toHaveLength(1);
    expect(fontLinks()[0]?.getAttribute("href")).toBe(
      moodBoardFontsHref(model().typography),
    );
    expect(fontLinks()[0]?.rel).toBe("stylesheet");

    first.unmount();
    expect(fontLinks()).toHaveLength(1);
    second.unmount();
    expect(fontLinks()).toHaveLength(0);
  });

  it("adds no stylesheet for a board with no typography", () => {
    render(<MoodBoard model={model({ typography: null })} labels={LABELS} />);
    expect(fontLinks()).toHaveLength(0);
  });
});

describe("MoodBoardThumb", () => {
  it("shows the photograph and her palette as a strip", () => {
    const { container } = render(
      <MoodBoardThumb model={model()} label="متجرك" />,
    );
    const thumb = screen.getByRole("img", { name: "متجرك" });
    expect(thumb.getAttribute("data-testid")).toBe("mood-board-thumb");
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://images.pexels.com/photos/1/hero.jpeg",
    );
    expect(thumb.lastElementChild?.children).toHaveLength(5);
  });

  it("falls back to her name's first letter with no photograph, and no strip with no palette", () => {
    const { container } = render(
      <MoodBoardThumb
        model={model({
          heroImageUrl: null,
          products: [],
          palette: null,
        })}
        label="متجرك"
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "متجرك" }).textContent).toBe("ن");
  });
});
