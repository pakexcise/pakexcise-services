"use client";

import { useState } from "react";

import { ApplicationRealtimeSync } from "@/components/shared/application-realtime-sync";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import type { CustomerShellLabels } from "@/components/customer/customer-shell-labels";
import { CustomerTopbar } from "@/components/customer/customer-topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type CustomerShellProps = {
  children: React.ReactNode;
  userId: string;
  userName: string;
  userContactLine: string;
  labels: CustomerShellLabels;
};

export function CustomerShell({
  children,
  userId,
  userName,
  userContactLine,
  labels,
}: CustomerShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ApplicationRealtimeSync userId={userId} role="CUSTOMER" />
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <CustomerSidebar
          userName={userName}
          userContactLine={userContactLine}
          labels={labels}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(100vw-2rem,18rem)] flex-col p-0"
        >
          <CustomerSidebar
            userName={userName}
            userContactLine={userContactLine}
            labels={labels}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CustomerTopbar
          userName={userName}
          userContactLine={userContactLine}
          labels={labels.shell}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
