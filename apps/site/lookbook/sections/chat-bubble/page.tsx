import { ChatBubble } from "@sirdab/one/components/chat-bubble";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function ChatBubblePage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Chat bubble"
        tagline="One turn in a transcript: quiet fills, never the ink."
      />

      <Section
        title="On the page tone"
        caption="assistant turns take the whisper card"
      >
        <div className="flex max-w-96 flex-col gap-2">
          <ChatBubble role="merchant">
            {s("Make the hero photo bigger")}
          </ChatBubble>
          <ChatBubble>
            {s("Done. The hero now spans the full width.")}
          </ChatBubble>
        </div>
      </Section>

      <Section
        title="On the sunken backdrop"
        caption="assistant turns return to the page tone"
      >
        <div className="bg-surface-sunken flex max-w-96 flex-col gap-2 rounded-lg p-4">
          <ChatBubble role="merchant" surface="sunken">
            {s("How are sales today?")}
          </ChatBubble>
          <ChatBubble surface="sunken">
            {s("Sales are up 12% so far today.")}
          </ChatBubble>
        </div>
      </Section>
    </>
  );
}
