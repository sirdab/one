"use client";

import { cn } from "../../lib/utils";
import { ChevronDownIcon } from "../icons/catalogue";
import { ChevronUpIcon } from "../icons/general";
import { Button } from "./button";
import { Icon } from "./icon";

const DISABLED_GLYPH = "disabled:[&_svg]:icon-quiet-disabled";

export function SortArrows({
  index,
  count,
  onMove,
  upLabel,
  downLabel,
  phone = false,
  className,
}: {
  index: number;
  count: number;

  onMove: (index: number, by: number) => void;
  upLabel: string;
  downLabel: string;

  phone?: boolean;
  className?: string;
}) {
  const size = phone ? "icon" : "icon-xs";
  const upDisabled = index === 0;
  const downDisabled = index === count - 1;
  return (
    <div
      data-slot="sort-arrows"
      className={cn(
        "flex shrink-0",
        phone ? "items-center gap-3" : "flex-col pointer-coarse:hidden",
        className,
      )}
    >
      <Button
        variant="ghost"
        size={size}
        aria-label={upLabel}
        disabled={upDisabled}
        className={cn(upDisabled && DISABLED_GLYPH)}
        onClick={() => onMove(index, -1)}
      >
        <Icon icon={ChevronUpIcon} className="icon-quiet" />
      </Button>
      <Button
        variant="ghost"
        size={size}
        aria-label={downLabel}
        disabled={downDisabled}
        className={cn(downDisabled && DISABLED_GLYPH)}
        onClick={() => onMove(index, 1)}
      >
        <Icon icon={ChevronDownIcon} className="icon-quiet" />
      </Button>
    </div>
  );
}
