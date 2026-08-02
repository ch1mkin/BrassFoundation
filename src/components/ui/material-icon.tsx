"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BookMarked,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileEdit,
  Gavel,
  GraduationCap,
  HandHeart,
  History,
  Home,
  LayoutDashboard,
  Library,
  Lock,
  LogOut,
  Mail,
  Menu,
  Mic,
  Newspaper,
  Network,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Languages,
  MoveRight,
  UserPlus,
  Users,
  UsersRound,
  Eye,
  Rocket,
  Image as ImageIcon,
  Globe,
  HelpCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Map Material Symbol ligature names → Lucide icons.
 * Lucide ships with the app (no external font), so icons always render.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  groups: Users,
  group: Users,
  event: Calendar,
  library_books: Library,
  menu_book: BookOpen,
  history_edu: GraduationCap,
  gavel: Gavel,
  mic: Mic,
  school: GraduationCap,
  visibility: Eye,
  rocket_launch: Rocket,
  auto_stories: BookMarked,
  person_add: UserPlus,
  download: Download,
  lock: Lock,
  check_circle: CheckCircle2,
  arrow_forward: ArrowRight,
  arrow_right_alt: ArrowRight,
  trending_flat: MoveRight,
  location_on: Home,
  videocam: Activity,
  star: Star,
  mail: Mail,
  send: ArrowRight,
  dashboard: LayoutDashboard,
  badge: BadgeCheck,
  payments: CircleDollarSign,
  volunteer_activism: HandHeart,
  storefront: Store,
  article: Newspaper,
  newspaper: Newspaper,
  web: Globe,
  translate: Languages,
  bar_chart: BarChart3,
  edit_note: FileEdit,
  diversity_3: UsersRound,
  photo_library: ImageIcon,
  account_tree: Network,
  manage_accounts: Shield,
  admin_panel_settings: Shield,
  analytics: Activity,
  history: History,
  settings: Settings,
  logout: LogOut,
  menu: Menu,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  shopping_bag: ShoppingBag,
  sparkles: Sparkles,
  help: HelpCircle,
  close: X,
  open_in_new: ExternalLink,
};

function sizeFromClass(className?: string) {
  if (!className) return 22;
  if (className.includes("text-6xl") || className.includes("text-[64px]"))
    return 64;
  if (className.includes("text-5xl")) return 48;
  if (className.includes("text-4xl")) return 36;
  if (className.includes("text-3xl")) return 30;
  if (className.includes("text-2xl")) return 24;
  if (className.includes("text-[20px]")) return 20;
  if (className.includes("text-[18px]")) return 18;
  if (className.includes("text-base")) return 16;
  return 22;
}

export function MaterialIcon({
  name,
  className,
  label,
}: {
  name: string;
  className?: string;
  label?: string;
}) {
  const key = (name || "").trim();
  const Icon = ICON_MAP[key] || HelpCircle;
  const px = sizeFromClass(className);

  return (
    <span
      className={cn("notranslate inline-flex shrink-0 items-center justify-center", className)}
      translate="no"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      data-icon={key}
    >
      <Icon size={px} strokeWidth={1.75} absoluteStrokeWidth={false} />
    </span>
  );
}
