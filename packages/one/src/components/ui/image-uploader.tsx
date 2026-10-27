"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "../../lib/utils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  UploadIcon,
  WarningIcon,
} from "../icons/catalogue";
import { RotateCcwIcon } from "../icons/general";
import { CloseIcon, PlusIcon } from "../icons/shell";
import { Button } from "./button";
import type { FileRejection } from "./dropzone";
import { Icon } from "./icon";
import { Input } from "./input";
import { Spinner } from "./spinner";

export type UploaderImage = {
  key: string;
  url: string;
  alt?: string;
};

export type UploadOutcome = { url: string; id?: string } | { error: string };

export type ImageUploaderLabels = {
  dropTitle: string;
  dropHint: string;

  choose: string;

  dropActive: string;

  add: string;
  cover: string;
  remove: string;
  retry: string;
  uploading: string;
  moveEarlier: string;
  moveLater: string;

  rejectedType: string;
  rejectedSize: string;

  rejectedCount?: string;

  open?: (position: number) => string;

  altLabel?: string;
  altPlaceholder?: string;
};

export type ImageUploaderProps = {
  value: UploaderImage[];
  onChange: (next: UploaderImage[]) => void;
  upload: (file: File) => Promise<UploadOutcome>;

  accept: Record<string, string[]>;
  maxBytes?: number;

  maxFiles?: number;
  labels: ImageUploaderLabels;
  onOpen?: (index: number) => void;
  altDir?: "ltr" | "rtl";

  id?: string;

  onBrowse?: (openFiles: () => void) => void;
  className?: string;
};

type Pending = {
  id: string;
  file: File;
  preview: string;
  status: "queued" | "uploading" | "error";
  error?: string;
};

let pendingSeq = 0;

export function ImageUploader({
  value,
  onChange,
  upload,
  accept,
  maxBytes,
  maxFiles,
  labels,
  onOpen,
  altDir,
  id,
  onBrowse,
  className,
}: ImageUploaderProps): React.JSX.Element {
  const [pending, setPending] = React.useState<Pending[]>([]);
  const [rejection, setRejection] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState<number | null>(null);

  const valueRef = React.useRef(value);
  valueRef.current = value;
  const pendingRef = React.useRef(pending);
  pendingRef.current = pending;

  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const item of pendingRef.current) URL.revokeObjectURL(item.preview);
      pendingRef.current = [];
    };
  }, []);

  const running = React.useRef(false);

  const drain = React.useCallback(async (): Promise<void> => {
    if (!mounted.current || running.current) return;
    running.current = true;
    try {
      for (;;) {
        const next = pendingRef.current.find(
          (item) => item.status === "queued",
        );
        if (!next) return;
        setPending((items) =>
          items.map((item) =>
            item.id === next.id ? { ...item, status: "uploading" } : item,
          ),
        );
        pendingRef.current = pendingRef.current.map((item) =>
          item.id === next.id ? { ...item, status: "uploading" } : item,
        );
        const outcome = await upload(next.file);

        if (!mounted.current) return;
        if ("error" in outcome) {
          const failed = (item: Pending): Pending =>
            item.id === next.id
              ? { ...item, status: "error", error: outcome.error }
              : item;
          pendingRef.current = pendingRef.current.map(failed);
          setPending((items) => items.map(failed));
          continue;
        }
        URL.revokeObjectURL(next.preview);
        pendingRef.current = pendingRef.current.filter(
          (item) => item.id !== next.id,
        );
        setPending((items) => items.filter((item) => item.id !== next.id));
        const landed: UploaderImage = {
          key: outcome.id ?? outcome.url,
          url: outcome.url,
        };
        valueRef.current = [...valueRef.current, landed];
        onChange(valueRef.current);
      }
    } finally {
      running.current = false;
    }
  }, [onChange, upload]);

  function onDrop(accepted: File[], rejected: FileRejection[]): void {
    const room =
      maxFiles === undefined
        ? accepted.length
        : maxFiles - valueRef.current.length - pendingRef.current.length;
    const taken = accepted.slice(0, Math.max(0, room));
    const overflow = accepted.length > taken.length;
    setRejection(
      rejectionMessage(rejected, labels) ??
        (overflow ? (labels.rejectedCount ?? null) : null),
    );
    if (taken.length === 0) return;
    const added: Pending[] = taken.map((file) => ({
      id: `pending-${++pendingSeq}`,
      file,
      preview: URL.createObjectURL(file),
      status: "queued",
    }));
    pendingRef.current = [...pendingRef.current, ...added];
    setPending(pendingRef.current);
    void drain();
  }

  function retry(id: string): void {
    const queued = (item: Pending): Pending =>
      item.id === id ? { ...item, status: "queued", error: undefined } : item;
    pendingRef.current = pendingRef.current.map(queued);
    setPending(pendingRef.current);
    void drain();
  }

  function dismiss(id: string): void {
    const item = pendingRef.current.find((p) => p.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    pendingRef.current = pendingRef.current.filter((p) => p.id !== id);
    setPending(pendingRef.current);
  }

  function move(from: number, to: number): void {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    onChange(next);
  }

  function setAlt(index: number, alt: string): void {
    onChange(
      value.map((image, i) => (i === index ? { ...image, alt } : image)),
    );
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    maxSize: maxBytes,
    multiple: maxFiles !== 1,
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const browse = (): void => {
    if (onBrowse) onBrowse(open);
    else open();
  };

  const empty = value.length === 0 && pending.length === 0;
  const room =
    maxFiles === undefined || value.length + pending.length < maxFiles;

  return (
    <div
      {...getRootProps()}
      data-slot="image-uploader"
      data-drag-active={isDragActive || undefined}
      className={cn("group/uploader relative flex flex-col gap-2", className)}
    >
      <input {...getInputProps({ id })} data-slot="image-uploader-input" />
      {empty ? (
        <div
          onClick={browse}
          className="border-border bg-surface-whisper group-data-drag-active/uploader:wash-100 hover:wash-50 flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border p-6 text-center transition-colors duration-150 ease-out group-data-drag-active/uploader:border-foreground motion-reduce:transition-none"
        >
          <span className="border-border flex size-10 items-center justify-center rounded-full border bg-background">
            <Icon
              icon={UploadIcon}
              className="text-muted-foreground size-4.5"
            />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-label">{labels.dropTitle}</span>
            <span className="text-caption text-muted-foreground">
              {labels.dropHint}
            </span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              browse();
            }}
          >
            {labels.choose}
          </Button>
        </div>
      ) : (
        <div className="@container">
          <ul className="grid grid-cols-3 gap-2 @sm:grid-cols-4 @lg:grid-cols-5 @2xl:grid-cols-6">
            {value.map((image, index) => (
              <li
                key={image.key}
                draggable
                onDragStart={() => setDragging(index)}
                onDragOver={(event) => {
                  if (dragging !== null) event.preventDefault();
                }}
                onDrop={(event) => {
                  if (dragging === null) return;
                  event.preventDefault();
                  move(dragging, index);
                  setDragging(null);
                }}
                onDragEnd={() => setDragging(null)}
                className={cn(
                  "flex flex-col gap-1.5",
                  dragging === index && "opacity-50",
                )}
              >
                <Tile
                  url={image.url}
                  cover={index === 0 ? labels.cover : undefined}
                  onOpen={onOpen ? () => onOpen(index) : undefined}
                  openLabel={labels.open?.(index + 1)}
                >
                  <Control
                    className="absolute end-1.5 top-1.5"
                    label={labels.remove}
                    onClick={() =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                  >
                    <Icon icon={CloseIcon} />
                  </Control>
                  {value.length > 1 ? (
                    <span className="absolute end-1.5 bottom-1.5 flex gap-1">
                      <Control
                        label={labels.moveEarlier}
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      >
                        <Icon icon={ArrowLeftIcon} flip />
                      </Control>
                      <Control
                        label={labels.moveLater}
                        disabled={index === value.length - 1}
                        onClick={() => move(index, index + 1)}
                      >
                        <Icon icon={ArrowRightIcon} flip />
                      </Control>
                    </span>
                  ) : null}
                </Tile>
                {labels.altLabel ? (
                  <Input
                    aria-label={labels.altLabel}
                    placeholder={labels.altPlaceholder}
                    dir={altDir}
                    value={image.alt ?? ""}
                    onChange={(event) => setAlt(index, event.target.value)}
                  />
                ) : null}
              </li>
            ))}
            {pending.map((item) => (
              <li key={item.id}>
                <Tile url={item.preview} dim>
                  {item.status === "error" ? (
                    <span className="bg-destructive-subtle absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                      <Icon
                        icon={WarningIcon}
                        className="text-destructive size-4.5"
                      />
                      <span
                        role="alert"
                        className="text-caption line-clamp-2 text-foreground"
                      >
                        {item.error}
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => retry(item.id)}
                      >
                        <Icon icon={RotateCcwIcon} />
                        {labels.retry}
                      </Button>
                      <Control
                        className="absolute end-1.5 top-1.5"
                        label={labels.remove}
                        onClick={() => dismiss(item.id)}
                      >
                        <Icon icon={CloseIcon} />
                      </Control>
                    </span>
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-9 items-center justify-center rounded-full bg-background">
                        <Spinner />
                      </span>
                      <span className="sr-only">{labels.uploading}</span>
                    </span>
                  )}
                </Tile>
              </li>
            ))}
            {room ? (
              <li>
                <button
                  type="button"
                  onClick={browse}
                  className="border-border bg-surface-whisper text-muted-foreground hover:wash-100 flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border transition-colors duration-100 hover:text-foreground"
                >
                  <Icon icon={PlusIcon} className="size-5" />
                  <span className="text-caption">{labels.add}</span>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      )}
      {!empty && isDragActive ? (
        <div className="bg-surface-whisper pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-foreground opacity-95">
          <Icon icon={UploadIcon} className="size-5 text-foreground" />
          <span className="text-label">{labels.dropActive}</span>
        </div>
      ) : null}
      {rejection ? (
        <p role="alert" className="text-caption text-destructive">
          {rejection}
        </p>
      ) : null}
    </div>
  );
}

function Control({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Button
      variant="overlay"
      size="icon-sm"
      aria-label={label}
      hint={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "opacity-0 transition-opacity duration-100 group-focus-within/tile:opacity-100 group-hover/tile:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none pointer-coarse:opacity-100",
        className,
      )}
    >
      {children}
    </Button>
  );
}

function Tile({
  url,
  cover,
  dim = false,
  onOpen,
  openLabel,
  children,
}: {
  url: string;
  cover?: string;
  dim?: boolean;
  onOpen?: () => void;
  openLabel?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <span className="group/tile bg-muted relative block aspect-square overflow-hidden rounded-lg">
      <img
        src={url}
        alt=""
        className={cn("size-full object-cover", dim && "opacity-40")}
      />
      {onOpen ? (
        <button
          type="button"
          aria-label={openLabel}
          onClick={onOpen}
          className="absolute inset-0"
        />
      ) : null}

      {cover ? (
        <span className="text-caption pointer-events-none absolute start-1.5 bottom-1.5 rounded-md bg-foreground px-1.5 py-0.5 text-background">
          {cover}
        </span>
      ) : null}
      {children}
    </span>
  );
}

function rejectionMessage(
  rejected: FileRejection[],
  labels: ImageUploaderLabels,
): string | null {
  const code = rejected[0]?.errors[0]?.code;
  if (!code) return null;
  if (code === "file-invalid-type") return labels.rejectedType;
  if (code === "file-too-large") return labels.rejectedSize;
  if (code === "too-many-files" && labels.rejectedCount)
    return labels.rejectedCount;
  return labels.rejectedType;
}
