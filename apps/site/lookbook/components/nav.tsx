"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { Icon } from "@sirdab/one/components/icon";
import { SearchIcon, ChevronDownIcon } from "@sirdab/one/icons/catalogue";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@sirdab/one/components/collapsible";
import { Input } from "@sirdab/one/components/input";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@sirdab/one/components/sidebar";
import { CATALOG } from "../catalog";
import { filterCatalog, lookbookHref } from "../routing";
import type { LookbookLocale } from "../routing";

export function LookbookNav({
  locale = "ar",
  current,
  onNavigate,
}: {
  locale?: LookbookLocale;
  current?: string;
  onNavigate?: () => void;
}): React.JSX.Element {
  const [query, setQuery] = useState<string>("");
  const groups: typeof CATALOG = filterCatalog(CATALOG, query);
  return (
    <div className="catalog-navigation">
      <div className="catalog-search">
        <div className="catalog-search-field">
          <Input
            type="search"
            size="sm"
            leading={<Icon icon={SearchIcon} />}
            aria-label="Find a component or foundation"
            placeholder="Find a component…"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
              setQuery(event.target.value)
            }
          />
        </div>
      </div>
      <SidebarContent
        className="catalog-scroll no-scrollbar"
        lang="en"
        dir="ltr"
      >
        <nav aria-label="Lookbook sections" className="catalog-groups">
          {groups.map((group: (typeof CATALOG)[number]): React.JSX.Element => (
            <CatalogNavGroup
              key={`${group.title}:${current ?? "overview"}`}
              group={group}
              locale={locale}
              current={current}
              searching={query.trim().length > 0}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
        {groups.length === 0 ? (
          <p role="status" className="text-body-quiet text-muted-foreground">
            No matches. Try “button”, “form”, or “color”.
          </p>
        ) : null}
      </SidebarContent>
    </div>
  );
}

function CatalogNavGroup({
  group,
  locale,
  current,
  searching,
  onNavigate,
}: {
  group: (typeof CATALOG)[number];
  locale: LookbookLocale;
  current?: string;
  searching: boolean;
  onNavigate?: () => void;
}): React.JSX.Element {
  const [open, setOpen] = useState<boolean>(
    (!current && group.title === "Foundations") ||
      group.items.some((item): boolean => item.href === `/lookbook/${current}`),
  );
  return (
    <Collapsible open={searching || open} onOpenChange={setOpen} asChild>
      <SidebarGroup className="catalog-group">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger
            className="catalog-group-trigger"
            disabled={searching}
          >
            {group.title}
            <Icon icon={ChevronDownIcon} />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu className="catalog-group-items">
            {group.items.map((item): React.JSX.Element => {
              const slug: string = item.href.slice("/lookbook/".length);
              return (
                <SidebarMenuItem key={slug}>
                  <SidebarMenuButton asChild isActive={current === slug}>
                    <Link
                      href={lookbookHref(slug, locale)}
                      onClick={onNavigate}
                      aria-current={current === slug ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
