import { cn } from "@sirdab/one/lib/utils";

export function PageHeader({
  title,
  tagline,
}: {
  title: string;

  tagline?: string;
}): React.JSX.Element {
  return (
    <header className="flex flex-col gap-1.5" lang="en" dir="ltr">
      <h1 className="text-heading-md">{title}</h1>
      {tagline ? (
        <p className="text-body-quiet text-muted-foreground max-w-xl">
          {tagline}
        </p>
      ) : null}
    </header>
  );
}

export function Section({
  title,
  caption,
  bare = false,
  children,
  className,
}: {
  title: string;

  caption?: string;

  bare?: boolean;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-2.5" lang="en" dir="ltr">
        <h2 className="text-body text-foreground">{title}</h2>
        {caption ? (
          <p className="text-caption-quiet text-subtle">{caption}</p>
        ) : null}
      </div>
      <div
        className={cn(
          !bare && "border-border bg-card rounded-xl border p-6",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SpecimenLabel({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <p className="text-caption-quiet text-subtle">{children}</p>;
}
