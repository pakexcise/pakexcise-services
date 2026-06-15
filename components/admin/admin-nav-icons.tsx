import {
  ArrowRightLeft,
  Bell,
  BookOpen,
  Briefcase,
  CreditCard,
  FileStack,
  HelpCircle,
  Layers,
  LayoutDashboard,
  MapPin,
  Newspaper,
  Search,
  Settings,
  Share2,
  Shield,
  UserCircle,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-stack": FileStack,
  briefcase: Briefcase,
  layers: Layers,
  "credit-card": CreditCard,
  "map-pin": MapPin,
  "help-circle": HelpCircle,
  "share-2": Share2,
  users: Users,
  wallet: Wallet,
  "user-circle": UserCircle,
  bell: Bell,
  search: Search,
  "arrow-right-left": ArrowRightLeft,
  newspaper: Newspaper,
  "book-open": BookOpen,
  shield: Shield,
  settings: Settings,
  "user-cog": UserCog,
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
