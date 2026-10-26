import { PackageIcon } from "@sirdab/one/icons/catalogue";
import { CartIcon } from "@sirdab/one/icons/general";
import { AiIcon, HomeIcon } from "@sirdab/one/icons/shell";
import { BarChartIcon } from "@sirdab/one/icons/system";
import { Icon } from "@sirdab/one/components/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@sirdab/one/components/sidebar";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

/* Gallery page: prose and usage live in ./notes.md. */
export default async function SidebarPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const s = sampler(lang);
  const items = [
    { key: "home", label: s("Home"), icon: HomeIcon },
    { key: "orders", label: s("Orders"), icon: CartIcon },
    { key: "products", label: s("Products"), icon: PackageIcon },
    { key: "analytics", label: s("Analytics"), icon: BarChartIcon },
  ];

  function Rail({ active }: { active: string }): React.JSX.Element {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-3">
          <span className="text-label truncate group-data-[collapsible=icon]:opacity-0">
            {s("Alnoor Store")}
          </span>
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <SidebarGroup>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={active === item.key}
                    tooltip={item.label}
                  >
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          {/* A second group under a LABEL rather than a rule: the
                        rail is one list with a differently-named thing after
                        it, not a divided list. The label animates away on
                        collapse, so the icon rail below stays a clean column
                        of glyphs. The rail takes gap-0 and
                        this group pt-0, so the seam is one group's pb-3 and
                        not three helpings of the same space. */}
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel>{s("Workspace")}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={active === "studio"}
                  tooltip={s("Studio")}
                >
                  <Icon icon={AiIcon} />
                  <span>{s("Studio")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  /* The studio's rail. Peeked, the container comes back over the page with
       the popover shadow while the gap stays shut: the trigger next to it
       does not move. Static here; the shell owns the hover and the timer. */
  function OffcanvasRail({
    peek = false,
  }: {
    peek?: boolean;
  }): React.JSX.Element {
    return (
      <Sidebar collapsible="offcanvas" peek={peek}>
        <SidebarContent className="gap-0">
          <SidebarGroup>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton tooltip={item.label}>
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <>
      <PageHeader
        title="Sidebar"
        tagline="The shell's rail: the one tinted structural surface."
      />

      <Section
        title="Expanded"
        caption="256px, the nav recipe at rest and current"
      >
        {/* transform-gpu on every card that mounts a rail: the
                    Offcanvas card below explains why. */}
        <div className="border-border h-80 transform-gpu overflow-hidden rounded-xl border">
          <SidebarProvider className="min-h-full">
            <Rail active="orders" />
            <main className="flex flex-1 items-start p-3">
              <SidebarTrigger />
            </main>
          </SidebarProvider>
        </div>
      </Section>

      <Section title="Collapsed" caption="60px, icons only, labels on hover">
        <div className="border-border h-80 transform-gpu overflow-hidden rounded-xl border">
          <SidebarProvider defaultOpen={false} className="min-h-full">
            <Rail active="home" />
            <main className="flex flex-1 items-start p-3">
              <SidebarTrigger />
            </main>
          </SidebarProvider>
        </div>
      </Section>

      <Section
        title="Offcanvas"
        caption="the rail leaves entirely, for a full-bleed workspace"
      >
        {/* transform-gpu: the containing block for the primitive's
                    FIXED container (the shell does the same on its workspace
                    card), so a rail that comes back on screen floats inside
                    this box and not over the lookbook's own nav. */}
        <div className="border-border h-80 transform-gpu overflow-hidden rounded-xl border">
          <SidebarProvider defaultOpen={false} className="min-h-full">
            <OffcanvasRail />
            <main className="flex flex-1 items-start p-3">
              <SidebarTrigger />
            </main>
          </SidebarProvider>
        </div>
      </Section>

      <Section
        title="Peek"
        caption="offcanvas, hovering the edge: the rail floats in over the page and the layout stays put"
      >
        <div className="border-border h-80 transform-gpu overflow-hidden rounded-xl border">
          <SidebarProvider defaultOpen={false} className="min-h-full">
            <OffcanvasRail peek />
            <main className="flex flex-1 items-start p-3">
              <SidebarTrigger />
            </main>
          </SidebarProvider>
        </div>
      </Section>
    </>
  );
}
