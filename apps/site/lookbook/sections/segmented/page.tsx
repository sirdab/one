import { AddPhotoIcon, PreviewIcon } from "@sirdab/one/icons/catalogue";
import { AiIcon } from "@sirdab/one/icons/shell";
import { Icon } from "@sirdab/one/components/icon";
import { Label } from "@sirdab/one/components/label";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sirdab/one/components/tabs";
import { sampler } from "../../../lookbook/components/samples";
import {
  PageHeader,
  Section,
  SpecimenLabel,
} from "../../../lookbook/components/section";
import { SegmentedConcealedDemo } from "../../../lookbook/components/segmented-concealed-demo";

export default async function SegmentedPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader title="Segmented" tagline="A radio group wearing a track." />

      <Section title="Modes" caption="labels expand on check">
        <Segmented defaultValue="generate" aria-label={s("Options")}>
          <SegmentedItem
            value="generate"
            icon={<Icon icon={AiIcon} />}
            label={s("Generate")}
          />
          <SegmentedItem
            value="video"
            icon={<Icon icon={PreviewIcon} />}
            label={s("Video")}
          />
          <SegmentedItem
            value="image"
            icon={<Icon icon={AddPhotoIcon} />}
            label={s("Image")}
          />
        </Segmented>
      </Section>

      <Section title="Text only" caption="constant track width">
        <Segmented defaultValue="generate" aria-label={s("Options")}>
          <SegmentedItem value="generate" label={s("Generate")} />
          <SegmentedItem value="video" label={s("Video")} />
          <SegmentedItem value="image" label={s("Image")} />
        </Segmented>
      </Section>

      <Section
        title="Marked"
        caption="mark: a dot for an option that wants a look"
      >
        <Segmented defaultValue="generate" aria-label={s("Options")}>
          <SegmentedItem value="generate" label={s("Generate")} />
          <SegmentedItem
            value="video"
            label={s("Video")}
            mark={s("Needs a look")}
          />
          <SegmentedItem value="image" label={s("Image")} />
        </Segmented>
      </Section>

      <Section title="Static" caption="animated={false}">
        <Segmented
          defaultValue="video"
          animated={false}
          aria-label={s("Options")}
        >
          <SegmentedItem
            value="generate"
            icon={<Icon icon={AiIcon} />}
            label={s("Generate")}
          />
          <SegmentedItem
            value="video"
            icon={<Icon icon={PreviewIcon} />}
            label={s("Video")}
          />
        </Segmented>
      </Section>

      <Section title="In a settings row" caption="label + control">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label>{s("Default mode")}</Label>
            <p className="text-caption-quiet text-subtle">
              {s("Applies to new drafts.")}
            </p>
          </div>
          <Segmented defaultValue="video" aria-label={s("Default mode")}>
            <SegmentedItem
              value="generate"
              icon={<Icon icon={AiIcon} />}
              label={s("Generate")}
            />
            <SegmentedItem
              value="video"
              icon={<Icon icon={PreviewIcon} />}
              label={s("Video")}
            />
            <SegmentedItem
              value="image"
              icon={<Icon icon={AddPhotoIcon} />}
              label={s("Image")}
            />
          </Segmented>
        </div>
      </Section>

      <Section
        title="One recipe with Tabs"
        caption="the same track, item and thumb; Tabs places the thumb, Segmented slides it"
      >
        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>Segmented</SpecimenLabel>
            <Segmented defaultValue="small" aria-label={s("Size")}>
              <SegmentedItem value="small" label={s("Small")} />
              <SegmentedItem value="medium" label={s("Medium")} />
              <SegmentedItem value="large" label={s("Large")} />
            </Segmented>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>Tabs, variant="segmented"</SpecimenLabel>
            <Tabs variant="segmented" defaultValue="small">
              <TabsList aria-label={s("Size")}>
                <TabsTrigger value="small">{s("Small")}</TabsTrigger>
                <TabsTrigger value="medium">{s("Medium")}</TabsTrigger>
                <TabsTrigger value="large">{s("Large")}</TabsTrigger>
              </TabsList>
              <TabsContent value="small" />
              <TabsContent value="medium" />
              <TabsContent value="large" />
            </Tabs>
          </div>
        </div>
      </Section>

      <Section
        title="Glyph only"
        caption="32 square, 44 wide on a touch screen"
      >
        <Segmented defaultValue="generate" aria-label={s("Options")}>
          <SegmentedItem
            value="generate"
            icon={<Icon icon={AiIcon} />}
            label={s("Generate")}
            iconOnly
            hint={s("Generate")}
          />
          <SegmentedItem
            value="video"
            icon={<Icon icon={PreviewIcon} />}
            label={s("Video")}
            iconOnly
            hint={s("Video")}
          />
          <SegmentedItem
            value="image"
            icon={<Icon icon={AddPhotoIcon} />}
            label={s("Image")}
            iconOnly
            hint={s("Image")}
          />
        </Segmented>
      </Section>

      <Section
        title="Long labels"
        caption="phrase-length labels belong in a Select; the track scrolls rather than truncates"
      >
        <div className="max-w-xs">
          <Segmented defaultValue="sold-out" aria-label={s("Status")}>
            <SegmentedItem
              value="sold-out"
              label={s("Products that sold out")}
            />
            <SegmentedItem value="active" label={s("Active")} />
            <SegmentedItem value="draft" label={s("Draft")} />
          </Segmented>
        </div>
      </Section>

      <Section
        title="Concealed"
        caption="holds its slot until it can act; a reason is no answer on a phone"
      >
        <SegmentedConcealedDemo
          ariaLabel={s("Options")}
          toggleLabel={s("Store is ready")}
          items={[s("Small"), s("Large")]}
        />
      </Section>

      <Section title="Two tracks" caption="independent state">
        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>icon track</SpecimenLabel>
            <Segmented defaultValue="image" aria-label={s("Options")}>
              <SegmentedItem
                value="generate"
                icon={<Icon icon={AiIcon} />}
                label={s("Generate")}
              />
              <SegmentedItem
                value="video"
                icon={<Icon icon={PreviewIcon} />}
                label={s("Video")}
              />
              <SegmentedItem
                value="image"
                icon={<Icon icon={AddPhotoIcon} />}
                label={s("Image")}
              />
            </Segmented>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <SpecimenLabel>text track</SpecimenLabel>
            <Segmented defaultValue="small" aria-label={s("Size")}>
              <SegmentedItem value="small" label={s("Small")} />
              <SegmentedItem value="medium" label={s("Medium")} />
              <SegmentedItem value="large" label={s("Large")} />
            </Segmented>
          </div>
        </div>
      </Section>
    </>
  );
}
