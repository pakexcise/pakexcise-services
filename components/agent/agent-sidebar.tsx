"use client";

import {
  FileStack,
  LayoutDashboard,
  Plus,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { CustomerAccountAvatar } from "@/components/customer/customer-account-avatar";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { Button } from "@/components/ui/button";
import type { AgentNavItem } from "@/config/agent-nav";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<AgentNavItem["icon"], LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-stack": FileStack,
  wallet: Wallet,
  "user-round": UserRound,
};

type AgentSidebarProps = {
  navItems: readonly AgentNavItem[];
  userName: string;
  userContactLine: string;
  onNavigate?: () => void;
  className?: string;
};

export function AgentSidebar({
  navItems,
  userName,
  userContactLine,
  onNavigate,
  className,
}: AgentSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("agent.nav");
  const tShell = useTranslations("agent.shell");

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b px-4 py-4">
        <Link href="/agent/dashboard" onClick={onNavigate} className="block">
          <SiteLogo imageClassName="max-h-7" />
          <span className="mt-1 block text-xs text-muted-foreground">
            {tShell("portalLabel")}
          </span>
        </Link>
      </div>

      <div className="px-3 pt-4">
        <Button asChild className="w-full justify-start gap-2">
          <Link href="/agent/applications/new" onClick={onNavigate}>
            <Plus className="size-4" aria-hidden="true" />
            {t("newApplication")}
          </Link>
        </Button>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
        aria-label={t("ariaLabel")}
      >
        <p className="px-3 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("workspaceSection")}
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t p-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <CustomerAccountAvatar name={userName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{userName}</p>
            {userContactLine ? (
              <p className="truncate text-xs text-muted-foreground">
                {userContactLine}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
