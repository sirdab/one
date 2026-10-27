"use client";

import type { ComponentProps } from "react";
import { Avatar } from "./avatar";
import { dealStoreOrbs, storeOrbFor } from "../../lib/store-orbs";

export function StoreAvatar({
  seed,
  storeIds,
  ...props
}: Omit<ComponentProps<typeof Avatar>, "children"> & {
  seed: string;
  storeIds?: readonly string[];
}): React.JSX.Element {
  const src: string =
    (storeIds ? dealStoreOrbs(storeIds).get(seed) : undefined) ??
    storeOrbFor(seed);
  return (
    <Avatar {...props} data-slot="store-avatar" aria-hidden="true">
      <img src={src} alt="" className="block size-full" />
    </Avatar>
  );
}
