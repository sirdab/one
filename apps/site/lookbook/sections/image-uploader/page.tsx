import { PageHeader, Section } from "../../../lookbook/components/section";
import { ImageUploaderDemo } from "./demo";

export default async function ImageUploaderPage(): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Image uploader"
        tagline="Drop or choose, watch it upload, drag to order. The first photo is the cover."
      />
      <Section
        title="Photos"
        caption="empty drop area, then a grid with an add tile"
      >
        <ImageUploaderDemo />
      </Section>
      <Section
        title="With captions"
        caption="a caption field under each photo, in the caller's language"
      >
        <ImageUploaderDemo captions />
      </Section>
    </>
  );
}
