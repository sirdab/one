"use client";

import * as React from "react";
import Cropper, {
  type Area,
  type MediaSize,
  type Point,
} from "react-easy-crop";

import { cn } from "../../lib/utils";
import { WarningIcon } from "../icons/catalogue";
import { Alert, AlertDescription } from "./alert";
import { Button } from "./button";
import { strokeGlyph } from "./glyphs";
import { Icon } from "./icon";
import { Slider } from "./slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Toggle } from "./toggle";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

/* The Sirdab photo editor: crop to a ratio, turn, mirror, cap the size, then
   hand back the settings and the rendered file. Built on react-easy-crop,
   which owns the drag, pinch and wheel zoom.

   - Controlled from the outside by two things: `src` is always the ORIGINAL
     (the upload as the merchant made it), and `initialEdit` the settings
     last applied to it. The editor replays them rather than editing an
     already edited file, so repeated edits never lose quality.
   - `onApply(edit, blob)` gets both halves: the settings to store and the
     file they produce (WebP where the browser can encode it, JPEG where it
     cannot). `onCancel` discards; Esc is the same as Cancel.
   - The canvas takes all the room it can and the photo sits in it large,
     on the quiet sunken ground, with the modal shadow and soft corners on
     the kept area; what falls outside the crop is ghosted, not hidden, so
     the merchant can see what they are cutting.
   - The side panel (under the canvas on a phone) takes the caller's own
     fields first through `children` (the product form's captions), then
     the crop and transform controls, then the size cap, then the actions.
   - Every word comes from `labels`: a primitive takes no copy of its own.

   The crop is kept in the original's pixels, measured on the image as the
   editor shows it: turned by `rotation`, then mirrored. That is the frame
   react-easy-crop reports in once the flips ride its media transform in
   screen space, and it is the frame `renderImageEdit` draws in. */

export const IMAGE_EDITOR_PORTRAIT = ["1:1", "2:3", "5:7", "9:16"] as const;
export const IMAGE_EDITOR_LANDSCAPE = ["3:2", "7:5", "16:9"] as const;
export const IMAGE_EDITOR_SIZES = [null, 1080, 1600, 2048] as const;

export type ImageEditorAspect =
  | "original"
  | (typeof IMAGE_EDITOR_PORTRAIT)[number]
  | (typeof IMAGE_EDITOR_LANDSCAPE)[number];

export type ImageEditorRotation = 0 | 90 | 180 | 270;

/** Structurally the stored ImageEdit, so the caller passes it straight through. */
export type ImageEditorEdit = {
  aspect: ImageEditorAspect;
  crop: { x: number; y: number; width: number; height: number };
  rotation: ImageEditorRotation;
  flipH: boolean;
  flipV: boolean;
  maxEdge: number | null;
};

export type ImageEditorLabels = {
  /** The crop and transform group's heading. */
  transform: string;
  portrait: string;
  landscape: string;
  /** The ratio chip that keeps the photo's own shape. */
  original: string;
  rotate: string;
  flipHorizontal: string;
  flipVertical: string;
  /** The size cap group's heading and its "no cap" choice. */
  size: string;
  sizeOriginal: string;
  /** One size choice, by its long edge in pixels. */
  sizeEdge: (px: number) => string;
  /** The canvas's accessible name: what it is and that it drags. */
  canvas: string;
  apply: string;
  cancel: string;
  /** Shown when the photo could not be read or rendered. */
  failed: string;
  /** The zoom slider's name; the round shape needs it. */
  zoom?: string;
};

/** `circle` is the profile picture: a round 1:1 crop with a zoom slider and
 *  a turn, rendered square at 512px (the circle is CSS). */
export type ImageEditorShape = "rect" | "circle";

const CIRCLE_EDGE = 512;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

export type ImageEditorProps = {
  /** The original photo, never a previous render. */
  src: string;
  initialEdit?: ImageEditorEdit | null;
  labels: ImageEditorLabels;
  onApply: (edit: ImageEditorEdit, blob: Blob) => void | Promise<void>;
  onCancel: () => void;
  /** The caller is still storing the last apply: hold the actions. */
  busy?: boolean;
  shape?: ImageEditorShape;
  /** The caller's own fields, shown first in the side panel. */
  children?: React.ReactNode;
  className?: string;
};

const RotateIcon = strokeGlyph("RotateIcon", [
  "M19.5165 14.6667C18.4182 17.7738 15.4549 20 11.9717 20C7.5534 20 3.97168 16.4183 3.97168 12C3.97168 7.58172 7.5534 4 11.9717 4C15.0676 4 17 5.5 19 8",
  "M19 4V8H15",
]);
const FlipHorizontalIcon = strokeGlyph("FlipHorizontalIcon", [
  "M5.25 16L9.25 12L5.25 8",
  "M18.75 16L14.75 12L18.75 8",
]);
const FlipVerticalIcon = strokeGlyph("FlipVerticalIcon", [
  "M8 18.75L12 14.75L16 18.75",
  "M8 5.25L12 9.25L16 5.25",
]);

const RATIOS: Record<Exclude<ImageEditorAspect, "original">, number> = {
  "1:1": 1,
  "2:3": 2 / 3,
  "5:7": 5 / 7,
  "9:16": 9 / 16,
  "3:2": 3 / 2,
  "7:5": 7 / 5,
  "16:9": 16 / 9,
};

function isLandscape(aspect: ImageEditorAspect): boolean {
  return (IMAGE_EDITOR_LANDSCAPE as readonly string[]).includes(aspect);
}

function turnsSideways(rotation: ImageEditorRotation): boolean {
  return rotation === 90 || rotation === 270;
}

/** The long-edge cap, never an upscale. */
function outputScale(crop: ImageEditorEdit["crop"], maxEdge: number | null) {
  const edge = Math.max(crop.width, crop.height);
  return maxEdge != null && edge > maxEdge ? maxEdge / edge : 1;
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/* Crossorigin so the canvas stays readable: the photos live on a storage
   host, and a tainted canvas refuses toBlob. */
export function loadEditorImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image failed to load"));
    image.src = src;
  });
}

/** Replays an edit on the original and encodes the result. */
export async function renderImageEdit(
  image: HTMLImageElement,
  edit: ImageEditorEdit,
): Promise<Blob> {
  const { naturalWidth: w, naturalHeight: h } = image;
  const sideways = turnsSideways(edit.rotation);
  const boxW = sideways ? h : w;
  const boxH = sideways ? w : h;
  const scale = outputScale(edit.crop, edit.maxEdge);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(edit.crop.width * scale));
  canvas.height = Math.max(1, Math.round(edit.crop.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d canvas");
  ctx.imageSmoothingQuality = "high";
  // Read bottom up: turn the photo about its centre, mirror it in the
  // frame the editor showed, seat it in its rotated box, cut the crop
  // out, then scale to the cap.
  ctx.scale(scale, scale);
  ctx.translate(-edit.crop.x, -edit.crop.y);
  ctx.translate(boxW / 2, boxH / 2);
  ctx.scale(edit.flipH ? -1 : 1, edit.flipV ? -1 : 1);
  ctx.rotate((edit.rotation * Math.PI) / 180);
  ctx.drawImage(image, -w / 2, -h / 2);

  const webp = await toBlob(canvas, "image/webp", 0.9);
  if (webp && webp.type === "image/webp") return webp;
  // No WebP encoder (older Safari hands back a PNG): JPEG has no alpha,
  // so a transparent photo gets a white ground rather than a black one.
  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const flatCtx = flat.getContext("2d");
  if (!flatCtx) throw new Error("no 2d canvas");
  flatCtx.fillStyle = "#ffffff";
  flatCtx.fillRect(0, 0, flat.width, flat.height);
  flatCtx.drawImage(canvas, 0, 0);
  const jpeg = await toBlob(flat, "image/jpeg", 0.9);
  if (!jpeg) throw new Error("the canvas could not be encoded");
  return jpeg;
}

function roundCrop(area: Area): ImageEditorEdit["crop"] {
  return {
    x: Math.round(area.x),
    y: Math.round(area.y),
    width: Math.round(area.width),
    height: Math.round(area.height),
  };
}

export function ImageEditor({
  src,
  initialEdit,
  labels,
  onApply,
  onCancel,
  busy = false,
  shape = "rect",
  children,
  className,
}: ImageEditorProps): React.JSX.Element {
  const round = shape === "circle";
  const [aspect, setAspect] = React.useState<ImageEditorAspect>(
    round ? "1:1" : (initialEdit?.aspect ?? "original"),
  );
  const [tab, setTab] = React.useState<"portrait" | "landscape">(
    initialEdit && isLandscape(initialEdit.aspect) ? "landscape" : "portrait",
  );
  const [rotation, setRotation] = React.useState<ImageEditorRotation>(
    initialEdit?.rotation ?? 0,
  );
  const [flipH, setFlipH] = React.useState(initialEdit?.flipH ?? false);
  const [flipV, setFlipV] = React.useState(initialEdit?.flipV ?? false);
  const [maxEdge, setMaxEdge] = React.useState<number | null>(
    round ? CIRCLE_EDGE : (initialEdit?.maxEdge ?? null),
  );
  const [position, setPosition] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [media, setMedia] = React.useState<MediaSize | null>(null);
  const [crop, setCrop] = React.useState<ImageEditorEdit["crop"] | null>(null);
  const [rendering, setRendering] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const working = busy || rendering;

  // The restore only means anything for the first layout of this photo;
  // a turn or a ratio change puts the stored rectangle out of frame.
  const [restore, setRestore] = React.useState<Area | undefined>(
    initialEdit?.crop,
  );

  const renderVersion = React.useRef(0);
  React.useEffect(
    () => () => {
      renderVersion.current += 1;
    },
    [],
  );

  function cancel(): void {
    renderVersion.current += 1;
    setRendering(false);
    onCancel();
  }

  const onCancelRef = React.useRef(cancel);
  React.useEffect(() => {
    onCancelRef.current = cancel;
  });
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      // A menu or popover inside the side slot closes itself first.
      if (event.key !== "Escape" || event.defaultPrevented) return;
      onCancelRef.current();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const ratio = React.useMemo((): number | undefined => {
    if (aspect !== "original") return RATIOS[aspect];
    if (!media) return undefined;
    const { naturalWidth: w, naturalHeight: h } = media;
    return turnsSideways(rotation) ? h / w : w / h;
  }, [aspect, media, rotation]);

  const onCropComplete = React.useCallback(
    (_area: Area, pixels: Area): void => setCrop(roundCrop(pixels)),
    [],
  );

  function reframe(): void {
    setRestore(undefined);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  }

  function chooseAspect(next: ImageEditorAspect): void {
    setAspect(next);
    reframe();
  }

  async function apply(): Promise<void> {
    if (!crop || working) return;
    const version: number = ++renderVersion.current;
    const edit: ImageEditorEdit = {
      aspect,
      crop,
      rotation,
      flipH: round ? false : flipH,
      flipV: round ? false : flipV,
      maxEdge: round ? CIRCLE_EDGE : maxEdge,
    };
    setRendering(true);
    setFailed(false);
    try {
      const blob = await renderImageEdit(await loadEditorImage(src), edit);
      // Encoding can finish after cancellation or after the host closes.
      if (version !== renderVersion.current) return;
      await onApply(edit, blob);
    } catch {
      if (version === renderVersion.current) setFailed(true);
    } finally {
      if (version === renderVersion.current) setRendering(false);
    }
  }

  const mirror = `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`;

  return (
    <div
      className={cn(
        /* Side by side from lg, the editor fills its frame and
                   only the controls column scrolls. Stacked below lg it is
                   its natural height, so the frame around it scrolls and
                   that frame's bottom padding lands under the buttons: a
                   flex-1 min-h-0 editor shrank to the frame and spilled
                   past it, and padding never follows a spill. */
        "flex flex-col gap-4",
        // The round editor always stacks: it lives in a dialog about
        // 448px wide, where side by side left the canvas 136px and
        // the crop circle 42px.
        !round && "lg:min-h-0 lg:flex-1 lg:flex-row",
        className,
      )}
    >
      <div
        role="group"
        aria-label={labels.canvas}
        data-slot="image-editor-canvas"
        className="bg-surface-sunken relative min-h-96 flex-1 overflow-hidden rounded-xl"
      >
        <div className="absolute inset-6 sm:inset-10">
          <Cropper
            image={src}
            crop={position}
            zoom={zoom}
            rotation={rotation}
            aspect={ratio}
            onCropChange={setPosition}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={setMedia}
            initialCroppedAreaPixels={restore}
            showGrid={false}
            cropShape={round ? "round" : "rect"}
            // The flips ride the media transform in SCREEN space
            // (outside the rotation), so a horizontal flip stays
            // horizontal on a turned photo.
            transform={`translate(${position.x}px, ${position.y}px) ${mirror} rotate(${rotation}deg) scale(${zoom})`}
            mediaProps={{ crossOrigin: "anonymous" }}
            classes={{
              cropAreaClassName: round ? "rounded-full" : "rounded-xl",
            }}
            style={{
              containerStyle: { background: "transparent" },
              cropAreaStyle: {
                border: "none",
                // The kept area floats on the modal shadow;
                // the rest of the photo is ghosted by the
                // ground colour, not blacked out (a dark
                // scrim was too heavy). 72%, not more: at
                // 86% the ghost was so close to the ground
                // that the cut-away photo vanished into it.
                boxShadow:
                  "var(--shadow-modal), 0 0 0 9999em color-mix(in srgb, var(--surface-sunken) 72%, transparent)",
              },
            }}
          />
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col gap-6",
          !round && "lg:w-80 lg:overflow-y-auto",
        )}
      >
        {children}

        <section className="flex flex-col gap-3">
          <h3 className="text-label">{labels.transform}</h3>
          {round ? null : (
            <Tabs
              variant="segmented"
              value={tab}
              onValueChange={(next) =>
                setTab(next === "landscape" ? "landscape" : "portrait")
              }
            >
              <TabsList>
                <TabsTrigger value="portrait">{labels.portrait}</TabsTrigger>
                <TabsTrigger value="landscape">{labels.landscape}</TabsTrigger>
              </TabsList>
              <TabsContent value="portrait">
                <RatioRow
                  ratios={IMAGE_EDITOR_PORTRAIT}
                  value={aspect}
                  onChange={chooseAspect}
                  originalLabel={labels.original}
                  label={labels.portrait}
                />
              </TabsContent>
              <TabsContent value="landscape">
                <RatioRow
                  ratios={IMAGE_EDITOR_LANDSCAPE}
                  value={aspect}
                  onChange={chooseAspect}
                  originalLabel={labels.original}
                  label={labels.landscape}
                />
              </TabsContent>
            </Tabs>
          )}
          <div className="flex gap-2">
            <Button
              variant="chip"
              size="icon"
              aria-label={labels.rotate}
              hint={labels.rotate}
              onClick={() => {
                setRotation((r) => ((r + 90) % 360) as ImageEditorRotation);
                reframe();
              }}
            >
              {/* Clockwise in either direction: a turn is a
                                turn of the photo, not of the reading order. */}
              <Icon icon={RotateIcon} />
            </Button>
            {round ? null : (
              <>
                <Toggle
                  size="icon"
                  aria-label={labels.flipHorizontal}
                  hint={labels.flipHorizontal}
                  pressed={flipH}
                  onPressedChange={(next) => {
                    setFlipH(next);
                    reframe();
                  }}
                >
                  <Icon icon={FlipHorizontalIcon} />
                </Toggle>
                <Toggle
                  size="icon"
                  aria-label={labels.flipVertical}
                  hint={labels.flipVertical}
                  pressed={flipV}
                  onPressedChange={(next) => {
                    setFlipV(next);
                    reframe();
                  }}
                >
                  <Icon icon={FlipVerticalIcon} />
                </Toggle>
              </>
            )}
          </div>
          {round ? (
            <Slider
              aria-label={labels.zoom}
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.01}
              value={[zoom]}
              onValueChange={([next]) => setZoom(next ?? ZOOM_MIN)}
            />
          ) : null}
        </section>

        {round ? null : (
          <section className="flex flex-col gap-3">
            <h3 className="text-label">{labels.size}</h3>
            <ToggleGroup
              type="single"
              size="sm"
              required
              aria-label={labels.size}
              value={maxEdge == null ? "original" : String(maxEdge)}
              onValueChange={(value) =>
                setMaxEdge(value === "original" ? null : Number(value))
              }
            >
              {IMAGE_EDITOR_SIZES.map((edge) => (
                <ToggleGroupItem
                  key={edge ?? "original"}
                  value={edge == null ? "original" : String(edge)}
                >
                  {edge == null ? labels.sizeOriginal : labels.sizeEdge(edge)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>
        )}

        {failed ? (
          <Alert variant="destructive" role="alert">
            <Icon icon={WarningIcon} />
            <AlertDescription>{labels.failed}</AlertDescription>
          </Alert>
        ) : null}

        <div className={cn("flex gap-2", !round && "lg:mt-auto")}>
          <Button
            className="flex-1"
            loading={working}
            disabled={!crop}
            onClick={() => void apply()}
          >
            {labels.apply}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            disabled={busy}
            onClick={cancel}
          >
            {labels.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RatioRow({
  ratios,
  value,
  onChange,
  originalLabel,
  label,
}: {
  ratios: readonly Exclude<ImageEditorAspect, "original">[];
  value: ImageEditorAspect;
  onChange: (next: ImageEditorAspect) => void;
  originalLabel: string;
  /** The group's name: the orientation tab it sits under. */
  label: string;
}): React.JSX.Element {
  const choices: ImageEditorAspect[] = ["original", ...ratios];
  return (
    <ToggleGroup
      type="single"
      size="sm"
      required
      aria-label={label}
      className="pt-3"
      value={value}
      onValueChange={(next) => onChange(next as ImageEditorAspect)}
    >
      {choices.map((choice) => (
        <ToggleGroupItem key={choice} value={choice}>
          {choice === "original" ? (
            originalLabel
          ) : (
            // Ratios read width first in every language.
            <span dir="ltr" className="tabular-nums">
              {choice}
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
