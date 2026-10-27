import { HomeIcon, ListViewIcon, ProductsIcon } from "@sirdab/one/icons/shell";
import { ExternalLinkIcon } from "@sirdab/one/icons/system";
import { Button } from "@sirdab/one/components/button";
import { Icon } from "@sirdab/one/components/icon";
import { Label } from "@sirdab/one/components/label";
import { RadioGroup, RadioGroupItem } from "@sirdab/one/components/radio-group";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@sirdab/one/components/sheet";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function SheetPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Sheet"
        tagline="The floating drawer: inset, rounded, draggable."
      />

      <Section title="Side panel" caption="side='end', the default">
        <Sheet side="end">
          <SheetTrigger asChild>
            <Button variant="secondary">{s("Pick a delivery time")}</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{s("Pick a delivery time")}</SheetTitle>
              <SheetDescription>
                {s("We'll prepare your order as soon as possible.")}
              </SheetDescription>
            </SheetHeader>
            <RadioGroup
              defaultValue="standard"
              className="flex flex-col gap-2 overflow-y-auto px-4"
            >
              {(
                [
                  {
                    value: "standard",
                    title: s("Standard delivery"),
                    meta: s("Driver assigned now"),
                  },
                  {
                    value: "early",
                    title: "5:00 PM – 5:15 PM",
                    meta: s("Prep starts at 4:45 PM"),
                  },
                  {
                    value: "popular",
                    title: "6:00 PM – 6:15 PM",
                    meta: s("Most popular · High demand"),
                  },
                ] as const
              ).map((slot) => (
                <Label
                  key={slot.value}
                  htmlFor={`slot-${slot.value}`}
                  className="border-border flex-row-reverse items-center justify-between rounded-xl border p-4"
                >
                  <RadioGroupItem
                    id={`slot-${slot.value}`}
                    value={slot.value}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="latin text-body">{slot.title}</span>
                    <span className="text-body-quiet text-muted-foreground">
                      {slot.meta}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="ghost">{s("Cancel")}</Button>
              </SheetClose>
              <SheetClose asChild>
                <Button>{s("Confirm delivery time")}</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Drawer" caption="side='start', the nav shape">
        <Sheet side="start">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-xl" aria-label={s("Options")}>
              <Icon icon={ListViewIcon} />
            </Button>
          </SheetTrigger>
          <SheetContent aria-describedby={undefined}>
            <SheetHeader>
              <SheetTitle>{s("Generate store")}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3">
              <Button variant="ghost" className="w-full justify-start">
                <Icon icon={HomeIcon} />
                {s("Docs")}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon icon={ProductsIcon} />
                {s("Add product")}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon icon={ExternalLinkIcon} />
                {s("View storefront")}
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Bottom tray" caption="side='bottom', drag it">
        <Sheet side="bottom">
          <SheetTrigger asChild>
            <Button variant="secondary">{s("Filter")}</Button>
          </SheetTrigger>
          <SheetContent aria-describedby={undefined}>
            <SheetHeader>
              <SheetTitle>{s("Filter")}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pb-8">
              <div className="flex items-center justify-between gap-6">
                <Label>{s("Category")}</Label>
                <Segmented defaultValue="apparel" aria-label={s("Category")}>
                  <SegmentedItem value="apparel" label={s("Apparel")} />
                  <SegmentedItem value="beauty" label={s("Beauty")} />
                </Segmented>
              </div>
              <div className="flex items-center justify-between gap-6">
                <Label>{s("Size")}</Label>
                <Segmented defaultValue="medium" aria-label={s("Size")}>
                  <SegmentedItem value="small" label={s("Small")} />
                  <SegmentedItem value="medium" label={s("Medium")} />
                </Segmented>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Section>
    </>
  );
}
