import {
  ArrowRightLeft,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Contact,
  CreditCard,
  FileStack,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquare,
  Newspaper,
  Search,
  Settings,
  Share2,
  Shield,
  Tags,
  UserCircle,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-stack": FileStack,
  "message-square": MessageSquare,
  mail: Mail,
  contact: Contact,
  briefcase: Briefcase,
  layers: Layers,
  "credit-card": CreditCard,
  "map-pin": MapPin,
  "building-2": Building2,
  "file-text": FileText,
  globe: Globe,
  home: Home,
  "help-circle": HelpCircle,
  tags: Tags,
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
