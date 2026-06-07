"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import type { AdminUserSummary } from "@/components/admin/admin-user-menu";
import type { AdminNavItem } from "@/config/admin";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type AdminShellProps = {
  children: React.ReactNode;
  navItems: AdminNavItem[];
  user: AdminUserSummary;
};

export function AdminShell({ children, navItems, user }: AdminShellProps) {
  const t = useTranslations("admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
        <div className="border-b px-4 py-4">
          <p className="text-sm font-semibold text-sidebar-primary">
            {t("panel")}
          </p>
          <p className="text-xs text-muted-foreground">{t("privateNotice")}</p>
        </div>
        <AdminSidebar items={navItems} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <div className="border-b px-4 py-4">
            <p className="text-sm font-semibold text-primary">{t("panel")}</p>
            <p className="text-xs text-muted-foreground">{t("privateNotice")}</p>
          </div>
          <AdminSidebar
            items={navItems}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
