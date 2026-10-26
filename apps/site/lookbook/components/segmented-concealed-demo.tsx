"use client";

import * as React from "react";

import { Button } from "@sirdab/one/components/button";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";

/* The slot is held while the group is concealed, so the button beside it
   does not move when the group springs in. */
export function SegmentedConcealedDemo({
  ariaLabel,
  toggleLabel,
  items,
}: {
  ariaLabel: string;
  toggleLabel: string;
  items: [string, string];
}): React.JSX.Element {
  const [ready, setReady] = React.useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented defaultValue="a" aria-label={ariaLabel} concealed={!ready}>
        <SegmentedItem value="a" label={items[0]} />
        <SegmentedItem value="b" label={items[1]} />
      </Segmented>
      <Button
        variant="secondary"
        aria-pressed={ready}
        onClick={() => setReady((current) => !current)}
      >
        {toggleLabel}
      </Button>
    </div>
  );
}
