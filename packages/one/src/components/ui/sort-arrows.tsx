"use client";

import { cn } from "../../lib/utils";
import { ChevronDownIcon } from "../icons/catalogue";
import { ChevronUpIcon } from "../icons/general";
import { Button } from "./button";
import { Icon } from "./icon";

/* The ghost variant re-applies icon-quiet to a disabled button's glyph with
   a selector (button:disabled svg) that no class on the svg can outrank, so
   the disabled tone is asked for on the button, on that same selector, and
   wins by coming after it. */
const DISABLED_GLYPH = "disabled:[&_svg]:icon-quiet-disabled";

/* The Sirdab sort arrows: a row's move up and move down as visible buttons,
   beside its drag grip, for anyone who would rather press than carry (and
   for a merchant who never guessed the grip drags). Two 24px ghost
   squares stacked beside the grip. The top row cannot go up and the last
   cannot go down, so those are disabled, not hidden: the pair keeps its
   shape down the whole list.

   The stacked pair is for a fine pointer and hides itself on a coarse one:
   two stacked 24px buttons cannot each get a 44px tap area without the top
   one losing half of its to the bottom one. `phone` is the pair for a
   finger: side by side at the 32px icon size, 12px apart (gap-3), so the
   44px hit area every Button's touch-target centres on it ends exactly
   where its neighbour's begins and a tap on one edge cannot land on the
   other. A finger that cannot hover still has a control, and drag is never
   the only way to reorder. The phone pair does not hide itself, so the
   caller shows it where the pointer is coarse (the options editor's
   in-row controls) and keeps its own gap between the pair and the grip.

   Usage, with useSortable:
       <SortArrows
           index={i}
           count={items.length}
           onMove={sortable.moveBy}
           upLabel={`Move ${name} up`}
           downLabel={`Move ${name} down`}
       />
*/
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
  /** useSortable's moveBy: (index, -1) up, (index, 1) down. */
  onMove: (index: number, by: number) => void;
  upLabel: string;
  downLabel: string;
  /** The finger's pair: side by side at the icon size, 12px apart, and
        not hidden on a coarse pointer. */
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
