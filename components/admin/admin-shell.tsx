"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ApplicationRealtimeSync } from "@/components/shared/application-realtime-sync";
import type { AdminUserSummary } from "@/components/admin/admin-user-menu";
import type { AdminNavItem } from "@/config/admin";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type AdminShellProps = {
  children: React.ReactNode;
  navItems: AdminNavItem[];
  user: AdminUserSummary;
};

export function AdminShell({ children, navItems, user }: AdminShellProps) {
  const t = useTranslations("admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ApplicationRealtimeSync
        userId={user.id}
        role={
          user.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"
        }
      />
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="shrink-0 border-b px-4 py-4">
          <p className="text-sm font-semibold text-sidebar-primary">
            {t("panel")}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AdminSidebar items={navItems} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[min(100vw-2rem,18rem)] flex-col p-0">
          <SheetTitle className="sr-only">{t("panel")}</SheetTitle>
          <div className="shrink-0 border-b px-4 py-4">
            <p className="text-sm font-semibold text-primary">{t("panel")}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <AdminSidebar
              items={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
