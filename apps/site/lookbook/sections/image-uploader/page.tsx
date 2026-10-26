import { PageHeader, Section } from "../../../lookbook/components/section";
import { ImageUploaderDemo } from "./demo";

/* Gallery page: the upload here is a stand-in that fails every third file,
   so the error and Retry states can be seen. */
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
