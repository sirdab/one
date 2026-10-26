import { SearchIcon } from "@sirdab/one/icons/catalogue";
import { CloseIcon } from "@sirdab/one/icons/shell";
import { Button } from "@sirdab/one/components/button";
import { Icon } from "@sirdab/one/components/icon";
import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sirdab/one/components/popover";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function PopoverPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Popover"
        tagline="The floating surface. Pickers and menus build on it; it is not a control itself."
      />

      <Section title="Panel" caption="the 10px tier">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">{s("Options")}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div className="flex flex-col gap-1.5">
              <Label>{s("Description")}</Label>
              <p className="text-body-quiet text-muted-foreground">
                {s("Shown on your storefront and receipts.")}
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </Section>

      <Section title="Frost" caption="open it over the ink tile">
        <div className="flex flex-col items-start gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">{s("Options")}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="flex flex-col gap-1.5">
                <Label>{s("Description")}</Label>
                <p className="text-body-quiet text-muted-foreground">
                  {s("Shown on your storefront and receipts.")}
                </p>
              </div>
            </PopoverContent>
          </Popover>
          {/* The panel drops over this ink tile: open it and the
                        tile ghosts through the frost. */}
          <div className="flex w-96 flex-col gap-3 rounded-xl bg-foreground p-6">
            <p className="text-heading-sm text-primary-foreground">
              {s("Generate store")}
            </p>
            <p className="text-body-quiet text-primary-foreground">
              {s("Tell customers what makes this product special…")}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Dialog" caption="the 20px filter tier">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">{s("Filter")}</Button>
          </PopoverTrigger>
          <PopoverContent kind="dialog" className="w-96">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-6 ps-2">
                <Label>{s("Category")}</Label>
                <Segmented defaultValue="apparel" aria-label={s("Category")}>
                  <SegmentedItem value="apparel" label={s("Apparel")} />
                  <SegmentedItem value="beauty" label={s("Beauty")} />
                </Segmented>
              </div>
              <div className="flex items-center justify-between gap-6 ps-2">
                <Label>{s("Options")}</Label>
                <Segmented defaultValue="image" aria-label={s("Options")}>
                  <SegmentedItem value="image" label={s("Image")} />
                  <SegmentedItem value="video" label={s("Video")} />
                </Segmented>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mx-auto"
                disabled
              >
                <Icon icon={CloseIcon} />
                {s("Clear")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </Section>

      <Section title="In context" caption="a list toolbar">
        <div className="flex max-w-xl items-center gap-3">
          <Input
            size="search"
            leading={<Icon icon={SearchIcon} />}
            placeholder={s("Search products…")}
            aria-label={s("Search products…")}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="xl">
                {s("Filter")}
              </Button>
            </PopoverTrigger>
            <PopoverContent kind="dialog" align="end" className="w-96">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-6 ps-2">
                  <Label>{s("Category")}</Label>
                  <Segmented defaultValue="apparel" aria-label={s("Category")}>
                    <SegmentedItem value="apparel" label={s("Apparel")} />
                    <SegmentedItem value="perfumes" label={s("Perfumes")} />
                  </Segmented>
                </div>
                <div className="flex items-center justify-between gap-6 ps-2">
                  <Label>{s("Options")}</Label>
                  <Segmented defaultValue="image" aria-label={s("Options")}>
                    <SegmentedItem value="image" label={s("Image")} />
                    <SegmentedItem value="video" label={s("Video")} />
                  </Segmented>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Section>
    </>
  );
}
