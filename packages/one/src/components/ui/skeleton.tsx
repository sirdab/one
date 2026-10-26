import { cn } from "../../lib/utils";

/* The Sirdab Skeleton. Stock shadcn structure; the fill is --muted (the
   quiet fill for icon wells, skeletons, chips, TOKENS.md lookup), not
   shadcn's --accent, which is a shadcn-compat alias we never paint. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
