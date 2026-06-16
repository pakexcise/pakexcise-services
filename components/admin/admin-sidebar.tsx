"use client";

import { useTranslations } from "next-intl";

import { AdminNavIcon } from "@/components/admin/admin-nav-icons";
import {
  adminNavSectionOrder,
  type AdminNavItem,
  type AdminNavSection,
} from "@/config/admin";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  items: AdminNavItem[];
  onNavigate?: () => void;
  className?: string;
};

function groupNavItems(items: AdminNavItem[]): Map<AdminNavSection, AdminNavItem[]> {
  const groups = new Map<AdminNavSection, AdminNavItem[]>();

  for (const item of items) {
    const section = item.section ?? "overview";
    const existing = groups.get(section) ?? [];
    existing.push(item);
    groups.set(section, existing);
  }

  return groups;
}

export function AdminSidebar({
  items,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const t = useTranslations("admin.nav");
  const tSections = useTranslations("admin.navSections");
  const pathname = usePathname();
  const groupedItems = groupNavItems(items);

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)} aria-label="Admin">
      {adminNavSectionOrder.map((section) => {
        const sectionItems = groupedItems.get(section);

        if (!sectionItems?.length) {
          return null;
        }

        return (
          <div key={section} className="mb-2 last:mb-0">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/60">
              {tSections(section)}
            </p>
            <div className="flex flex-col gap-0.5">
              {sectionItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

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
                    <span className="truncate">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
