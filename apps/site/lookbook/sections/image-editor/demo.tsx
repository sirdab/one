"use client";

import * as React from "react";

import {
  ImageEditor,
  type ImageEditorEdit,
} from "@sirdab/one/components/image-editor";
import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";

function paintSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const sky = ctx.createLinearGradient(0, 0, 0, 900);
  sky.addColorStop(0, "#f3d9b1");
  sky.addColorStop(1, "#c98b5a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1200, 900);
  ctx.fillStyle = "#6b3f2a";
  ctx.fillRect(760, 260, 220, 520);
  ctx.fillStyle = "#f8f1e7";
  ctx.beginPath();
  ctx.arc(300, 260, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3b2418";
  ctx.font = "bold 96px sans-serif";
  ctx.fillText("OUD", 120, 760);
  return canvas.toDataURL("image/png");
}

export function ImageEditorDemo(): React.JSX.Element {
  const [src, setSrc] = React.useState("");
  const [edit, setEdit] = React.useState<ImageEditorEdit | null>(null);
  const [result, setResult] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => setSrc(paintSample()), []);

  if (!src) return <div className="h-96" />;
  if (!open) {
    return (
      <button
        type="button"
        className="border-border overflow-hidden rounded-xl border"
        onClick={() => setOpen(true)}
      >
        <img src={result ?? src} alt="" className="max-h-80" />
      </button>
    );
  }
  return (
    <div className="flex h-160 w-full">
      <ImageEditor
        src={src}
        initialEdit={edit}
        onCancel={() => setOpen(false)}
        onApply={(next, blob) => {
          setEdit(next);
          setResult(URL.createObjectURL(blob));
          setOpen(false);
        }}
        labels={{
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
          canvas: "Photo. Drag to move it, scroll or pinch to zoom.",
          apply: "Apply",
          cancel: "Cancel",
          failed: "That photo could not be edited. Try again.",
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="demo-caption">Caption</Label>
          <Input id="demo-caption" placeholder="Optional" />
        </div>
      </ImageEditor>
    </div>
  );
}

export function ImageEditorCircleDemo(): React.JSX.Element {
  const [src, setSrc] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);

  React.useEffect(() => setSrc(paintSample()), []);

  if (!src) return <div className="h-96" />;
  if (result) {
    return (
      <button type="button" onClick={() => setResult(null)}>
        <img
          src={result}
          alt=""
          className="size-24 rounded-full object-cover"
        />
      </button>
    );
  }
  return (
    <div className="flex w-full max-w-md flex-col">
      <ImageEditor
        src={src}
        shape="circle"
        onCancel={() => undefined}
        onApply={(_edit, blob) => setResult(URL.createObjectURL(blob))}
        labels={{
          transform: "Move and zoom",
          portrait: "",
          landscape: "",
          original: "",
          rotate: "Rotate",
          flipHorizontal: "",
          flipVertical: "",
          size: "",
          sizeOriginal: "",
          sizeEdge: (px) => `${px} px`,
          canvas: "Photo. Drag to move it.",
          apply: "Apply",
          cancel: "Cancel",
          failed: "That photo could not be edited. Try again.",
          zoom: "Zoom",
        }}
      />
    </div>
  );
}
