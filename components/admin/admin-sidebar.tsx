"use client";

import { copy, createT } from "@/messages";

import { AdminNavIcon } from "@/components/admin/admin-nav-icons";
import { useAdminNavBadges } from "@/components/admin/admin-nav-badges-provider";
import {
  adminNavSectionOrder,
  type AdminNavItem,
  type AdminNavSection,
} from "@/config/admin";
import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

function resolveBadgeCount(
  href: string,
  counts: ReturnType<typeof useAdminNavBadges>,
): number {
  if (href === "/admin/notifications") {
    return counts.unreadNotifications;
  }

  if (href === "/admin/applications") {
    return counts.pendingApplications;
  }

  if (href === "/admin/reviews") {
    return counts.pendingReviews;
  }

  return 0;
}

export function AdminSidebar({
  items,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const t = createT(copy.admin.nav);
  const tSections = createT(copy.admin.navSections);
  const pathname = usePathname();
  const groupedItems = groupNavItems(items);
  const badgeCounts = useAdminNavBadges();

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
                const badgeCount = resolveBadgeCount(item.href, badgeCounts);

                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
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
                    {badgeCount > 0 ? (
                      <span className="ms-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    ) : null}
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
