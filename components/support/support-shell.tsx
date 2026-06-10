"use client";

import { useState } from "react";

import { SupportSidebar } from "@/components/support/support-sidebar";
import { SupportTopbar } from "@/components/support/support-topbar";
import type { SupportNavItem } from "@/config/support";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type SupportShellProps = {
  children: React.ReactNode;
  navItems: SupportNavItem[];
  userName: string;
  userEmail: string;
};

export function SupportShell({
  children,
  navItems,
  userName,
  userEmail,
}: SupportShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 lg:flex">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SupportSidebar items={navItems} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[min(100vw-2rem,18rem)] flex-col p-0">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SupportSidebar
              items={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SupportTopbar
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
