"use client";

import * as React from "react";
import {
  useDropzone,
  type DropEvent,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";

import { cn } from "../../lib/utils";

/* The Sirdab dropzone: a drop target that is also a click-to-choose button.
   Trued after the shadcn.io add (built on react-dropzone):

   - The root is a div with role="button", not stock's <Button>: the hidden
     file input lives inside it, and an input inside a <button> is invalid
     HTML that some browsers refuse to open the picker from.
   - No copy of its own. Stock rendered English captions ("Upload a file",
     "Drag and drop or click to upload"); primitives here take their words as
     props or children, so the caller writes the empty state.
   - House tokens: the resting well is the whisper surface on a hairline,
     hover walks the gray-alpha ladder, and a drag over it inks the border so
     the target reads as live. Focus is the global focus-visible outline.
   - Rejections are passed through, never swallowed: stock collapsed them to
     one Error message in English; here `onDrop` gets the accepted files AND
     the rejections, and the caller turns each rejection code into its own
     sentence.

   Usage:
       <Dropzone accept={{ "image/jpeg": [] }} maxSize={bytes} onDrop={...}>
           <p>Drop photos here</p>
       </Dropzone> */

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
  /** The accessible name: the root is a button, and its visible content is
   *  often a picture plus a caption, not a single phrase. */
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
