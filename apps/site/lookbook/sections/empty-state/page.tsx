import { SearchIcon } from "@sirdab/one/icons/catalogue";
import { StoreIcon } from "@sirdab/one/icons/general";
import { AlertsIcon } from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import { EmptyState } from "@sirdab/one/components/empty-state";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function EmptyStatePage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Empty state"
        tagline="Nothing here, said in one voice: a quiet well, a line, a whisper."
      />

      <Section
        title="Message and caption"
        caption="what will appear here, not what is missing"
      >
        <div className="border-border bg-card max-w-96 rounded-lg border py-8">
          <EmptyState
            icon={AlertsIcon}
            title={s("You are all caught up")}
            caption={s("Orders, payouts and stock alerts land here.")}
          />
        </div>
      </Section>

      <Section title="With an action" caption="one Button, never a row">
        <div className="border-border bg-card max-w-96 rounded-lg border py-8">
          <EmptyState
            icon={SearchIcon}
            title={s("No products yet")}
            caption={s("Add your first product to see it here.")}
            action={<Button variant="secondary">{s("Add product")}</Button>}
          />
        </div>
      </Section>

      <Section
        title="Large, when it is the whole surface"
        caption="size lg: a panel with nothing else in it"
      >
        <div className="border-border bg-card flex h-96 max-w-96 items-center justify-center rounded-lg border px-6">
          <EmptyState
            size="lg"
            icon={StoreIcon}
            title={s("No products yet")}
            caption={s("Add your first product to see it here.")}
            action={<Button>{s("Add product")}</Button>}
          />
        </div>
      </Section>
    </>
  );
}
