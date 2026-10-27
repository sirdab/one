export type CatalogGroup = {
  title: string;
  items: { href: string; label: string }[];
};

export const CATALOG: CatalogGroup[] = [
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
    title: "Components",
    items: [
      { href: "/lookbook/buttons", label: "Buttons" },
      { href: "/lookbook/badge", label: "Badge" },
      { href: "/lookbook/card", label: "Card" },
      { href: "/lookbook/avatar", label: "Avatar" },
      { href: "/lookbook/icons", label: "Icons" },
      { href: "/lookbook/segmented", label: "Segmented" },
      { href: "/lookbook/toggle", label: "Toggle" },
      { href: "/lookbook/tabs", label: "Tabs" },
    ],
  },
  {
    title: "Forms & inputs",
    items: [
      { href: "/lookbook/forms", label: "Forms" },
      { href: "/lookbook/inputs", label: "Inputs" },
      { href: "/lookbook/phone-input", label: "Phone input" },
      { href: "/lookbook/textarea", label: "Textarea" },
      { href: "/lookbook/label", label: "Label" },
      { href: "/lookbook/select", label: "Select" },
      { href: "/lookbook/combobox", label: "Combobox" },
      { href: "/lookbook/date-picker", label: "Date picker" },
      { href: "/lookbook/slider", label: "Slider" },
      { href: "/lookbook/image-uploader", label: "Image uploader" },
      { href: "/lookbook/image-editor", label: "Image editor" },
      { href: "/lookbook/selection", label: "Selection" },
    ],
  },
  {
    title: "Navigation & overlays",
    items: [
      { href: "/lookbook/sidebar", label: "Sidebar" },
      { href: "/lookbook/dropdown-menu", label: "Dropdown menu" },
      { href: "/lookbook/command", label: "Command" },
      { href: "/lookbook/palette", label: "Palette" },
      { href: "/lookbook/popover", label: "Popover" },
      { href: "/lookbook/dialog", label: "Dialog" },
      { href: "/lookbook/sheet", label: "Sheet" },
      { href: "/lookbook/tooltip", label: "Tooltip" },
    ],
  },
  {
    title: "Data & feedback",
    items: [
      { href: "/lookbook/tables", label: "Tables" },
      { href: "/lookbook/chart", label: "Chart" },
      { href: "/lookbook/timeline", label: "Timeline" },
      { href: "/lookbook/filter-chip", label: "Filter chip" },
      { href: "/lookbook/progress", label: "Progress" },
      { href: "/lookbook/skeleton", label: "Skeleton" },
      { href: "/lookbook/spinner", label: "Spinner" },
      { href: "/lookbook/wave-loader", label: "Wave loader" },
      { href: "/lookbook/empty-state", label: "Empty state" },
      { href: "/lookbook/toast", label: "Toast" },
    ],
  },
  {
    title: "Compositions",
    items: [
      { href: "/lookbook/chat-bubble", label: "Chat bubble" },
      { href: "/lookbook/assistant", label: "Assistant" },
      { href: "/lookbook/prompt-bar", label: "Prompt bar" },
      { href: "/lookbook/mood-board", label: "Mood board" },
    ],
  },
];
