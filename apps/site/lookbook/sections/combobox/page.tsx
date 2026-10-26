import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";
import { ComboboxDemo } from "./demo";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function ComboboxPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  const options = [
    { value: "small", label: s("Small") },
    { value: "medium", label: s("Medium") },
    { value: "large", label: s("Large") },
  ];
  const countries = [
    { value: "SA", label: s("Saudi Arabia") },
    { value: "AE", label: s("Emirates") },
    { value: "KW", label: s("Kuwait") },
    { value: "TR", label: s("Türkiye") },
    { value: "GB", label: s("United Kingdom") },
  ];
  const many = Array.from({ length: 14 }, (_, i) => ({
    value: `option-${i + 1}`,
    label: `${s("Option")} ${i + 1}`,
  }));
  const strings = {
    placeholder: s("Options"),
    searchPlaceholder: s("Search…"),
    emptyLabel: s("No results."),
  };
  return (
    <>
      <PageHeader
        title="Combobox"
        tagline="A searchable dropdown that picks several."
      />
      <Section title="Pick several" caption="toggles, stays open">
        <ComboboxDemo options={options} {...strings} creatable={false} />
      </Section>
      <Section
        title="Create from search"
        caption="a search with no match offers to add it"
      >
        <ComboboxDemo options={options} {...strings} creatable />
      </Section>
      <Section
        title="Groups and a fixed value"
        caption="headed sets; a fixed value leads the summary and is no row. Below md the panel is a bottom tray"
      >
        <ComboboxDemo
          options={countries}
          {...strings}
          creatable={false}
          fixed={["SA"]}
          groups={[
            { label: s("Gulf countries"), values: ["AE", "KW"] },
            { label: s("Other countries"), values: ["TR", "GB"] },
          ]}
        />
      </Section>
      <Section
        title="Past twelve options"
        caption="the search field appears; with twelve or fewer it stays away"
      >
        <ComboboxDemo options={many} {...strings} creatable={false} />
      </Section>
    </>
  );
}
