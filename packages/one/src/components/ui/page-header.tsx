import * as React from "react";

import { cn } from "../../lib/utils";

type PageHeaderProps = {
  title: React.ReactNode;
  status?: React.ReactNode;
  description?: React.ReactNode;
  lineage?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

function PageHeader({
  title,
  status,
  description,
  lineage,
  actions,
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <header
      data-slot="page-header"
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      {lineage}
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 data-slot="page-header-title" className="text-heading-sm">
              {title}
            </h1>
            {status}
          </div>
          {description ? (
            <p
              data-slot="page-header-description"
              className="text-body-quiet text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div
            data-slot="page-header-actions"
            className="flex flex-wrap items-center gap-2"
          >
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export { PageHeader };
export type { PageHeaderProps };
