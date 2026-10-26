import { AiIcon, PanelEndIcon } from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import { Icon } from "@sirdab/one/components/icon";
import { PromptBar } from "@sirdab/one/components/prompt-bar";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function PromptBarPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Prompt bar"
        tagline="One line to ask for something, floating on the page."
      />
      <Section
        title="With a trailing control"
        caption="leading mark, one button"
      >
        <PromptBar
          leading={<Icon icon={AiIcon} />}
          inputProps={{
            placeholder: s("Search…"),
            "aria-label": s("Search…"),
          }}
          trailing={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              shape="circle"
              aria-label={s("Options")}
            >
              <Icon icon={PanelEndIcon} className="size-5" />
            </Button>
          }
        />
      </Section>
    </>
  );
}
