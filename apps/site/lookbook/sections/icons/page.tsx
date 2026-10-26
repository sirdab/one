import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@sirdab/one/icons/catalogue";
import * as catalogueIcons from "@sirdab/one/icons/catalogue";
import { ArrowUpRightIcon } from "@sirdab/one/icons/general";
import * as generalIcons from "@sirdab/one/icons/general";
import type { IconComponent } from "@sirdab/one/icons/house-icon";
import {
  AlertsIcon,
  AssistantAuroraIcon,
  DeleteIcon,
  FilterIcon,
  PlusIcon,
} from "@sirdab/one/icons/shell";
import * as shellIcons from "@sirdab/one/icons/shell";
import { ClockIcon, SettingsIcon } from "@sirdab/one/icons/system";
import * as systemIcons from "@sirdab/one/icons/system";
import { Icon } from "@sirdab/one/components/icon";
import { cn } from "@sirdab/one/lib/utils";
import {
  PageHeader,
  Section,
  SpecimenLabel,
} from "../../../lookbook/components/section";

const FLIPPED = [
  { icon: ArrowRightIcon, name: "arrow-right (forward)" },
  { icon: ArrowLeftIcon, name: "arrow-left (back)" },
  { icon: ArrowUpRightIcon, name: "arrow-up-right (external link)" },
  { icon: ChevronRightIcon, name: "chevron-right (go / drill in)" },
] as const;

const FIXED = [
  { icon: SearchIcon, name: "search (symmetric)" },
  { icon: PlusIcon, name: "plus (symmetric)" },
  { icon: AlertsIcon, name: "bell" },
  { icon: SettingsIcon, name: "settings" },
  { icon: DeleteIcon, name: "trash" },
  { icon: CheckIcon, name: "check" },
  { icon: ChevronDownIcon, name: "chevron-down (vertical)" },
  { icon: ClockIcon, name: "clock" },
  { icon: FilterIcon, name: "filter" },
] as const;

/* Every house icon, read off the modules so a new one shows here the moment
   it is exported, by the name a page imports it under. */
const HOUSE_SET: { name: string; icon: IconComponent }[] = Object.entries({
  ...shellIcons,
  ...catalogueIcons,
  ...generalIcons,
  ...systemIcons,
})
  .filter(
    (entry): entry is [string, IconComponent] =>
      entry[0].endsWith("Icon") &&
      typeof entry[1] === "object" &&
      entry[1] !== null,
  )
  .map(([name, icon]) => ({ name, icon }))
  .sort((a, b) => a.name.localeCompare(b.name));

const TONES = [
  { label: "16 · ink", className: "size-4" },
  { label: "16 · quiet", className: "size-4 icon-quiet" },
  { label: "20 · ink", className: "size-5" },
  { label: "20 · quiet", className: "size-5 icon-quiet" },
] as const;

/* The assistant's mark resolves its --aurora-mark-* roles per theme scope,
   so the night stops are only reviewable on a .dark ground. */
const MARK_SCOPES = [
  { label: "light", className: "light" },
  { label: "dark", className: "dark" },
] as const;

const MARK_SIZES = ["size-4", "size-5", "size-10"] as const;

/* Gallery page: prose and usage live in ./notes.md. */
export default function IconsPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Icons"
        tagline="One decision per glyph: does it mirror in RTL?"
      />

      <Section title="Flip" caption="reading direction">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-2">
          {FLIPPED.map((item) => (
            <div
              key={item.name}
              className="h-control border-border flex items-center gap-3 border-b last:border-b-0 sm:nth-last-2:border-b-0"
            >
              <Icon icon={item.icon} flip className="size-4" />
              <p className="latin text-caption-quiet text-subtle">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Never flip" caption="holds still in RTL">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-2">
          {FIXED.map((item) => (
            <div
              key={item.name}
              className="h-control border-border flex items-center gap-3 border-b last:border-b-0 sm:nth-last-2:border-b-0"
            >
              <Icon icon={item.icon} className="size-4" />
              <p className="latin text-caption-quiet text-subtle">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="The house set"
        caption="@sirdab/one/icons; a missing glyph is asked for, never drawn"
      >
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
          {HOUSE_SET.map((item) => (
            <div
              key={item.name}
              className="h-control border-border flex items-center gap-3 border-b"
            >
              <Icon icon={item.icon} className="size-4" />
              <p className="latin text-caption-quiet text-subtle">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Assistant mark" caption="pink into violet, per scope">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MARK_SCOPES.map((scope) => (
            <div
              key={scope.label}
              className={cn(
                scope.className,
                "border-border flex flex-col items-start gap-3 rounded-lg border bg-background p-4 text-foreground",
              )}
            >
              <SpecimenLabel>{scope.label}</SpecimenLabel>
              <div className="flex items-end gap-4">
                {MARK_SIZES.map((size) => (
                  <Icon
                    key={size}
                    icon={AssistantAuroraIcon}
                    className={size}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Size and tone" caption="icon-quiet, never alpha ink">
        <div className="flex flex-wrap items-start gap-8">
          {TONES.map((tone) => (
            <div key={tone.label} className="flex flex-col items-start gap-2">
              <SpecimenLabel>{tone.label}</SpecimenLabel>
              <div className="flex items-center gap-3">
                <Icon icon={SearchIcon} className={tone.className} />
                <Icon icon={AlertsIcon} className={tone.className} />
                <Icon icon={SettingsIcon} className={tone.className} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
