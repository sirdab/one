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
  ImageUploader,
  type ImageUploaderLabels,
  type UploaderImage,
  type UploadOutcome,
} from "../image-uploader";

const labels: ImageUploaderLabels = {
  dropTitle: "Drop photos here",
  dropHint: "JPEG or PNG, up to 1 MB",
  choose: "Choose photos",
  dropActive: "Drop to add photos",
  add: "Add",
  cover: "Cover",
  remove: "Remove",
  retry: "Retry",
  uploading: "Uploading",
  moveEarlier: "Move earlier",
  moveLater: "Move later",
  rejectedType: "That file is not a photo",
  rejectedSize: "That photo is too large",
  rejectedCount: "That is too many photos",
  altLabel: "Caption",
};

const ACCEPT = { "image/jpeg": [], "image/png": [] };

let created: string[] = [];
let revoked: string[] = [];

beforeEach(() => {
  created = [];
  revoked = [];
  let n = 0;
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: () => {
      const url = `blob:preview-${++n}`;
      created.push(url);
      return url;
    },
    revokeObjectURL: (url: string) => revoked.push(url),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* Controlled like the real form: the harness owns the list. */
function Harness({
  upload,
  initial = [],
  maxFiles,
  onValue,
}: {
  upload: (file: File) => Promise<UploadOutcome>;
  initial?: UploaderImage[];
  maxFiles?: number;
  onValue?: (value: UploaderImage[]) => void;
}): React.JSX.Element {
  const [value, setValue] = React.useState<UploaderImage[]>(initial);
  return (
    <ImageUploader
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
      upload={upload}
      accept={ACCEPT}
      maxBytes={1024 * 1024}
      maxFiles={maxFiles}
      labels={labels}
    />
  );
}

function photo(name: string, bytes = 10, type = "image/jpeg"): File {
  return new File(["x".repeat(bytes)], name, { type });
}

async function choose(files: File[]): Promise<void> {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  await act(async () => {
    fireEvent.change(input, { target: { files } });
  });
}

const two: UploaderImage[] = [
  { key: "a", url: "https://x/a.jpg" },
  { key: "b", url: "https://x/b.jpg" },
];

describe("ImageUploader", () => {
  it("uploads what was chosen, in the order it was picked", async () => {
    const upload = vi.fn(async (file: File): Promise<UploadOutcome> => ({
      url: `https://x/${file.name}`,
    }));
    const onValue = vi.fn();
    render(<Harness upload={upload} onValue={onValue} />);
    expect(screen.getByText(labels.dropTitle)).toBeTruthy();
    await choose([photo("1.jpg"), photo("2.jpg")]);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(onValue).toHaveBeenLastCalledWith([
        { key: "https://x/1.jpg", url: "https://x/1.jpg" },
        { key: "https://x/2.jpg", url: "https://x/2.jpg" },
      ]),
    );
    expect(upload.mock.calls.map(([f]) => f.name)).toEqual(["1.jpg", "2.jpg"]);
    // The first image is the cover.
    expect(screen.getByText(labels.cover)).toBeTruthy();
  });

  /* Once there are photos the grid is the drop target too, not only the
       add tile: a second drop anywhere on the uploader adds to the set. */
  it("takes a drop anywhere on a filled uploader", async () => {
    const upload = vi.fn(async (file: File): Promise<UploadOutcome> => ({
      url: `https://x/${file.name}`,
    }));
    const onValue = vi.fn();
    const { container } = render(
      <Harness upload={upload} initial={two} onValue={onValue} />,
    );
    const root = container.querySelector(
      '[data-slot="image-uploader"]',
    ) as HTMLElement;
    const files = [photo("3.jpg")];
    const dataTransfer = {
      files,
      items: files.map((file) => ({
        kind: "file",
        type: file.type,
        getAsFile: () => file,
      })),
      types: ["Files"],
    };
    await act(async () => {
      fireEvent.dragEnter(root, { dataTransfer });
    });
    expect(await screen.findByText(labels.dropActive)).toBeTruthy();
    await act(async () => {
      fireEvent.drop(root, { dataTransfer });
    });
    await waitFor(() =>
      expect(onValue).toHaveBeenLastCalledWith([
        ...two,
        { key: "https://x/3.jpg", url: "https://x/3.jpg" },
      ]),
    );
  });

  it("refuses a file that is not a photo, and one that is too large", async () => {
    const upload = vi.fn();
    render(<Harness upload={upload} />);
    await choose([photo("notes.pdf", 10, "application/pdf")]);
    expect(await screen.findByText(labels.rejectedType)).toBeTruthy();
    await choose([photo("huge.jpg", 2 * 1024 * 1024)]);
    expect(await screen.findByText(labels.rejectedSize)).toBeTruthy();
    expect(upload).not.toHaveBeenCalled();
  });

  it("shows why an upload failed and retries it", async () => {
    const upload = vi
      .fn<(file: File) => Promise<UploadOutcome>>()
      .mockResolvedValueOnce({ error: "The upload failed" })
      .mockResolvedValueOnce({ url: "https://x/ok.jpg" });
    const onValue = vi.fn();
    render(<Harness upload={upload} onValue={onValue} />);
    await choose([photo("ok.jpg")]);
    expect(await screen.findByText("The upload failed")).toBeTruthy();
    expect(onValue).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: labels.retry }));
    await waitFor(() =>
      expect(onValue).toHaveBeenLastCalledWith([
        { key: "https://x/ok.jpg", url: "https://x/ok.jpg" },
      ]),
    );
  });

  it("removes a photo", () => {
    const onValue = vi.fn();
    render(<Harness upload={vi.fn()} initial={two} onValue={onValue} />);
    fireEvent.click(screen.getAllByRole("button", { name: labels.remove })[0]!);
    expect(onValue).toHaveBeenLastCalledWith([two[1]]);
  });

  /* The keyboard path: moving the second photo earlier makes it the cover. */
  it("reorders with the move buttons, which changes the cover", () => {
    const onValue = vi.fn();
    render(<Harness upload={vi.fn()} initial={two} onValue={onValue} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: labels.moveEarlier })[1]!,
    );
    expect(onValue).toHaveBeenLastCalledWith([two[1], two[0]]);
  });

  it("edits a photo's caption", () => {
    const onValue = vi.fn();
    render(<Harness upload={vi.fn()} initial={two} onValue={onValue} />);
    fireEvent.change(
      screen.getAllByRole("textbox", { name: labels.altLabel })[1]!,
      { target: { value: "Close-up" } },
    );
    expect(onValue).toHaveBeenLastCalledWith([
      two[0],
      { ...two[1], alt: "Close-up" },
    ]);
  });

  it("stops at the limit and says so", async () => {
    const upload = vi.fn(async (file: File): Promise<UploadOutcome> => ({
      url: `https://x/${file.name}`,
    }));
    render(<Harness upload={upload} maxFiles={1} />);
    await choose([photo("1.jpg"), photo("2.jpg")]);
    expect(await screen.findByText(labels.rejectedCount!)).toBeTruthy();
  });

  it("revokes every preview it made", async () => {
    const upload = vi.fn(async (): Promise<UploadOutcome> => ({
      error: "nope",
    }));
    const { unmount } = render(<Harness upload={upload} />);
    await choose([photo("1.jpg")]);
    await screen.findByText("nope");
    expect(created).toHaveLength(1);
    unmount();
    expect(revoked).toEqual(created);
  });
});

describe("abandoned upload queues", () => {
  it("does not publish a late result or start another upload after unmount", async () => {
    let finish: ((outcome: UploadOutcome) => void) | undefined;
    const upload = vi.fn(
      (): Promise<UploadOutcome> =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const onValue = vi.fn();
    const { unmount } = render(<Harness upload={upload} onValue={onValue} />);
    await choose([photo("1.jpg"), photo("2.jpg")]);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    unmount();
    if (finish === undefined) throw new Error("Upload did not start");
    const finishUpload: (outcome: UploadOutcome) => void = finish;
    await act(async () => {
      finishUpload({ id: "first", url: "https://cdn/first.jpg" });
    });
    expect(onValue).not.toHaveBeenCalled();
    expect(upload).toHaveBeenCalledTimes(1);
    expect(revoked).toEqual(created);
  });
});
