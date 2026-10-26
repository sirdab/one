"use client";

import * as React from "react";

import {
  ImageUploader,
  type UploaderImage,
  type UploadOutcome,
} from "@sirdab/one/components/image-uploader";

/* A stand-in upload: the local preview becomes the "stored" url after a
   beat, and every third file fails so Retry can be tried. */
let count = 0;
async function fakeUpload(file: File): Promise<UploadOutcome> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  count += 1;
  if (count % 3 === 0) return { error: "The upload failed. Try again." };
  return { url: URL.createObjectURL(file) };
}

export function ImageUploaderDemo({
  captions = false,
}: {
  captions?: boolean;
}): React.JSX.Element {
  const [value, setValue] = React.useState<UploaderImage[]>([]);
  return (
    <div className="w-full max-w-xl">
      <ImageUploader
        value={value}
        onChange={setValue}
        upload={fakeUpload}
        accept={{ "image/jpeg": [], "image/png": [], "image/webp": [] }}
        maxBytes={10 * 1024 * 1024}
        maxFiles={8}
        labels={{
          dropTitle: "Drop photos here, or click to choose",
          dropHint: "JPEG, PNG or WebP, up to 10 MB",
          choose: "Choose photos",
          dropActive: "Drop to add photos",
          add: "Add",
          cover: "Cover",
          remove: "Remove",
          retry: "Retry",
          uploading: "Uploading",
          moveEarlier: "Move earlier",
          moveLater: "Move later",
          rejectedType: "That file is not a photo.",
          rejectedSize: "That photo is over 10 MB.",
          rejectedCount: "Up to 8 photos.",
          ...(captions
            ? { altLabel: "Caption", altPlaceholder: "Optional" }
            : {}),
        }}
      />
    </div>
  );
}
