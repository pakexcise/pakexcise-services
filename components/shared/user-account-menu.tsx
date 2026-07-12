"use client";

import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Route,
  Settings,
  User,
} from "lucide-react";
import type { UserRole } from "@prisma/client";
import { useTransition } from "react";

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
  getApplicationsPathByRole,
  getDashboardPathByRole,
  getProfilePathByRole,
  shouldShowApplicationsLink,
} from "@/features/auth/lib/dashboard-path";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import type { Route as NextRoute } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type UserAccountMenuLabels = {
  myAccount: string;
  myDashboard: string;
  dashboard: string;
  myApplications: string;
  trackApplication: string;
  profileSettings: string;
  logout: string;
  accountMenu: string;
};

type UserAccountMenuProps = {
  userName: string;
  userEmail: string;
  role: UserRole;
  labels: UserAccountMenuLabels;
  className?: string;
  variant?: "dropdown" | "mobile";
  onNavigate?: () => void;
};

function getDisplayName(userName: string, userEmail: string): string {
  const trimmedName = userName.trim();
  return trimmedName.length > 0 ? trimmedName : userEmail;
}

export function UserAccountMenu({
  userName,
  userEmail,
  role,
  labels,
  className,
  variant = "dropdown",
  onNavigate,
}: UserAccountMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const displayName = getDisplayName(userName, userEmail);
  const dashboardHref = getDashboardPathByRole(role);
  const applicationsHref = getApplicationsPathByRole(role);
  const profileHref = getProfilePathByRole(role);
  const showApplications = shouldShowApplicationsLink(role);

  function handleLogout() {
    startTransition(async () => {
      await signOut();
      onNavigate?.();
      router.push("/");
      router.refresh();
    });
  }

  if (variant === "mobile") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Button asChild className="justify-start" onClick={onNavigate}>
          <Link href={dashboardHref as NextRoute}>
            <LayoutDashboard className="size-4" aria-hidden="true" />
            {labels.myDashboard}
          </Link>
        </Button>

        {showApplications ? (
          <Button
            asChild
            variant="outline"
            className="justify-start"
            onClick={onNavigate}
          >
            <Link href={applicationsHref as NextRoute}>
              <ClipboardList className="size-4" aria-hidden="true" />
              {labels.myApplications}
            </Link>
          </Button>
        ) : null}

        <Button
          asChild
          variant="outline"
          className="justify-start"
          onClick={onNavigate}
        >
          <Link href="/track">
            <Route className="size-4" aria-hidden="true" />
            {labels.trackApplication}
          </Link>
        </Button>

        {profileHref ? (
          <Button
            asChild
            variant="outline"
            className="justify-start"
            onClick={onNavigate}
          >
            <Link href={profileHref as NextRoute}>
              <Settings className="size-4" aria-hidden="true" />
              {labels.profileSettings}
            </Link>
          </Button>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="justify-start text-destructive hover:text-destructive"
          disabled={isPending}
          onClick={handleLogout}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {labels.logout}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("max-w-[12.5rem] gap-2", className)}
          aria-label={labels.accountMenu}
        >
          <CustomerAccountAvatar
            name={displayName}
            className="size-7 text-xs"
          />
          <span className="hidden min-w-0 truncate sm:inline">
            {displayName.length > 18 ? labels.myAccount : displayName}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <CustomerAccountAvatar name={displayName} className="size-9 text-sm" />
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild onClick={onNavigate}>
          <Link href={dashboardHref as NextRoute}>
            <LayoutDashboard className="size-4" aria-hidden="true" />
            {labels.dashboard}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild onClick={onNavigate}>
          <Link href={applicationsHref as NextRoute}>
            <ClipboardList className="size-4" aria-hidden="true" />
            {labels.myApplications}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild onClick={onNavigate}>
          <Link href="/track">
            <Route className="size-4" aria-hidden="true" />
            {labels.trackApplication}
          </Link>
        </DropdownMenuItem>

        {profileHref ? (
          <DropdownMenuItem asChild onClick={onNavigate}>
            <Link href={profileHref as NextRoute}>
              <User className="size-4" aria-hidden="true" />
              {labels.profileSettings}
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isPending}
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {labels.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
