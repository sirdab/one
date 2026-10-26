import { cn } from "@sirdab/one/lib/utils";

/* The lookbook is a GALLERY, not documentation: pages show, they do not
   explain. Text budget: a page gets a title and at most one short
   tagline; a section gets a quiet title and at most a few-word caption.
   Everything longer (doctrine, rationale, usage snippets) lives in the
   page folder's notes.md (never rendered) and in the component header
   comments, which stay canonical. */

export function PageHeader({
  title,
  tagline,
}: {
  title: string;
  /** One short line, optional. Anything longer belongs in notes.md. */
  tagline?: string;
}): React.JSX.Element {
  return (
    <header className="flex flex-col gap-1.5">
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
  /** A few words at most, rendered beside the title. */
  caption?: string;
  /** Drop the card canvas for demos that bring their own surface. */
  bare?: boolean;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-2.5">
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
