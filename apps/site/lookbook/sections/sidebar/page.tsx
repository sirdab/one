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
