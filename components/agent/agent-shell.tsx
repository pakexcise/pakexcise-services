"use client";

import { useState } from "react";

import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { AgentTopbar } from "@/components/agent/agent-topbar";
import type { AgentNavItem } from "@/config/agent-nav";
import { ImpersonationBanner } from "@/features/admin/impersonation/components/impersonation-banner";
import { RealtimeProvider } from "@/features/realtime/context/realtime-provider";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type AgentShellProps = {
  children: React.ReactNode;
  navItems: readonly AgentNavItem[];
  userId: string;
  userName: string;
  userContactLine: string;
  isImpersonating?: boolean;
  impersonationTargetLabel?: string;
};

export function AgentShell({
  children,
  navItems,
  userId: _userId,
  userName,
  userContactLine,
  isImpersonating = false,
  impersonationTargetLabel,
}: AgentShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RealtimeProvider>
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
            <SheetTitle className="sr-only">Agent navigation</SheetTitle>
            <AgentSidebar
              navItems={navItems}
              userName={userName}
              userContactLine={userContactLine}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isImpersonating && impersonationTargetLabel ? (
            <ImpersonationBanner targetLabel={impersonationTargetLabel} />
          ) : null}
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
    </RealtimeProvider>
  );
}
