"use client";

import { useState } from "react";

import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { CustomerTopbar } from "@/components/customer/customer-topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type CustomerShellProps = {
  children: React.ReactNode;
  userName: string;
  userContactLine: string;
};

export function CustomerShell({
  children,
  userName,
  userContactLine,
}: CustomerShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <CustomerSidebar
          userName={userName}
          userContactLine={userContactLine}
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
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CustomerTopbar
          userName={userName}
          userContactLine={userContactLine}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
