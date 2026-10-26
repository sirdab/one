"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@sirdab/one/lib/utils";

const SECTIONS: { title: string; items: { href: string; label: string }[] }[] =
  [
    {
      title: "Foundations",
      items: [
        { href: "/lookbook/colors", label: "Colors" },
        { href: "/lookbook/typography", label: "Typography" },
        { href: "/lookbook/spacing", label: "Spacing & radius" },
        { href: "/lookbook/breakpoints", label: "Breakpoints" },
        { href: "/lookbook/elevation", label: "Elevation" },
        { href: "/lookbook/motion", label: "Motion" },
        { href: "/lookbook/numerals", label: "Numerals" },
      ],
    },
    {
      title: "Primitives",
      items: [
        { href: "/lookbook/buttons", label: "Buttons" },
        { href: "/lookbook/badge", label: "Badge" },
        { href: "/lookbook/card", label: "Card" },
        { href: "/lookbook/forms", label: "Forms" },
        { href: "/lookbook/inputs", label: "Inputs" },
        { href: "/lookbook/phone-input", label: "Phone input" },
        { href: "/lookbook/textarea", label: "Textarea" },
        { href: "/lookbook/image-uploader", label: "Image uploader" },
        { href: "/lookbook/image-editor", label: "Image editor" },
        { href: "/lookbook/label", label: "Label" },
        { href: "/lookbook/select", label: "Select" },
        { href: "/lookbook/date-picker", label: "Date picker" },
        { href: "/lookbook/popover", label: "Popover" },
        { href: "/lookbook/dialog", label: "Dialog" },
        { href: "/lookbook/sheet", label: "Sheet" },
        { href: "/lookbook/sidebar", label: "Sidebar" },
        { href: "/lookbook/skeleton", label: "Skeleton" },
        { href: "/lookbook/spinner", label: "Spinner" },
        { href: "/lookbook/wave-loader", label: "Wave loader" },
        { href: "/lookbook/avatar", label: "Avatar" },
        { href: "/lookbook/slider", label: "Slider" },
        { href: "/lookbook/progress", label: "Progress" },
        { href: "/lookbook/chart", label: "Chart" },
        { href: "/lookbook/chat-bubble", label: "Chat bubble" },
        { href: "/lookbook/assistant", label: "Assistant" },
        { href: "/lookbook/empty-state", label: "Empty state" },
        { href: "/lookbook/dropdown-menu", label: "Dropdown menu" },
        { href: "/lookbook/command", label: "Command" },
        { href: "/lookbook/combobox", label: "Combobox" },
        { href: "/lookbook/palette", label: "Palette" },
        { href: "/lookbook/prompt-bar", label: "Prompt bar" },
        { href: "/lookbook/tooltip", label: "Tooltip" },
        { href: "/lookbook/toast", label: "Toast" },
        { href: "/lookbook/segmented", label: "Segmented" },
        { href: "/lookbook/toggle", label: "Toggle" },
        { href: "/lookbook/tabs", label: "Tabs" },
        { href: "/lookbook/tables", label: "Tables" },
        { href: "/lookbook/timeline", label: "Timeline" },
        { href: "/lookbook/filter-chip", label: "Filter chip" },
        { href: "/lookbook/selection", label: "Selection" },
        { href: "/lookbook/icons", label: "Icons" },
        { href: "/lookbook/mood-board", label: "Mood board" },
      ],
    },
  ];

// The RAIL nav-row recipe: 32px rows at the 10px radius, 4% fill for
// hover AND current (current adds ink text, no other marker), and rows
// SNAP: no transition class, the instant tier. Section titles sit at
// the body role in the quiet tone.
export function LookbookNav(): React.JSX.Element {
  const pathname = usePathname();
  // Locale rides as a search param (next-intl-free); carry it across
  // section navigation or Arabic review resets to English every click.
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang");
  const suffix = lang && lang !== "en" ? `?lang=${lang}` : "";

  return (
    <nav className="flex flex-col gap-5">
      {SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p className="text-body text-muted-foreground ms-1.5 mb-0.5">
            {section.title}
          </p>
          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={`${item.href}${suffix}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "h-control text-body flex items-center gap-2 rounded-lg px-2",
                    active
                      ? "bg-gray-alpha-100 text-foreground"
                      : "text-muted-foreground hover:bg-gray-alpha-100 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
