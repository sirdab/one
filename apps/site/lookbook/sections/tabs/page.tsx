import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sirdab/one/components/tabs";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function TabsPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader title="Tabs" tagline="Panels of content under one heading." />

      <Section
        title="Underline"
        caption="page tabs: sliding ink underline, pill from lg"
      >
        <Tabs defaultValue="apparel">
          <TabsList aria-label={s("Category")}>
            <TabsTrigger value="apparel">{s("Apparel")}</TabsTrigger>
            <TabsTrigger value="beauty">{s("Beauty")}</TabsTrigger>
            <TabsTrigger value="perfumes">{s("Perfumes")}</TabsTrigger>
          </TabsList>
          <TabsContent value="apparel">
            <p className="text-body-quiet text-muted-foreground py-4">
              {s("Shown on your storefront and receipts.")}
            </p>
          </TabsContent>
          <TabsContent value="beauty">
            <p className="text-body-quiet text-muted-foreground py-4">
              {s("Tell customers what makes this product special…")}
            </p>
          </TabsContent>
          <TabsContent value="perfumes">
            <p className="text-body-quiet text-muted-foreground py-4">
              {s("Your storefront is being generated.")}
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        title="Segmented"
        caption="the Segmented control's recipe: wash track, white thumb placed on the active tab"
      >
        <Tabs variant="segmented" defaultValue="settings">
          <TabsList aria-label={s("Options")}>
            <TabsTrigger value="settings">{s("Settings")}</TabsTrigger>
            <TabsTrigger value="notifications">
              {s("Notifications")}
            </TabsTrigger>
            <TabsTrigger value="alerts">{s("Alerts")}</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <p className="text-body-quiet text-muted-foreground py-4">
              {s("Applies to new drafts.")}
            </p>
          </TabsContent>
          <TabsContent value="notifications">
            <p className="text-body-quiet text-muted-foreground py-4">
              {s("Shown on your storefront and receipts.")}
            </p>
          </TabsContent>
          <TabsContent value="alerts">
            <p className="text-body-quiet text-muted-foreground py-4">
              {s("Applies to new drafts.")}
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        title="Segmented, long labels"
        caption="phrase-length labels belong in a Select; the track scrolls rather than truncates"
      >
        <div className="max-w-xs">
          <Tabs variant="segmented" defaultValue="sold-out">
            <TabsList aria-label={s("Status")}>
              <TabsTrigger value="sold-out">
                {s("Products that sold out")}
              </TabsTrigger>
              <TabsTrigger value="active">{s("Active")}</TabsTrigger>
              <TabsTrigger value="draft">{s("Draft")}</TabsTrigger>
            </TabsList>
            <TabsContent value="sold-out" />
            <TabsContent value="active" />
            <TabsContent value="draft" />
          </Tabs>
        </div>
      </Section>

      <Section title="In context" caption="tabs over a list">
        <Tabs defaultValue="all" className="max-w-md">
          <TabsList aria-label={s("Filter")}>
            <TabsTrigger value="all">{s("Options")}</TabsTrigger>
            <TabsTrigger value="drafts">{s("Docs")}</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="divide-border divide-y">
              {[
                s("Leather tote bag"),
                s("New collection"),
                s("New product"),
              ].map((row) => (
                <div key={row} className="h-row flex items-center">
                  <p className="text-body">{row}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="drafts">
            <div className="divide-border divide-y">
              <div className="h-row flex items-center">
                <p className="text-body">{s("New product")}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
