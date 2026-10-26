"use client";

import { useState } from "react";

import {
  AssistantThumbsDownIcon,
  AssistantThumbsUpIcon,
  CopyIcon,
} from "@sirdab/one/icons/shell";
import { Action, Actions } from "@sirdab/one/components/actions";
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@sirdab/one/components/artifact";
import { ChatBubble } from "@sirdab/one/components/chat-bubble";
import { Confirmation } from "@sirdab/one/components/confirmation";
import { Markdown } from "@sirdab/one/components/markdown";
import { PromptInput } from "@sirdab/one/components/prompt-input";
import { Reasoning } from "@sirdab/one/components/reasoning";
import { Suggestion, Suggestions } from "@sirdab/one/components/suggestion";
import { Tool, ToolDetail } from "@sirdab/one/components/tool";
import { sampler } from "./samples";
import { Section } from "./section";

/* Client-side because the composer and the approval card hold state.
   Section titles and captions are chrome (English); everything painted
   INSIDE a component localizes through the sampler. */
export function AssistantDemo({
  locale = "en",
}: {
  locale?: string;
}): React.JSX.Element {
  const s = sampler(locale);
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [approval, setApproval] = useState<"pending" | "approved" | "denied">(
    "pending",
  );
  const [rating, setRating] = useState<-1 | 1 | null>(null);
  const table = [
    `| ${s("Products")} | ${s("Orders")} |`,
    "| --- | ---: |",
    `| ${s("Sukkari dates")} | 42 |`,
    `| ${s("Ajwa dates")} | 17 |`,
  ].join("\n");

  return (
    <div className="flex flex-col gap-10">
      <Section title="A turn" caption="bubble, thinking, steps, reply">
        <div className="flex max-w-xl flex-col gap-4">
          <ChatBubble role="merchant">{s("Which orders are late?")}</ChatBubble>
          <Reasoning streaming={false} label={s("Thought for 8s")}>
            {s("I checked your orders from this week and the late ones first.")}
          </Reasoning>
          <Tool state="done" label={s("Looked at 14 orders")}>
            <ToolDetail title={s("Result")} value={{ late: 2 }} />
          </Tool>
          <Tool state="running" label={s("Looking up orders")} />
          <Tool state="failed" label={s("Could not read discounts")} />
          <Markdown>{table}</Markdown>
          <Actions>
            <Action icon={CopyIcon} label={s("Copy")} />
            <Action
              icon={AssistantThumbsUpIcon}
              label={s("Good answer")}
              pressed={rating === 1}
              onClick={() => setRating(1)}
            />
            <Action
              icon={AssistantThumbsDownIcon}
              label={s("Bad answer")}
              pressed={rating === -1}
              onClick={() => setRating(-1)}
            />
          </Actions>
        </div>
      </Section>

      <Section title="Approval" caption="a paused turn">
        <div className="max-w-xl">
          <Confirmation
            state={approval}
            title={s("Cancel order #1005 and restock its items?")}
            description={s("This can't be undone.")}
            approveLabel={s("Cancel it")}
            denyLabel={s("Keep it")}
            resolvedLabel={approval === "approved" ? s("Cancelled") : s("Kept")}
            onApprove={() => setApproval("approved")}
            onDeny={() => setApproval("denied")}
          />
        </div>
      </Section>

      <Section title="Artifact" caption="what a step opens onto">
        <div className="max-w-xl">
          <Artifact>
            <ArtifactHeader>
              <div>
                <ArtifactTitle>{s("Top products")}</ArtifactTitle>
                <ArtifactDescription>{s("Last 30 days")}</ArtifactDescription>
              </div>
              <ArtifactActions>
                <ArtifactAction icon={CopyIcon} label={s("Copy")} />
              </ArtifactActions>
            </ArtifactHeader>
            <ArtifactContent>
              <Markdown>{table}</Markdown>
            </ArtifactContent>
          </Artifact>
        </div>
      </Section>

      <Section title="Composer" caption="Enter sends, Shift+Enter breaks">
        <div className="flex max-w-xl flex-col gap-3">
          <Suggestions>
            <Suggestion
              suggestion={s("Which orders are late?")}
              onPick={setDraft}
            />
            <Suggestion
              suggestion={s("Top products this month")}
              onPick={setDraft}
            />
          </Suggestions>
          <PromptInput
            value={draft}
            onValueChange={setDraft}
            onSubmit={() => {
              setDraft("");
              setRunning(true);
            }}
            placeholder={s("Ask about your store…")}
            submitLabel={s("Send")}
            stopLabel={s("Stop")}
            streaming={running}
            onStop={() => setRunning(false)}
            maxLength={4000}
          />
        </div>
      </Section>
    </div>
  );
}
