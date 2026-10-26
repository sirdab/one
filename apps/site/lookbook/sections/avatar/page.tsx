import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sirdab/one/components/avatar";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: the rules live in ./notes.md. A picture is painted as an SVG
   data url so the page needs no storage host. */
const PICTURE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#c98b5a"/><circle cx="32" cy="26" r="11" fill="#f8f1e7"/><path d="M10 64c2-16 14-22 22-22s20 6 22 22z" fill="#6b3f2a"/></svg>`,
  );

function Face({
  initial,
  size,
  picture = false,
}: {
  initial: string;
  size: "default" | "xl";
  picture?: boolean;
}): React.JSX.Element {
  return (
    <Avatar size={size}>
      {picture ? <AvatarImage src={PICTURE} alt="" /> : null}
      <AvatarFallback delayMs={picture ? 600 : undefined}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

export default async function AvatarPage(): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Avatar"
        tagline="A person's picture in a circle, or their initial in ink."
      />
      <Section
        title="With a picture"
        caption="the topbar size (32) and the settings row size (56)"
      >
        <div className="flex items-center gap-4">
          <Face initial="S" size="default" picture />
          <Face initial="S" size="xl" picture />
        </div>
      </Section>
      <Section title="Arabic initial" caption="one grapheme, the ink circle">
        <div className="flex items-center gap-4" dir="rtl">
          <Face initial="س" size="default" />
          <Face initial="س" size="xl" />
        </div>
      </Section>
      <Section title="Latin initial" caption="upper case, one letter">
        <div className="flex items-center gap-4">
          <Face initial="S" size="default" />
          <Face initial="S" size="xl" />
        </div>
      </Section>
    </>
  );
}
