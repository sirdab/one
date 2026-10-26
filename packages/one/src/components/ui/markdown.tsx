"use client";

import * as React from "react";
import { Streamdown, type Components, type ExtraProps } from "streamdown";

import { cn } from "../../lib/utils";

/* The Sirdab markdown: the assistant's reply, rendered while it streams.
   Streamdown underneath (the renderer AI Elements' message is built on; the
   shadcn.io registry has no item for it, the reasoning item imports it
   straight from npm, and so do we) because a model's markdown arrives
   half-written: "**up" must paint as bold-in-progress, never as asterisks,
   and a table must not flash as pipes.

   Trued by owning every element it renders: `components` maps each tag to
   house type roles and tokens, so none of Streamdown's own stock type
   and colour classes are ever needed and the host never adds its
   @source line. Its controls (copy/download/fullscreen on tables and
   code) and its link-safety modal are off: the assistant's links are ours,
   and the host routes them.

   Direction: `dir="auto"` per block, so an English sentence inside an
   Arabic reply ends with its own full stop at the right end. Tables use
   logical alignment (text-start), so they flip with their block. Code is
   always LTR.

   Links: every one goes through `renderLink` when given, so the studio
   can route "/app/orders/..." with its router (and minimize the full-page
   chat to the rail on the way). Pass a STABLE callback (useCallback): a
   new function every render rebuilds the renderer map.

   Variants: `reply` is the answer itself, on the body tier. `aside` is
   text beside the answer (the reasoning summary): one tier down, on the
   caption role and the muted ink, so it never competes with the reply.

   Usage:
       <Markdown streaming={live} renderLink={renderEntityLink}>{text}</Markdown>
       <Markdown variant="aside">{thinking}</Markdown>
*/
interface MarkdownLinkProps {
  href: string;
  children: React.ReactNode;
}

interface MarkdownProps {
  children: string;
  /** Tokens still arriving: incomplete syntax is completed, not shown raw. */
  streaming?: boolean;
  renderLink?(props: MarkdownLinkProps): React.ReactNode;
  variant?: "reply" | "aside";
  className?: string;
}

type Rendered<K extends keyof React.JSX.IntrinsicElements> =
  React.JSX.IntrinsicElements[K] & ExtraProps;

/* Each renderer takes only the props it forwards: Streamdown also hands
   every renderer its hast `node`, which must never reach the DOM. */
function renderers(
  renderLink: MarkdownProps["renderLink"],
  variant: NonNullable<MarkdownProps["variant"]>,
): Components {
  const aside = variant === "aside";
  const text = aside
    ? "text-caption text-muted-foreground"
    : "text-body text-foreground";
  const heading = aside
    ? "text-label text-muted-foreground"
    : "text-heading-xs text-foreground";
  const subheading = aside
    ? "text-caption font-semibold text-muted-foreground"
    : "text-label text-foreground";
  return {
    p: ({ children, dir }: Rendered<"p">) => (
      <p dir={dir} className={text}>
        {children}
      </p>
    ),
    strong: ({ children }: Rendered<"strong">) => (
      <strong
        className={cn(
          "font-semibold",
          aside ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {children}
      </strong>
    ),
    em: ({ children }: Rendered<"em">) => <em>{children}</em>,
    /* Headings step down two levels: a reply lives inside a page that
           already has its own h1/h2, and a model's "# Summary" must not
           outrank the screen's title in the outline or in size. */
    h1: ({ children, dir }: Rendered<"h1">) => (
      <h3 dir={dir} className={heading}>
        {children}
      </h3>
    ),
    h2: ({ children, dir }: Rendered<"h2">) => (
      <h3 dir={dir} className={heading}>
        {children}
      </h3>
    ),
    h3: ({ children, dir }: Rendered<"h3">) => (
      <h4 dir={dir} className={subheading}>
        {children}
      </h4>
    ),
    h4: ({ children, dir }: Rendered<"h4">) => (
      <h4 dir={dir} className={subheading}>
        {children}
      </h4>
    ),
    ul: ({ children, dir }: Rendered<"ul">) => (
      <ul dir={dir} className={cn("flex list-disc flex-col gap-1 ps-5", text)}>
        {children}
      </ul>
    ),
    ol: ({ children, dir }: Rendered<"ol">) => (
      <ol
        dir={dir}
        className={cn("flex list-decimal flex-col gap-1 ps-5", text)}
      >
        {children}
      </ol>
    ),
    li: ({ children, dir }: Rendered<"li">) => (
      <li dir={dir} className="ps-1">
        {children}
      </li>
    ),
    blockquote: ({ children, dir }: Rendered<"blockquote">) => (
      <blockquote
        dir={dir}
        className={cn(
          "border-border text-muted-foreground border-s-2 ps-3",
          aside ? "text-caption" : "text-body",
        )}
      >
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-border" />,
    /* Never an image. Tool results carry shopper-written text into the
           model, and an image tag is a request the browser makes by itself:
           a steered reply could smuggle store data out in its URL. */
    img: () => null,
    a: ({ href, children }: Rendered<"a">) => {
      if (!href) return <>{children}</>;
      if (renderLink) return <>{renderLink({ href, children })}</>;
      return (
        <a href={href} className="text-foreground underline underline-offset-4">
          {children}
        </a>
      );
    },
    table: ({ children }: Rendered<"table">) => (
      <div className="border-border min-w-0 overflow-x-auto rounded-lg border">
        <table
          className={cn(
            "w-full border-collapse",
            aside ? "text-caption" : "text-body",
          )}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: Rendered<"thead">) => (
      <thead className="border-border border-b">{children}</thead>
    ),
    tbody: ({ children }: Rendered<"tbody">) => <tbody>{children}</tbody>,
    tr: ({ children }: Rendered<"tr">) => <tr>{children}</tr>,
    th: ({ children, dir }: Rendered<"th">) => (
      <th
        dir={dir}
        className="text-label text-muted-foreground px-3 py-2 text-start"
      >
        {children}
      </th>
    ),
    td: ({ children, dir }: Rendered<"td">) => (
      <td dir={dir} className="px-3 py-2 text-start align-top">
        {children}
      </td>
    ),
    inlineCode: ({ children }: Rendered<"code">) => (
      <code className="border-border text-caption rounded-sm border px-1 font-mono">
        {children}
      </code>
    ),
    pre: ({ children }: Rendered<"pre">) => (
      <pre
        dir="ltr"
        className="bg-surface-whisper text-caption-quiet overflow-x-auto rounded-lg p-3 font-mono text-foreground"
      >
        {children}
      </pre>
    ),
    code: ({ children, className }: Rendered<"code">) => (
      <code className={className}>{children}</code>
    ),
  };
}

function Markdown({
  children,
  streaming = false,
  renderLink,
  variant = "reply",
  className,
}: MarkdownProps): React.JSX.Element {
  const components = React.useMemo(
    () => renderers(renderLink, variant),
    [renderLink, variant],
  );
  return (
    <div data-slot="markdown" className={cn("min-w-0", className)}>
      <Streamdown
        dir="auto"
        isAnimating={streaming}
        parseIncompleteMarkdown
        controls={false}
        linkSafety={{ enabled: false }}
        components={components}
        className={cn("flex flex-col", variant === "aside" ? "gap-2" : "gap-3")}
      >
        {children}
      </Streamdown>
    </div>
  );
}

export { Markdown };
export type { MarkdownLinkProps, MarkdownProps };
