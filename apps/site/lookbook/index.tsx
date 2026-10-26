import Link from "next/link";
import { Direction } from "radix-ui";

import { Toaster } from "@sirdab/one/components/sonner";
import { LocaleSwitcher } from "./components/locale-switcher";
import { LookbookNav } from "./components/nav";
import { ThemeToggle } from "./components/theme-toggle";
import AssistantPage from "./sections/assistant/page";
import AvatarPage from "./sections/avatar/page";
import BadgePage from "./sections/badge/page";
import BreakpointsPage from "./sections/breakpoints/page";
import ButtonsPage from "./sections/buttons/page";
import CardPage from "./sections/card/page";
import ChartPage from "./sections/chart/page";
import ChatBubblePage from "./sections/chat-bubble/page";
import ColorsPage from "./sections/colors/page";
import ComboboxPage from "./sections/combobox/page";
import CommandPage from "./sections/command/page";
import DatePickerPage from "./sections/date-picker/page";
import DialogPage from "./sections/dialog/page";
import DropdownMenuPage from "./sections/dropdown-menu/page";
import ElevationPage from "./sections/elevation/page";
import EmptyStatePage from "./sections/empty-state/page";
import FilterChipPage from "./sections/filter-chip/page";
import FormsPage from "./sections/forms/page";
import IconsPage from "./sections/icons/page";
import ImageEditorPage from "./sections/image-editor/page";
import ImageUploaderPage from "./sections/image-uploader/page";
import InputsPage from "./sections/inputs/page";
import LabelPage from "./sections/label/page";
import MoodBoardPage from "./sections/mood-board/page";
import MotionPage from "./sections/motion/page";
import NumeralsPage from "./sections/numerals/page";
import LookbookIndexPage from "./sections/page";
import PalettePage from "./sections/palette/page";
import PhoneInputPage from "./sections/phone-input/page";
import PopoverPage from "./sections/popover/page";
import ProgressPage from "./sections/progress/page";
import PromptBarPage from "./sections/prompt-bar/page";
import SegmentedPage from "./sections/segmented/page";
import SelectPage from "./sections/select/page";
import SelectionPage from "./sections/selection/page";
import SheetPage from "./sections/sheet/page";
import SidebarPage from "./sections/sidebar/page";
import SkeletonPage from "./sections/skeleton/page";
import SliderPage from "./sections/slider/page";
import SpacingPage from "./sections/spacing/page";
import SpinnerPage from "./sections/spinner/page";
import TablesPage from "./sections/tables/page";
import TabsPage from "./sections/tabs/page";
import TextareaPage from "./sections/textarea/page";
import TimelinePage from "./sections/timeline/page";
import ToastPage from "./sections/toast/page";
import TogglePage from "./sections/toggle/page";
import TooltipPage from "./sections/tooltip/page";
import TypographyPage from "./sections/typography/page";
import WaveLoaderPage from "./sections/wave-loader/page";

const enabled =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_ENABLE_LOOKBOOK === "1";

const SECTIONS: Record<string, React.ElementType> = {
  assistant: AssistantPage,
  badge: BadgePage,
  breakpoints: BreakpointsPage,
  buttons: ButtonsPage,
  card: CardPage,
  chart: ChartPage,
  "chat-bubble": ChatBubblePage,
  colors: ColorsPage,
  command: CommandPage,
  "date-picker": DatePickerPage,
  dialog: DialogPage,
  "dropdown-menu": DropdownMenuPage,
  elevation: ElevationPage,
  "empty-state": EmptyStatePage,
  "filter-chip": FilterChipPage,
  forms: FormsPage,
  icons: IconsPage,
  inputs: InputsPage,
  label: LabelPage,
  "mood-board": MoodBoardPage,
  motion: MotionPage,
  numerals: NumeralsPage,
  palette: PalettePage,
  "phone-input": PhoneInputPage,
  popover: PopoverPage,
  combobox: ComboboxPage,
  progress: ProgressPage,
  "prompt-bar": PromptBarPage,
  segmented: SegmentedPage,
  toggle: TogglePage,
  select: SelectPage,
  selection: SelectionPage,
  sheet: SheetPage,
  sidebar: SidebarPage,
  skeleton: SkeletonPage,
  spacing: SpacingPage,
  "image-editor": ImageEditorPage,
  "image-uploader": ImageUploaderPage,
  spinner: SpinnerPage,
  "wave-loader": WaveLoaderPage,
  tables: TablesPage,
  tabs: TabsPage,
  textarea: TextareaPage,
  avatar: AvatarPage,
  slider: SliderPage,
  timeline: TimelinePage,
  toast: ToastPage,
  tooltip: TooltipPage,
  typography: TypographyPage,
};

export function LookbookPage({
  slug,
  lang,
}: {
  slug?: string[];
  lang?: string;
}): React.JSX.Element {
  if (!enabled) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-body-quiet text-muted-foreground">
          404: Lookbook is not available here.
        </p>
      </main>
    );
  }

  const locale = lang ?? "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const key = slug?.length === 1 ? slug[0] : undefined;
  const Section =
    (key != null && Object.hasOwn(SECTIONS, key) ? SECTIONS[key] : undefined) ??
    LookbookIndexPage;

  return (
    <Direction.Provider dir={dir}>
      <Toaster />
      <div className="flex min-h-dvh w-full" dir={dir}>
        <aside className="border-border bg-surface-rail sticky top-0 flex h-dvh w-64 shrink-0 flex-col overflow-hidden border-e">
          <div className="flex h-12 shrink-0 items-center px-5">
            <Link
              href={`/lookbook${locale === "en" ? "" : `?lang=${locale}`}`}
              className="text-heading-xs"
            >
              Lookbook
            </Link>
          </div>
          <div className="mt-2 flex shrink-0 flex-col items-start gap-2 px-3.5">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
          <div
            className="no-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto p-3 pt-0"
            style={{
              mask: "linear-gradient(transparent, #fff 8px, #fff 100%)",
            }}
          >
            <LookbookNav />
          </div>
        </aside>
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 p-8">
            <Section lang={locale} />
          </div>
        </main>
      </div>
    </Direction.Provider>
  );
}
