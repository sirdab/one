import { CodeBlock } from "../components/code-block";

const EXAMPLES: Readonly<Record<string, string>> = {
  avatar: `import { StoreAvatar } from "@sirdab/one/components/store-avatar";

<StoreAvatar seed="stable-store-id" size="lg" />

// IDs are ordered oldest first, so new stores keep existing faces stable.
<StoreAvatar seed="store-a" storeIds={["store-a", "store-b"]} />`,
  buttons: `import { Button } from "@sirdab/one/components/button";

<Button>Save changes</Button>
<Button variant="secondary">Preview</Button>
<Button loading>Saving</Button>`,
  card: `import { Card, CardHeader, CardTitle, CardDescription,
  CardContent } from "@sirdab/one/components/card";

<Card>
  <CardHeader>
    <CardTitle>Workspace</CardTitle>
    <CardDescription>A place for your team.</CardDescription>
  </CardHeader>
  <CardContent>Your content</CardContent>
</Card>`,
  inputs: `import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";

<Label htmlFor="name">Workspace name</Label>
<Input id="name" placeholder="Your workspace" />`,
  badge: `import { Badge } from "@sirdab/one/components/badge";

<Badge tone="success">Active</Badge>
<Badge tone="neutral">Closed</Badge>
<Badge variant="outline">Digital</Badge>`,
  selection: `"use client";
import { useState } from "react";
import { Switch } from "@sirdab/one/components/switch";
import { Label } from "@sirdab/one/components/label";

export function Notifications() {
  const [enabled, setEnabled] = useState(false);
  return (
    <Label htmlFor="notifications">
      Team notifications
      <Switch id="notifications" checked={enabled}
        onCheckedChange={setEnabled} />
    </Label>
  );
}`,
  segmented: `"use client";
import { useState } from "react";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";

export function ViewChoice() {
  const [view, setView] = useState("list");
  return (
    <Segmented value={view} onValueChange={setView} aria-label="View">
      <SegmentedItem value="list" label="List" />
      <SegmentedItem value="grid" label="Grid" />
    </Segmented>
  );
}`,
  numerals: `import { formatPrice, formatIdentifier } from "@sirdab/one/foundation";

formatPrice(1250, { locale: "ar" });
formatIdentifier("INV-2026-0042");`,
};

export function UsageExample({
  section,
}: {
  section: string;
}): React.JSX.Element {
  const code: string | undefined = EXAMPLES[section];
  return (
    <section className="usage-example" dir="ltr" lang="en">
      <h2 className="text-heading-xs">Use it in your app</h2>
      {code ? (
        <CodeBlock label={`${section} usage`} code={code} />
      ) : (
        <p className="text-body-quiet text-muted-foreground">
          Explore the working example source for this section, including its
          component imports and composition.
        </p>
      )}
      <a
        href={`https://github.com/sirdab/one/tree/main/apps/site/lookbook/sections/${section}`}
      >
        View examples and notes on GitHub
      </a>
    </section>
  );
}
