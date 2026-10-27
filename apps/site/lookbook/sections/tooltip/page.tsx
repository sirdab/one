import {
  AddPhotoIcon,
  PencilIcon,
  PreviewIcon,
} from "@sirdab/one/icons/catalogue";
import { CopyIcon, DeleteIcon } from "@sirdab/one/icons/shell";
import { ExternalLinkIcon } from "@sirdab/one/icons/system";
import { Button } from "@sirdab/one/components/button";
import { FilterChip } from "@sirdab/one/components/filter-chip";
import { Icon } from "@sirdab/one/components/icon";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sirdab/one/components/tooltip";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function TooltipPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Tooltip"
        tagline="A hint, never a home for anything essential."
      />

      <Section title="Basic" caption="hover or focus">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={s("Copy link")}>
                <Icon icon={CopyIcon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{s("Copy link")}</TooltipContent>
          </Tooltip>
        </div>
      </Section>

      <Section
        title="Explaining a choice"
        caption="the label names it, the hint says what it does"
      >
        <div className="flex flex-col gap-6">
          <Segmented defaultValue="image" aria-label={s("Default mode")}>
            <SegmentedItem
              value="image"
              icon={<Icon icon={AddPhotoIcon} />}
              label={s("Image")}
              hint={s("A still product photo")}
            />
            <SegmentedItem
              value="video"
              icon={<Icon icon={PreviewIcon} />}
              label={s("Video")}
              hint={s("A short clip, takes longer")}
            />
          </Segmented>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              defaultPressed
              hint={s("Only products on your storefront")}
            >
              {s("Active")}
            </FilterChip>
            <FilterChip hint={s("Not published yet")}>{s("Draft")}</FilterChip>
          </div>
        </div>
      </Section>

      <Section
        title="Long hint"
        caption="capped at 256px and wrapped, never run across the screen"
      >
        <div className="flex min-h-36 items-start">
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <Button variant="secondary">{s("Active")}</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {s(
                "Shows only the products that are live on your storefront right now, not drafts or archived ones",
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </Section>

      <Section title="Placement" caption="physical sides, 8px off the trigger">
        <div className="flex flex-wrap items-center gap-4">
          {(["top", "bottom", "left", "right"] as const).map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger asChild>
                <Button variant="outline">{side}</Button>
              </TooltipTrigger>
              <TooltipContent side={side}>
                {s("View storefront")}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </Section>

      <Section title="In context" caption="a toolbar, one provider">
        <TooltipProvider>
          <div className="border-border flex w-fit items-center gap-1 rounded-lg border p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={s("Edit name")}>
                  <Icon icon={PencilIcon} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{s("Edit name")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={s("Copy link")}>
                  <Icon icon={CopyIcon} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{s("Copy link")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={s("View storefront")}
                >
                  <Icon icon={ExternalLinkIcon} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{s("View storefront")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={s("Delete product")}
                >
                  <Icon icon={DeleteIcon} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{s("Delete product")}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </Section>
    </>
  );
}
