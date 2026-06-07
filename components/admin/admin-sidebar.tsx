"use client";

import { useTranslations } from "next-intl";

import { AdminNavIcon } from "@/components/admin/admin-nav-icons";
import type { AdminNavItem } from "@/config/admin";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  items: AdminNavItem[];
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({
  items,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)} aria-label="Admin">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <AdminNavIcon name={item.icon} className="size-4 shrink-0" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
