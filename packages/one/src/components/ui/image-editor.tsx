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

export const IMAGE_EDITOR_PORTRAIT = ["1:1", "2:3", "5:7", "9:16"] as const;
export const IMAGE_EDITOR_LANDSCAPE = ["3:2", "7:5", "16:9"] as const;
export const IMAGE_EDITOR_SIZES = [null, 1080, 1600, 2048] as const;

export type ImageEditorAspect =
  | "original"
  | (typeof IMAGE_EDITOR_PORTRAIT)[number]
  | (typeof IMAGE_EDITOR_LANDSCAPE)[number];

export type ImageEditorRotation = 0 | 90 | 180 | 270;

export type ImageEditorEdit = {
  aspect: ImageEditorAspect;
  crop: { x: number; y: number; width: number; height: number };
  rotation: ImageEditorRotation;
  flipH: boolean;
  flipV: boolean;
  maxEdge: number | null;
};

export type ImageEditorLabels = {
  transform: string;
  portrait: string;
  landscape: string;

  original: string;
  rotate: string;
  flipHorizontal: string;
  flipVertical: string;

  size: string;
  sizeOriginal: string;

  sizeEdge: (px: number) => string;

  canvas: string;
  apply: string;
  cancel: string;

  failed: string;

  zoom?: string;
};

export type ImageEditorShape = "rect" | "circle";

const CIRCLE_EDGE = 512;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

export type ImageEditorProps = {
  src: string;
  initialEdit?: ImageEditorEdit | null;
  labels: ImageEditorLabels;
  onApply: (edit: ImageEditorEdit, blob: Blob) => void | Promise<void>;
  onCancel: () => void;

  busy?: boolean;
  shape?: ImageEditorShape;

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

export function loadEditorImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image failed to load"));
    image.src = src;
  });
}

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

  ctx.scale(scale, scale);
  ctx.translate(-edit.crop.x, -edit.crop.y);
  ctx.translate(boxW / 2, boxH / 2);
  ctx.scale(edit.flipH ? -1 : 1, edit.flipV ? -1 : 1);
  ctx.rotate((edit.rotation * Math.PI) / 180);
  ctx.drawImage(image, -w / 2, -h / 2);

  const webp = await toBlob(canvas, "image/webp", 0.9);
  if (webp && webp.type === "image/webp") return webp;

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
        "flex flex-col gap-4",

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

            transform={`translate(${position.x}px, ${position.y}px) ${mirror} rotate(${rotation}deg) scale(${zoom})`}
            mediaProps={{ crossOrigin: "anonymous" }}
            classes={{
              cropAreaClassName: round ? "rounded-full" : "rounded-xl",
            }}
            style={{
              containerStyle: { background: "transparent" },
              cropAreaStyle: {
                border: "none",

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
            <span dir="ltr" className="tabular-nums">
              {choice}
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
