import * as React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ImageEditor,
  renderImageEdit,
  type ImageEditorEdit,
  type ImageEditorLabels,
} from "../image-editor";

vi.mock("react-easy-crop", () => ({
  default: function FakeCropper(props: {
    aspect?: number;
    cropShape?: string;
    zoom?: number;
    rotation?: number;
    transform?: string;
    initialCroppedAreaPixels?: unknown;
    onMediaLoaded?: (size: {
      width: number;
      height: number;
      naturalWidth: number;
      naturalHeight: number;
    }) => void;
    onCropComplete?: (area: unknown, pixels: unknown) => void;
  }): React.JSX.Element {
    const { onMediaLoaded, onCropComplete, aspect } = props;
    React.useEffect(() => {
      onMediaLoaded?.({
        width: 400,
        height: 300,
        naturalWidth: 800,
        naturalHeight: 600,
      });
    }, [onMediaLoaded]);
    React.useEffect(() => {
      onCropComplete?.(
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 10.4, y: 20.6, width: 500, height: 400 },
      );
    }, [onCropComplete, aspect]);
    return (
      <div
        data-testid="cropper"
        data-aspect={aspect == null ? "" : aspect.toFixed(4)}
        data-rotation={props.rotation}
        data-shape={props.cropShape}
        data-zoom={props.zoom}
        data-transform={props.transform}
        data-restore={JSON.stringify(props.initialCroppedAreaPixels ?? null)}
      />
    );
  },
}));

const labels: ImageEditorLabels = {
  transform: "Crop and turn",
  portrait: "Portrait",
  landscape: "Landscape",
  original: "Original",
  rotate: "Rotate",
  flipHorizontal: "Flip horizontally",
  flipVertical: "Flip vertically",
  size: "Size",
  sizeOriginal: "Full size",
  sizeEdge: (px) => `${px} px`,
  canvas: "Photo",
  apply: "Apply",
  cancel: "Cancel",
  failed: "That photo could not be edited",
  zoom: "Zoom",
};

let drawn: { calls: string[] };

beforeEach(() => {
  drawn = { calls: [] };

  vi.stubGlobal(
    "Image",
    class {
      naturalWidth = 800;
      naturalHeight = 600;
      crossOrigin = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
  const ctx = new Proxy(
    {},
    {
      get:
        (_t, key: string) =>
        (...args: unknown[]) =>
          drawn.calls.push(`${key}(${args.join(",")})`),
      set: () => true,
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    done: BlobCallback,
    type?: string,
  ) {
    done(new Blob(["x"], { type: type ?? "image/png" }));
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderEditor(
  props: Partial<React.ComponentProps<typeof ImageEditor>> = {},
): {
  onApply: ReturnType<typeof vi.fn>;
  onCancel: ReturnType<typeof vi.fn>;
} {
  const onApply = vi.fn();
  const onCancel = vi.fn();
  render(
    <ImageEditor
      src="https://cdn/original.jpg"
      labels={labels}
      onApply={onApply}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onApply, onCancel };
}

const cropper = (): HTMLElement => screen.getByTestId("cropper");

describe("ImageEditor", () => {
  it("crops to the chosen ratio, and 'Original' follows the photo, turned or not", () => {
    renderEditor();

    expect(cropper().dataset.aspect).toBe((4 / 3).toFixed(4));

    fireEvent.click(screen.getByRole("radio", { name: "2:3" }));
    expect(cropper().dataset.aspect).toBe((2 / 3).toFixed(4));

    fireEvent.click(screen.getByRole("radio", { name: "2:3" }));
    expect(cropper().dataset.aspect).toBe((2 / 3).toFixed(4));
    expect(
      screen.getByRole("radio", { name: "2:3" }).getAttribute("aria-checked"),
    ).toBe("true");

    fireEvent.click(screen.getAllByRole("radio", { name: "Original" })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Rotate" }));
    expect(cropper().dataset.aspect).toBe((3 / 4).toFixed(4));
  });

  it("turns a quarter at a time and mirrors in screen space", () => {
    renderEditor();
    const rotate = screen.getByRole("button", { name: "Rotate" });
    for (let i = 0; i < 3; i++) fireEvent.click(rotate);
    expect(cropper().dataset.rotation).toBe("270");
    fireEvent.click(rotate);
    expect(cropper().dataset.rotation).toBe("0");

    const flip = screen.getByRole("button", { name: "Flip horizontally" });
    fireEvent.click(flip);
    expect(flip.getAttribute("aria-pressed")).toBe("true");

    expect(cropper().dataset.transform).toMatch(
      /scale\(-1, 1\) rotate\(0deg\)/,
    );
  });

  it("hands back the settings and the rendered photo on Apply", async () => {
    const { onApply } = renderEditor();
    fireEvent.click(screen.getByRole("radio", { name: "16:9" }));
    fireEvent.click(screen.getByRole("button", { name: "Flip vertically" }));
    fireEvent.click(screen.getByRole("radio", { name: "1080 px" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
    const [edit, blob] = onApply.mock.calls[0] as [ImageEditorEdit, Blob];
    expect(edit).toEqual({
      aspect: "16:9",
      crop: { x: 10, y: 21, width: 500, height: 400 },
      rotation: 0,
      flipH: false,
      flipV: true,
      maxEdge: 1080,
    });
    expect(blob.type).toBe("image/webp");

    expect(drawn.calls).toContain("scale(1,1)");
  });

  it("scales the render down to the size cap, never up", async () => {
    const photo = { naturalWidth: 4000, naturalHeight: 3000 };
    const edit: ImageEditorEdit = {
      aspect: "original",
      crop: { x: 0, y: 0, width: 4000, height: 3000 },
      rotation: 0,
      flipH: false,
      flipV: false,
      maxEdge: 2048,
    };
    await renderImageEdit(photo as HTMLImageElement, edit);
    expect(drawn.calls).toContain("scale(0.512,0.512)");

    drawn.calls = [];
    await renderImageEdit(photo as HTMLImageElement, {
      ...edit,
      crop: { x: 0, y: 0, width: 900, height: 600 },
    });
    expect(drawn.calls).toContain("scale(1,1)");
  });

  it("falls back to JPEG where the browser cannot encode WebP", async () => {
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(function (
      done: BlobCallback,
      type?: string,
    ) {
      done(
        new Blob(["x"], {
          type: type === "image/jpeg" ? type : "image/png",
        }),
      );
    });
    const { onApply } = renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(onApply).toHaveBeenCalled());
    expect((onApply.mock.calls[0] as [unknown, Blob])[1].type).toBe(
      "image/jpeg",
    );
  });

  it("restores a stored edit: its ratio tab, turn, flips, size and crop", () => {
    renderEditor({
      initialEdit: {
        aspect: "7:5",
        crop: { x: 1, y: 2, width: 700, height: 500 },
        rotation: 90,
        flipH: true,
        flipV: false,
        maxEdge: 1600,
      },
    });
    expect(cropper().dataset.aspect).toBe((7 / 5).toFixed(4));
    expect(cropper().dataset.rotation).toBe("90");
    expect(JSON.parse(cropper().dataset.restore!)).toEqual({
      x: 1,
      y: 2,
      width: 700,
      height: 500,
    });
    expect(
      screen
        .getByRole("tab", { name: "Landscape" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("radio", { name: "1600 px" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("cancels on Esc and on Cancel, and never applies", () => {
    const { onApply, onCancel } = renderEditor();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onApply).not.toHaveBeenCalled();
  });

  it("says so when the photo cannot be read, and stays open", async () => {
    vi.stubGlobal(
      "Image",
      class {
        crossOrigin = "";
        onerror: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.());
        }
      },
    );
    const { onApply } = renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      labels.failed,
    );
    expect(onApply).not.toHaveBeenCalled();
  });
});

describe("ImageEditor shape=circle", () => {
  it("crops round at 1:1 and offers no ratios, flips or size", () => {
    renderEditor({ shape: "circle" });
    expect(cropper().dataset.shape).toBe("round");
    expect(cropper().dataset.aspect).toBe("1.0000");
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Flip horizontally" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Rotate" })).toBeTruthy();
  });

  it("zooms through the slider", () => {
    renderEditor({ shape: "circle" });
    const slider = screen.getByRole("slider", { name: "Zoom" });
    fireEvent.keyDown(slider, { key: "End" });
    expect(cropper().dataset.zoom).toBe("3");
  });

  it("renders square at 512, whatever the crop", async () => {
    const { onApply } = renderEditor({ shape: "circle" });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
    const [edit] = onApply.mock.calls[0] as [ImageEditorEdit, Blob];
    expect(edit.aspect).toBe("1:1");
    expect(edit.maxEdge).toBe(512);
    expect(edit.flipH || edit.flipV).toBe(false);

    expect(drawn.calls).toContain("scale(1,1)");
  });

  it("stacks at every width, while the rect editor goes side by side from lg", () => {
    const round = renderEditor({ shape: "circle" });
    const root = (): HTMLElement =>
      screen
        .getByTestId("cropper")
        .closest('[data-slot="image-editor-canvas"]')!.parentElement!;
    expect(root().className).not.toContain("lg:flex-row");
    expect(root().innerHTML).not.toContain("lg:w-80");
    document.body.innerHTML = "";
    round.onApply.mockReset();
    renderEditor();
    expect(root().className).toContain("lg:flex-row");
  });

  it("leaves the default shape's controls alone", () => {
    renderEditor();
    expect(screen.getAllByRole("radio").length).toBeGreaterThan(0);
    expect(screen.queryByRole("slider")).toBeNull();
  });
});

describe("pending image edits", () => {
  it.each(["button", "escape", "unmount"] as const)(
    "discards a pending render after %s",
    async (dismiss) => {
      let finish: BlobCallback | undefined;
      vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
        (done: BlobCallback): void => {
          finish = done;
        },
      );
      const onApply = vi.fn();
      const view = render(
        <ImageEditor
          src="https://cdn/original.jpg"
          labels={labels}
          onApply={onApply}
          onCancel={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Apply" }));
      await waitFor(() => expect(finish).toBeDefined());
      if (dismiss === "button")
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      else if (dismiss === "escape")
        fireEvent.keyDown(document, { key: "Escape" });
      else view.unmount();
      if (finish === undefined) throw new Error("Canvas render did not start");
      const finishRendering: BlobCallback = finish;
      await act(async () => {
        finishRendering(new Blob(["image"], { type: "image/webp" }));
      });
      expect(onApply).not.toHaveBeenCalled();
    },
  );
});
