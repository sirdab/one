import { AssistantDemo } from "../../components/assistant-demo";
import { PageHeader } from "../../components/section";

export default async function AssistantPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Assistant"
        tagline="The pieces of a conversation: thinking, steps, approvals, the composer."
      />
      <AssistantDemo locale={lang} />
    </>
  );
}
