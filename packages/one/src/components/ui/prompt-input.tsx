"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { ArrowUpIcon, SquareIcon } from "../icons/general";
import { Button } from "./button";
import { Icon } from "./icon";
import { Textarea } from "./textarea";

/* The Sirdab prompt input: the assistant's composer. Taken from the
   shadcn.io AI Elements prompt-input and trued down to what the assistant
   ships: a controlled field, Enter to send, Shift+Enter for a new line,
   and a send that becomes Stop while a turn runs. Attachments, speech,
   model selects, hover cards and command tabs are gone (attachments are
   v2; the rest were never ours), and with them `nanoid`, the `ai` types and
   six primitives we do not carry.

   The card is the studio composer's: rounded-2xl hairline box on the page
   tone, lighting to ink on focus-within. The send is a round icon button,
   the one primary per view (the chat convention wins over the house pill
   here); its name rides aria-label and the hover hint, and Stop takes the
   same shape so the swap moves nothing. A refused send keeps the text: the
   composer never clears what it did not send.

   Controlled on purpose: the surface keeps the draft while it switches
   between the rail and the full page, so the value lives above this.

   IME: Enter during composition (Arabic keyboards on some platforms,
   CJK) confirms the candidate, it must never send.

   Usage:
       <PromptInput
           value={draft} onValueChange={setDraft} onSubmit={send}
           placeholder={t("placeholder")} submitLabel={t("send")} stopLabel={t("stop")}
           streaming={running} onStop={stop}
           maxLength={ASSISTANT_MESSAGE_MAX} overLimitLabel={t("errors.too_long")}
           header={contextChip}
       />
*/
interface PromptInputProps extends Omit<
  React.ComponentProps<"form">,
  "onSubmit" | "children"
> {
  value: string;
  onValueChange(value: string): void;
  /** Receives the trimmed text; the caller clears the value. */
  onSubmit(value: string): void;
  placeholder: string;
  submitLabel: string;
  stopLabel: string;
  /** A turn is running: Enter does nothing and the send becomes Stop. */
  streaming?: boolean;
  onStop?(): void;
  maxLength?: number;
  /** Caller-worded, shown under the field while the text is over the cap. */
  overLimitLabel?: string;
  /** The send button's reason while the field is empty. */
  emptyReason?: string;
  /** WHY sending is refused right now (busy elsewhere, offline). */
  disabledReason?: React.ReactNode;
  /** Above the field: the page-context chip. */
  header?: React.ReactNode;
  /** Start of the footer row. */
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
