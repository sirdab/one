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

export const SECTIONS: Record<
  string,
  (props: { lang: string }) => React.ReactNode | Promise<React.ReactNode>
> = {
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
