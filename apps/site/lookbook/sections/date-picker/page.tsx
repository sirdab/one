import { Calendar } from "@sirdab/one/components/calendar";
import { DatePickerDemo } from "../../../lookbook/components/date-picker-demo";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function DatePickerPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Date picker"
        tagline="The month grid, and the field that opens it. No browser ever draws a date in this product."
      />

      <Section title="Calendar" caption="the grid on its own">
        <div className="border-border w-fit rounded-lg border">
          <Calendar mode="single" locale={lang} />
        </div>
      </Section>

      <Section
        title="Date and time"
        caption="a promo window, the shape it ships in"
      >
        <DatePickerDemo lang={lang} withTime />
      </Section>

      <Section title="Date only" caption="when the clock is noise">
        <DatePickerDemo lang={lang} withTime={false} />
      </Section>
    </>
  );
}
