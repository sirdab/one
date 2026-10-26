import { AssistantDemo } from "../../components/assistant-demo";
import { PageHeader } from "../../components/section";

/* Gallery page: prose and usage live in ./notes.md. */
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
