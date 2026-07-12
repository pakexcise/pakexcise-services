"use client";

import { useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavBadgesProvider } from "@/components/admin/admin-nav-badges-provider";
import { AdminSidebarBrand } from "@/components/admin/admin-sidebar-brand";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ApplicationRealtimeSync } from "@/components/shared/application-realtime-sync";
import type { AdminUserSummary } from "@/components/admin/admin-user-menu";
import type { AdminNavItem } from "@/config/admin";
import { ImpersonationBanner } from "@/features/admin/impersonation/components/impersonation-banner";
import { RealtimeProvider } from "@/features/realtime/context/realtime-provider";
import type { AdminNavBadgeCounts } from "@/features/admin/types/nav-badges";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
  navItems: AdminNavItem[];
  user: AdminUserSummary;
  badgeCounts: AdminNavBadgeCounts;
  isImpersonating?: boolean;
  impersonationTargetLabel?: string;
};

export function AdminShell({
  children,
  navItems,
  user,
  badgeCounts,
  isImpersonating = false,
  impersonationTargetLabel,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <RealtimeProvider>
      <AdminNavBadgesProvider initialCounts={badgeCounts}>
        <div className="flex h-dvh overflow-hidden bg-background">
          <ApplicationRealtimeSync
            userId={user.id}
            role={isSuperAdmin ? "SUPER_ADMIN" : "ADMIN"}
          />
          <aside
            className={cn(
              "hidden w-64 shrink-0 flex-col border-r lg:flex",
              isSuperAdmin ? "bg-sidebar" : "bg-sidebar",
            )}
          >
            <AdminSidebarBrand isSuperAdmin={isSuperAdmin} />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AdminSidebar items={navItems} />
            </div>
          </aside>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className="flex w-[min(100vw-2rem,18rem)] flex-col p-0"
            >
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <AdminSidebarBrand isSuperAdmin={isSuperAdmin} />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <AdminSidebar
                  items={navItems}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {isImpersonating && impersonationTargetLabel ? (
              <ImpersonationBanner targetLabel={impersonationTargetLabel} />
            ) : null}
            <AdminTopbar user={user} onMenuClick={() => setMobileOpen(true)} />
            <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminNavBadgesProvider>
    </RealtimeProvider>
  );
}
