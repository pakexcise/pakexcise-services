"use client";

import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { CustomerAccountAvatar } from "@/components/customer/customer-account-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type AccountMenuItemKey,
  getAccountMenuLinks,
} from "@/features/auth/lib/get-account-menu-links";
import { Link } from "@/i18n/navigation";
import { getUserRole } from "@/lib/auth-types";
import type { AuthSessionUser } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

export type UserAccountMenuLabels = {
  myAccount: string;
  myDashboard: string;
  myApplications: string;
  trackApplication: string;
  profile: string;
  logout: string;
};

const menuIcons: Record<AccountMenuItemKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  applications: ClipboardList,
  track: Search,
  profile: UserRound,
  logout: LogOut,
};

type UserAccountMenuProps = {
  user: AuthSessionUser;
  labels: UserAccountMenuLabels;
  compactTrigger?: boolean;
  className?: string;
  onNavigate?: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

function getMenuLabel(key: AccountMenuItemKey, labels: UserAccountMenuLabels) {
  switch (key) {
    case "dashboard":
      return labels.myDashboard;
    case "applications":
      return labels.myApplications;
    case "track":
      return labels.trackApplication;
    case "profile":
      return labels.profile;
    case "logout":
      return labels.logout;
  }
}

function getDisplayName(user: AuthSessionUser, fallback: string): string {
  const trimmedName = user.name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const emailLocal = user.email.split("@")[0]?.trim();
  return emailLocal || fallback;
}

export function UserAccountMenu({
  user,
  labels,
  compactTrigger = false,
  className,
  onNavigate,
  onLogout,
  isLoggingOut = false,
}: UserAccountMenuProps) {
  const role = getUserRole(user);
  const menuLinks = getAccountMenuLinks(role);
  const displayName = getDisplayName(user, labels.myAccount);
  const triggerLabel = displayName === labels.myAccount ? labels.myAccount : displayName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "max-w-[11rem] gap-2 px-2 sm:max-w-[13rem] sm:px-3",
            className,
          )}
          aria-label={labels.myAccount}
        >
          <CustomerAccountAvatar
            name={displayName}
            className="size-7 text-xs sm:size-8"
          />
          {!compactTrigger ? (
            <span className="hidden min-w-0 truncate sm:inline">{triggerLabel}</span>
          ) : null}
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuLinks.map((item) => {
          const Icon = menuIcons[item.key];

          if (item.key === "logout") {
            return (
              <DropdownMenuItem
                key={item.key}
                disabled={isLoggingOut}
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <Icon className="size-4" aria-hidden="true" />
                {getMenuLabel(item.key, labels)}
              </DropdownMenuItem>
            );
          }

          if (!item.href) {
            return null;
          }

          return (
            <DropdownMenuItem key={item.key} asChild>
              <Link href={item.href} onClick={onNavigate}>
                <Icon className="size-4" aria-hidden="true" />
                {getMenuLabel(item.key, labels)}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type MobileAccountMenuProps = {
  user: AuthSessionUser;
  labels: UserAccountMenuLabels;
  onNavigate?: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function MobileAccountMenu({
  user,
  labels,
  onNavigate,
  onLogout,
  isLoggingOut = false,
}: MobileAccountMenuProps) {
  const role = getUserRole(user);
  const menuLinks = getAccountMenuLinks(role);
  const displayName = getDisplayName(user, labels.myAccount);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
        <CustomerAccountAvatar name={displayName} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {menuLinks.map((item) => {
          const Icon = menuIcons[item.key];

          if (item.key === "logout") {
            return (
              <Button
                key={item.key}
                type="button"
                variant="ghost"
                className="justify-start text-destructive hover:text-destructive"
                disabled={isLoggingOut}
                onClick={onLogout}
              >
                <Icon className="size-4" aria-hidden="true" />
                {getMenuLabel(item.key, labels)}
              </Button>
            );
          }

          if (!item.href) {
            return null;
          }

          return (
            <Button
              key={item.key}
              variant="ghost"
              className="justify-start"
              asChild
              onClick={onNavigate}
            >
              <Link href={item.href}>
                <Icon className="size-4" aria-hidden="true" />
                {getMenuLabel(item.key, labels)}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
