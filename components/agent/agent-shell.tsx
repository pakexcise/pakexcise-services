"use client";

import { useState } from "react";

import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { AgentTopbar } from "@/components/agent/agent-topbar";
import type { AgentNavItem } from "@/config/agent-nav";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type AgentShellProps = {
  children: React.ReactNode;
  navItems: readonly AgentNavItem[];
  userName: string;
  userContactLine: string;
};

export function AgentShell({
  children,
  navItems,
  userName,
  userContactLine,
}: AgentShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <AgentSidebar
          navItems={navItems}
          userName={userName}
          userContactLine={userContactLine}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(100vw-2rem,18rem)] flex-col p-0"
        >
          <AgentSidebar
            navItems={navItems}
            userName={userName}
            userContactLine={userContactLine}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AgentTopbar
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
