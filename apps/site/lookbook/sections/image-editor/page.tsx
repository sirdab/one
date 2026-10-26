import { PageHeader, Section } from "../../../lookbook/components/section";
import { ImageEditorCircleDemo, ImageEditorDemo } from "./demo";

/* Gallery page: the photo is painted on a canvas, so Apply renders for real
   and the result replaces the thumbnail; click it to edit again from the
   original. */
export default async function ImageEditorPage(): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Image editor"
        tagline="Crop to a ratio, turn, mirror and cap the size. The original is never touched."
      />
      <Section
        title="Editor"
        caption="the caller's fields first, then crop and transform, size, and the actions"
      >
        <ImageEditorDemo />
      </Section>
      <Section
        title="Round (profile picture)"
        caption="shape circle: a round 1:1 crop, a zoom slider and a turn; the file is square, 512px, and CSS makes it round"
      >
        <ImageEditorCircleDemo />
      </Section>
    </>
  );
}
