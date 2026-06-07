import {
  ArrowRightLeft,
  Bell,
  BookOpen,
  Briefcase,
  FileStack,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Newspaper,
  Search,
  Settings,
  Share2,
  Shield,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-stack": FileStack,
  briefcase: Briefcase,
  "map-pin": MapPin,
  "help-circle": HelpCircle,
  "share-2": Share2,
  users: Users,
  "user-circle": UserCircle,
  bell: Bell,
  search: Search,
  "arrow-right-left": ArrowRightLeft,
  newspaper: Newspaper,
  "book-open": BookOpen,
  shield: Shield,
  settings: Settings,
};

export function AdminNavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? LayoutDashboard;
  return <Icon className={className} aria-hidden="true" />;
}
