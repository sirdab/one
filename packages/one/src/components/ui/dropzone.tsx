"use client";

import * as React from "react";
import {
  useDropzone,
  type DropEvent,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";

import { cn } from "../../lib/utils";

export type DropzoneProps = Omit<
  DropzoneOptions,
  "onDrop" | "onDropAccepted" | "onDropRejected"
> & {
  onDrop: (
    accepted: File[],
    rejected: FileRejection[],
    event: DropEvent,
  ) => void;
  className?: string;

  label?: string;
  children?: React.ReactNode;
};

export function Dropzone({
  onDrop,
  className,
  label,
  children,
  disabled,
  ...options
}: DropzoneProps): React.JSX.Element {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...options,
    disabled,
    onDrop,
  });
  return (
    <div
      {...getRootProps({
        role: "button",
        "aria-label": label,
        "aria-disabled": disabled || undefined,
      })}
      data-slot="dropzone"
      data-drag-active={isDragActive || undefined}
      className={cn(
        "border-border bg-surface-whisper hover:wash-100 data-drag-active:wash-100 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center transition-colors duration-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-drag-active:border-foreground",
        className,
      )}
    >
      <input {...getInputProps()} data-slot="dropzone-input" />
      {children}
    </div>
  );
}

export type { FileRejection };
