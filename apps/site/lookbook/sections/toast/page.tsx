import { PageHeader, Section } from "../../../lookbook/components/section";
import { ToastDemo } from "../../../lookbook/components/toast-demo";

export default function ToastPage({
  lang = "en",
}: {
  lang?: string;
}): React.JSX.Element {
  return (
    <>
      <PageHeader title="Toast" tagline="Sonner, wearing the popover tokens." />

      <Section title="Live" caption="fire the variants">
        <ToastDemo locale={lang} />
      </Section>
    </>
  );
}
