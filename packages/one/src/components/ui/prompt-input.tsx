"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { ArrowUpIcon, SquareIcon } from "../icons/general";
import { Button } from "./button";
import { Icon } from "./icon";
import { Textarea } from "./textarea";

interface PromptInputProps extends Omit<
  React.ComponentProps<"form">,
  "onSubmit" | "children"
> {
  value: string;
  onValueChange(value: string): void;

  onSubmit(value: string): void;
  placeholder: string;
  submitLabel: string;
  stopLabel: string;

  streaming?: boolean;
  onStop?(): void;
  maxLength?: number;

  overLimitLabel?: string;

  emptyReason?: string;

  disabledReason?: React.ReactNode;

  header?: React.ReactNode;

  tools?: React.ReactNode;
  autoFocus?: boolean;
}

function PromptInput({
  value,
  onValueChange,
  onSubmit,
  placeholder,
  submitLabel,
  stopLabel,
  streaming = false,
  onStop,
  maxLength,
  overLimitLabel,
  emptyReason,
  disabledReason,
  header,
  tools,
  autoFocus,
  className,
  ...props
}: PromptInputProps): React.JSX.Element {
  const composing = React.useRef(false);
  const trimmed = value.trim();
  const over = maxLength != null && value.length > maxLength;
  const canSend =
    !streaming && trimmed.length > 0 && !over && disabledReason == null;
  const reason: React.ReactNode =
    disabledReason ??
    (over ? overLimitLabel : undefined) ??
    (trimmed.length === 0 ? emptyReason : undefined);

  const submit = (): void => {
    if (canSend) onSubmit(trimmed);
  };

  return (
    <form
      data-slot="prompt-input"
      data-streaming={streaming || undefined}
      className={cn(
        "border-input focus-within:ring-input-focus flex flex-col gap-2 rounded-2xl border bg-background p-2 transition-colors duration-100 focus-within:border-foreground",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      {...props}
    >
      {header}
      <Textarea
        bare
        rows={2}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-invalid={over || undefined}
        className="field-sizing-content max-h-48 min-h-12"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          if (composing.current || event.nativeEvent.isComposing) {
            return;
          }
          event.preventDefault();
          submit();
        }}
      />
      {over && overLimitLabel ? (
        <p role="status" className="text-caption text-destructive">
          {overLimitLabel}
        </p>
      ) : null}
      <div className="flex items-center gap-1">
        {tools}
        <span className="ms-auto" />
        {streaming ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            shape="circle"
            aria-label={stopLabel}
            hint={stopLabel}
            onClick={onStop}
          >
            <Icon icon={SquareIcon} />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            shape="circle"
            aria-label={submitLabel}
            hint={submitLabel}
            disabled={!canSend}
            disabledReason={canSend ? undefined : reason}
          >
            <Icon icon={ArrowUpIcon} />
          </Button>
        )}
      </div>
    </form>
  );
}

export { PromptInput };
export type { PromptInputProps };
