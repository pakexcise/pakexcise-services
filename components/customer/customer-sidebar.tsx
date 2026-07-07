"use client";

import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import { CustomerAccountAvatar } from "@/components/customer/customer-account-avatar";
import type { CustomerShellLabels } from "@/components/customer/customer-shell-labels";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAppPathname } from "@/i18n/use-app-pathname";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/customer/profile", key: "profile" as const, icon: UserRound },
] as const;

const externalItems = [
  { href: "/services", key: "services" as const, icon: ClipboardList },
  { href: "/track", key: "track" as const, icon: Search },
] as const;

type CustomerSidebarProps = {
  userName: string;
  userContactLine: string;
  labels: CustomerShellLabels;
  onNavigate?: () => void;
  className?: string;
};

export function CustomerSidebar({
  userName,
  userContactLine,
  labels,
  onNavigate,
  className,
}: CustomerSidebarProps) {
  const pathname = useAppPathname();
  const t = labels.nav;
  const tShell = labels.shell;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b px-4 py-4">
        <Link href="/customer/dashboard" onClick={onNavigate} className="block">
          <SiteLogo size="portal" />
          <span className="mt-1 block text-xs text-muted-foreground">
            {tShell.portalLabel}
          </span>
        </Link>
      </div>

      <div className="px-3 pt-4">
        <Button asChild className="w-full justify-start gap-2">
          <Link href="/services" onClick={onNavigate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.newApplication}
          </Link>
        </Button>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-3"
        aria-label={t.ariaLabel}
      >
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t.accountSection}
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

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
                <span>{t[item.key]}</span>
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t.quickSection}
          </p>
          {externalItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{t[item.key]}</span>
                <ExternalLink
                  className="size-3.5 shrink-0 opacity-60"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
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
