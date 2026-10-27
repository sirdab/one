import * as React from "react";

import { ChevronDownIcon, PlusCircleIcon } from "@sirdab/one/icons/catalogue";
import { ArrowUpIcon, ArrowUpRightIcon } from "@sirdab/one/icons/general";
import {
  AlertsIcon,
  DeleteIcon,
  FilterIcon,
  PlusIcon,
} from "@sirdab/one/icons/shell";
import { SettingsIcon } from "@sirdab/one/icons/system";
import { Button } from "@sirdab/one/components/button";
import { Icon } from "@sirdab/one/components/icon";
import { TooltipProvider } from "@sirdab/one/components/tooltip";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];

const VARIANTS: {
  variant: ButtonVariant;
  label: string;
  sample: string;
  hover: string;
  active: string;
}[] = [
  {
    variant: "default",
    label: "primary",
    sample: "Save changes",
    hover: "bg-primary-hover",
    active: "bg-primary-active",
  },
  {
    variant: "secondary",
    label: "secondary",
    sample: "Preview",
    hover: "border-btn-border-hover bg-btn-surface-hover",
    active: "border-btn-border-hover bg-btn-surface-active",
  },
  {
    variant: "outline",
    label: "outline",
    sample: "On tinted",
    hover: "border-btn-border-hover bg-btn-surface-hover",
    active: "border-btn-border-hover bg-btn-surface-active",
  },
  {
    variant: "ghost",
    label: "ghost",
    sample: "Cancel",
    hover: "bg-btn-ghost-surface-hover",
    active: "bg-btn-ghost-surface-active",
  },
  {
    variant: "chip",
    label: "chip",
    sample: "Apparel",
    hover: "bg-btn-ghost-surface-hover",
    active: "bg-btn-ghost-surface-active",
  },
  {
    variant: "destructive",
    label: "destructive",
    sample: "Delete account",
    hover: "bg-btn-destructive/10",
    active: "bg-btn-destructive/20",
  },
  {
    variant: "link",
    label: "link",
    sample: "Learn more",
    hover: "underline",
    active: "underline",
  },
];

const COLUMNS = [
  "rest",
  "hover",
  "active",
  "open",
  "disabled",
  "loading",
] as const;

export default async function ButtonsPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Buttons"
        tagline="One component, every action in the product."
      />

      <Section title="State matrix" caption="every cell is live">
        <div className="overflow-x-auto p-1">
          <div
            className="grid min-w-2xl items-center gap-x-4 gap-y-3"

            style={{ gridTemplateColumns: "6rem repeat(6, 1fr)" }}
          >
            <div />
            {COLUMNS.map((column) => (
              <p
                key={column}
                className="text-caption-quiet text-subtle text-center uppercase"
              >
                {column}
              </p>
            ))}

            {VARIANTS.map((row) => (
              <React.Fragment key={row.label}>
                <p className="text-caption-quiet text-subtle">{row.label}</p>
                <div
                  className={
                    row.variant === "outline"
                      ? "bg-surface-rail flex justify-center rounded-lg py-1.5"
                      : "flex justify-center"
                  }
                >
                  <Button variant={row.variant}>{s(row.sample)}</Button>
                </div>
                <div
                  className={
                    row.variant === "outline"
                      ? "bg-surface-rail flex justify-center rounded-lg py-1.5"
                      : "flex justify-center"
                  }
                >
                  <Button variant={row.variant} className={row.hover}>
                    {s(row.sample)}
                  </Button>
                </div>
                <div
                  className={
                    row.variant === "outline"
                      ? "bg-surface-rail flex justify-center rounded-lg py-1.5"
                      : "flex justify-center"
                  }
                >
                  <Button variant={row.variant} className={row.active}>
                    {s(row.sample)}
                  </Button>
                </div>
                <div
                  className={
                    row.variant === "outline"
                      ? "bg-surface-rail flex justify-center rounded-lg py-1.5"
                      : "flex justify-center"
                  }
                >
                  {row.variant === "link" ? (
                    <p className="text-caption-quiet text-subtle">–</p>
                  ) : (
                    <Button variant={row.variant} data-state="open">
                      {s(row.sample)}
                    </Button>
                  )}
                </div>
                <div
                  className={
                    row.variant === "outline"
                      ? "bg-surface-rail flex justify-center rounded-lg py-1.5"
                      : "flex justify-center"
                  }
                >
                  <Button variant={row.variant} disabled>
                    {s(row.sample)}
                  </Button>
                </div>
                <div
                  className={
                    row.variant === "outline"
                      ? "bg-surface-rail flex justify-center rounded-lg py-1.5"
                      : "flex justify-center"
                  }
                >
                  <Button variant={row.variant} loading>
                    {s(row.sample)}
                  </Button>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Sizes × variants" caption="radius rides the size">
        <div className="flex flex-col gap-4">
          {(["default", "secondary", "ghost"] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <Button variant={variant} size="xs">
                Tiny · 24
              </Button>
              <Button variant={variant} size="sm">
                Small · 28
              </Button>
              <Button variant={variant}>Default · 32</Button>
              <Button variant={variant} size="lg">
                Large · 36
              </Button>
              <Button variant={variant} size="xl">
                XL · 40
              </Button>
              <Button variant={variant} size="touch">
                Touch · 44
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Icon-only × variants" caption="ghost is canonical">
        <div className="flex flex-col gap-4">
          {(["default", "secondary", "ghost"] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <p className="text-caption-quiet text-subtle w-24">
                {variant === "default" ? "primary" : variant}
              </p>
              <Button variant={variant} size="icon-xs" aria-label={s("Add")}>
                <Icon icon={PlusIcon} />
              </Button>
              <Button variant={variant} size="icon-sm" aria-label={s("Add")}>
                <Icon icon={PlusIcon} />
              </Button>
              <Button variant={variant} size="icon" aria-label={s("Settings")}>
                <Icon icon={SettingsIcon} />
              </Button>
              <Button variant={variant} size="icon-lg" aria-label={s("Alerts")}>
                <Icon icon={AlertsIcon} />
              </Button>
              <Button variant={variant} size="icon-xl" aria-label={s("Delete")}>
                <Icon icon={DeleteIcon} />
              </Button>
              <Button
                variant={variant}
                size="icon-touch"
                aria-label={s("Delete")}
              >
                <Icon icon={DeleteIcon} />
              </Button>
              <Button
                variant={variant}
                size="icon"
                disabled
                aria-label={s("Add")}
              >
                <Icon icon={PlusIcon} />
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Leading & trailing icons" caption="the pull flips in RTL">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">
              <Icon icon={PlusIcon} />
              Small
            </Button>
            <Button>
              <Icon icon={PlusIcon} />
              Add product
            </Button>
            <Button size="lg">
              <Icon icon={PlusIcon} />
              Create workspace
            </Button>
            <Button size="xl">
              <Icon icon={PlusIcon} />
              Start selling
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary">
              {s("Options")}
              <Icon icon={ChevronDownIcon} />
            </Button>
            <Button variant="secondary" data-state="open">
              {s("Open menu")}
              <Icon icon={ChevronDownIcon} className="rotate-180" />
            </Button>
            <Button variant="ghost">
              {s("Docs")}
              <Icon icon={ArrowUpRightIcon} flip />
            </Button>
            <Button variant="link">
              {s("View storefront")}
              <Icon icon={ArrowUpRightIcon} flip />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="In practice" caption="shipped compositions">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Icon icon={ArrowUpIcon} />
            {s("Generate store")}
          </Button>
          <Button variant="secondary" size="lg">
            <Icon icon={PlusCircleIcon} />
            {s("New collection")}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label={s("Notifications")}
            hint={s("What needs your attention")}
          >
            <Icon icon={AlertsIcon} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label={s("Settings")}
            hint={s("Store settings")}
          >
            <Icon icon={SettingsIcon} />
          </Button>
          <Button variant="chip" size="xl">
            <Icon icon={FilterIcon} />
            {s("Apparel")}
          </Button>
          <Button loading>{s("Generate store")}</Button>
        </div>
      </Section>

      <Section title="In context" caption="a toolbar">
        <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-2">
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={s("Filter")}
                hint={s("Narrow this list")}
              >
                <Icon icon={FilterIcon} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={s("Settings")}
                hint={s("Store settings")}
              >
                <Icon icon={SettingsIcon} />
              </Button>
              <Button variant="chip">{s("Apparel")}</Button>
            </div>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <Button variant="secondary">{s("Preview")}</Button>
            <Button>
              <Icon icon={PlusIcon} />
              {s("Add product")}
            </Button>
          </div>
        </div>
      </Section>

      <Section title="In context" caption="a card footer">
        <div className="border-border bg-card max-w-md rounded-xl border">
          <div className="flex flex-col gap-1 p-4">
            <p className="text-body">{s("New collection")}</p>
            <p className="text-caption-quiet text-subtle">
              {s("Shown on your storefront and receipts.")}
            </p>
          </div>
          <div className="border-border flex items-center justify-end gap-2 border-t p-3">
            <Button variant="ghost">{s("Cancel")}</Button>
            <Button>{s("Save changes")}</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
