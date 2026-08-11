// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { IconName } from "../../../types/icon";
import { PlusIcon } from "../PlusIcon";
import { AddCircleIcon } from "./AddCircleIcon";
import { AddCircleOutlineIcon } from "./AddCircleOutlineIcon";
import { AlertCircleIcon } from "./AlertCircleIcon";
import { AlertCircleOutlineIcon } from "./AlertCircleOutlineIcon";
import { ArrowForwardIcon } from "./ArrowForwardIcon";
import { BandageOutlineIcon } from "./BandageOutlineIcon";
import { BarbellIcon } from "./BarbellIcon";
import { BarbellOutlineIcon } from "./BarbellOutlineIcon";
import { BallIcon } from "../BallIcon";
import { BookOutlineIcon } from "./BookOutlineIcon";
import { BulbOutlineIcon } from "./BulbOutlineIcon";
import { CalculatorOutlineIcon } from "./CalculatorOutlineIcon";
import { CalendarOutlineIcon } from "./CalendarOutlineIcon";
import { CameraOutlineIcon } from "./CameraOutlineIcon";
import { CardOutlineIcon } from "./CardOutlineIcon";
import { CheckboxIcon } from "./CheckboxIcon";
import { CheckmarkIcon } from "../CheckmarkIcon";
import { CheckmarkCircleIcon } from "./CheckmarkCircleIcon";
import { CheckmarkCircleOutlineIcon } from "./CheckmarkCircleOutlineIcon";
import { ChevronBackIcon } from "./ChevronBackIcon";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { ChevronForwardIcon } from "./ChevronForwardIcon";
import { ChevronUpIcon } from "./ChevronUpIcon";
import { ClipboardOutlineIcon } from "./ClipboardOutlineIcon";
import { CloseIcon } from "../CloseIcon";
import { CloseCircleIcon } from "./CloseCircleIcon";
import { CopyOutlineIcon } from "./CopyOutlineIcon";
import { CreateOutlineIcon } from "./CreateOutlineIcon";
import { CutOutlineIcon } from "./CutOutlineIcon";
import { DocumentTextIcon } from "./DocumentTextIcon";
import { DocumentTextOutlineIcon } from "./DocumentTextOutlineIcon";
import { EllipseIcon } from "./EllipseIcon";
import { EllipseOutlineIcon } from "./EllipseOutlineIcon";
import { EllipsisHorizontalCircleOutlineIcon } from "./EllipsisHorizontalCircleOutlineIcon";
import { EyeOutlineIcon } from "./EyeOutlineIcon";
import { FitnessOutlineIcon } from "./FitnessOutlineIcon";
import { FlagIcon } from "./FlagIcon";
import { FlagOutlineIcon } from "./FlagOutlineIcon";
import { FlameIcon } from "./FlameIcon";
import { FlameOutlineIcon } from "./FlameOutlineIcon";
import { HandRightOutlineIcon } from "./HandRightOutlineIcon";
import { HappyIcon } from "./HappyIcon";
import { HappyOutlineIcon } from "./HappyOutlineIcon";
import { HelpCircleOutlineIcon } from "./HelpCircleOutlineIcon";
import { ImagesOutlineIcon } from "./ImagesOutlineIcon";
import { InformationCircleIcon } from "./InformationCircleIcon";
import { ListOutlineIcon } from "./ListOutlineIcon";
import { LockClosedIcon } from "./LockClosedIcon";
import { MailOutlineIcon } from "./MailOutlineIcon";
import { MedkitIcon } from "./MedkitIcon";
import { MegaphoneIcon } from "./MegaphoneIcon";
import { MenuOutlineIcon } from "./MenuOutlineIcon";
import { MoonIcon } from "./MoonIcon";
import { PencilIcon } from "./PencilIcon";
import { PencilOutlineIcon } from "./PencilOutlineIcon";
import { PeopleIcon } from "./PeopleIcon";
import { PeopleOutlineIcon } from "./PeopleOutlineIcon";
import { PersonAddIcon } from "./PersonAddIcon";
import { PersonOutlineIcon } from "./PersonOutlineIcon";
import { PlayIcon } from "./PlayIcon";
import { ReceiptOutlineIcon } from "./ReceiptOutlineIcon";
import { RefreshIcon } from "./RefreshIcon";
import { MinusIcon } from "../MinusIcon";
import { RemoveCircleIcon } from "./RemoveCircleIcon";
import { RibbonIcon } from "./RibbonIcon";
import { RibbonOutlineIcon } from "./RibbonOutlineIcon";
import { SadIcon } from "./SadIcon";
import { SadOutlineIcon } from "./SadOutlineIcon";
import { SearchIcon } from "./SearchIcon";
import { SearchOutlineIcon } from "./SearchOutlineIcon";
import { SettingsOutlineIcon } from "./SettingsOutlineIcon";
import { ShareOutlineIcon } from "./ShareOutlineIcon";
import { ShieldHalfOutlineIcon } from "./ShieldHalfOutlineIcon";
import { ShieldOutlineIcon } from "./ShieldOutlineIcon";
import { SparklesIcon } from "./SparklesIcon";
import { SparklesOutlineIcon } from "./SparklesOutlineIcon";
import { SquareOutlineIcon } from "./SquareOutlineIcon";
import { StarIcon } from "./StarIcon";
import { StarOutlineIcon } from "./StarOutlineIcon";
import { StatsChartIcon } from "./StatsChartIcon";
import { StatsChartOutlineIcon } from "./StatsChartOutlineIcon";
import { TicketOutlineIcon } from "./TicketOutlineIcon";
import { TimeOutlineIcon } from "./TimeOutlineIcon";
import { TimerOutlineIcon } from "./TimerOutlineIcon";
import { TrashOutlineIcon } from "./TrashOutlineIcon";
import { TrendingDownIcon } from "./TrendingDownIcon";
import { TrendingUpIcon } from "./TrendingUpIcon";
import { TrophyIcon } from "./TrophyIcon";
import { TrophyOutlineIcon } from "./TrophyOutlineIcon";
import { VideocamIcon } from "./VideocamIcon";
import { VolumeHighIcon } from "./VolumeHighIcon";
import { VolumeMuteIcon } from "./VolumeMuteIcon";
import { WalkOutlineIcon } from "./WalkOutlineIcon";
import { WarningOutlineIcon } from "./WarningOutlineIcon";

type IconComponent = (props: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) => React.JSX.Element;

export const SOLAR_ICONS: Record<IconName, IconComponent> = {
  add: PlusIcon,
  "add-circle": AddCircleIcon,
  "add-circle-outline": AddCircleOutlineIcon,
  "alert-circle": AlertCircleIcon,
  "alert-circle-outline": AlertCircleOutlineIcon,
  "arrow-forward": ArrowForwardIcon,
  "bandage-outline": BandageOutlineIcon,
  barbell: BarbellIcon,
  "barbell-outline": BarbellOutlineIcon,
  baseball: BallIcon,
  "baseball-outline": BallIcon,
  "book-outline": BookOutlineIcon,
  "bulb-outline": BulbOutlineIcon,
  "calculator-outline": CalculatorOutlineIcon,
  "calendar-outline": CalendarOutlineIcon,
  "camera-outline": CameraOutlineIcon,
  "card-outline": CardOutlineIcon,
  checkbox: CheckboxIcon,
  checkmark: CheckmarkIcon,
  "checkmark-circle": CheckmarkCircleIcon,
  "checkmark-circle-outline": CheckmarkCircleOutlineIcon,
  "chevron-back": ChevronBackIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-forward": ChevronForwardIcon,
  "chevron-up": ChevronUpIcon,
  "clipboard-outline": ClipboardOutlineIcon,
  close: CloseIcon,
  "close-circle": CloseCircleIcon,
  "copy-outline": CopyOutlineIcon,
  "create-outline": CreateOutlineIcon,
  "cut-outline": CutOutlineIcon,
  "document-text": DocumentTextIcon,
  "document-text-outline": DocumentTextOutlineIcon,
  ellipse: EllipseIcon,
  "ellipse-outline": EllipseOutlineIcon,
  "ellipsis-horizontal-circle-outline": EllipsisHorizontalCircleOutlineIcon,
  "eye-outline": EyeOutlineIcon,
  "fitness-outline": FitnessOutlineIcon,
  flag: FlagIcon,
  "flag-outline": FlagOutlineIcon,
  flame: FlameIcon,
  "flame-outline": FlameOutlineIcon,
  "hand-right-outline": HandRightOutlineIcon,
  happy: HappyIcon,
  "happy-outline": HappyOutlineIcon,
  "help-circle-outline": HelpCircleOutlineIcon,
  "images-outline": ImagesOutlineIcon,
  "information-circle": InformationCircleIcon,
  "list-outline": ListOutlineIcon,
  "lock-closed": LockClosedIcon,
  "mail-outline": MailOutlineIcon,
  medkit: MedkitIcon,
  megaphone: MegaphoneIcon,
  "menu-outline": MenuOutlineIcon,
  moon: MoonIcon,
  pencil: PencilIcon,
  "pencil-outline": PencilOutlineIcon,
  people: PeopleIcon,
  "people-outline": PeopleOutlineIcon,
  "person-add": PersonAddIcon,
  "person-outline": PersonOutlineIcon,
  play: PlayIcon,
  "receipt-outline": ReceiptOutlineIcon,
  refresh: RefreshIcon,
  remove: MinusIcon,
  "remove-circle": RemoveCircleIcon,
  ribbon: RibbonIcon,
  "ribbon-outline": RibbonOutlineIcon,
  sad: SadIcon,
  "sad-outline": SadOutlineIcon,
  search: SearchIcon,
  "search-outline": SearchOutlineIcon,
  "settings-outline": SettingsOutlineIcon,
  "share-outline": ShareOutlineIcon,
  "shield-half-outline": ShieldHalfOutlineIcon,
  "shield-outline": ShieldOutlineIcon,
  sparkles: SparklesIcon,
  "sparkles-outline": SparklesOutlineIcon,
  "square-outline": SquareOutlineIcon,
  star: StarIcon,
  "star-outline": StarOutlineIcon,
  "stats-chart": StatsChartIcon,
  "stats-chart-outline": StatsChartOutlineIcon,
  "ticket-outline": TicketOutlineIcon,
  "time-outline": TimeOutlineIcon,
  "timer-outline": TimerOutlineIcon,
  "trash-outline": TrashOutlineIcon,
  "trending-down": TrendingDownIcon,
  "trending-up": TrendingUpIcon,
  trophy: TrophyIcon,
  "trophy-outline": TrophyOutlineIcon,
  videocam: VideocamIcon,
  "volume-high": VolumeHighIcon,
  "volume-mute": VolumeMuteIcon,
  "walk-outline": WalkOutlineIcon,
  "warning-outline": WarningOutlineIcon,
};
