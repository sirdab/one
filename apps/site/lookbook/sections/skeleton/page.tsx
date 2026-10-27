import { Skeleton } from "@sirdab/one/components/skeleton";
import { cn } from "@sirdab/one/lib/utils";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function SkeletonPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  return (
    <>
      <PageHeader
        title="Skeleton"
        tagline="The shape of what is loading, in the quiet fill."
      />

      <Section title="Stat card" caption="the value, not the label">
        <div className="border-border bg-card flex flex-col gap-2.5 rounded-lg border p-4">
          <span className="text-caption-quiet text-subtle">
            {s("Sales today")}
          </span>
          <Skeleton className="h-6 w-24" />
        </div>
      </Section>

      <Section title="List rows" caption="mirror the real row's geometry">
        <div className="border-border bg-card rounded-lg border p-4">
          {["w-44", "w-52", "w-36"].map((width) => (
            <div
              key={width}
              className="border-row-divider flex items-center gap-3 border-b py-2.5 last:border-b-0"
            >
              <Skeleton className="size-8 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className={cn("h-3", width)} />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <span className="ms-auto" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
