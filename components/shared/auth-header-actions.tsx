"use client";

import { LogIn } from "lucide-react";
import { useSyncExternalStore } from "react";

import { AuthHeaderButton } from "@/components/shared/auth-header-button";
import {
  UserAccountMenu,
  type UserAccountMenuLabels,
} from "@/components/shared/user-account-menu";
import { Button } from "@/components/ui/button";
import { getDashboardPathByRole } from "@/features/auth/lib/dashboard-path";
import { Link } from "@/i18n/navigation";
import { getUserRole } from "@/lib/auth-types";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AuthHeaderActionsProps = {
  labels: UserAccountMenuLabels & {
    login: string;
    myDashboard: string;
  };
  className?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

function AuthHeaderPlaceholder({
  loginLabel,
  className,
  variant,
}: {
  loginLabel: string;
  className?: string;
  variant: "desktop" | "mobile";
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(variant === "mobile" && "w-full justify-center", className)}
      disabled
      aria-hidden="true"
      tabIndex={-1}
    >
      <LogIn className="size-4 opacity-50" aria-hidden="true" />
      <span className="opacity-50">{loginLabel}</span>
    </Button>
  );
}

export function AuthHeaderActions({
  labels,
  className,
  variant = "desktop",
  onNavigate,
}: AuthHeaderActionsProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { data: session, isPending: sessionPending } = useSession();

  if (!mounted || sessionPending) {
    return (
      <AuthHeaderPlaceholder
        loginLabel={labels.login}
        className={className}
        variant={variant}
      />
    );
  }

  if (!session?.user) {
    return (
      <AuthHeaderButton
        loginLabel={labels.login}
        className={className}
        fullWidth={variant === "mobile"}
        onNavigate={onNavigate}
      />
    );
  }

  const role = getUserRole(session.user);
  const userName = session.user.name ?? "";
  const userEmail = session.user.email ?? "";

  if (variant === "mobile") {
    return (
      <UserAccountMenu
        userName={userName}
        userEmail={userEmail}
        role={role}
        labels={labels}
        variant="mobile"
        className={className}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        asChild
        size="sm"
        className="hidden lg:inline-flex"
        onClick={onNavigate}
      >
        <Link href={getDashboardPathByRole(role)}>
          {labels.myDashboard}
        </Link>
      </Button>

      <UserAccountMenu
        userName={userName}
        userEmail={userEmail}
        role={role}
        labels={labels}
        onNavigate={onNavigate}
      />
    </div>
  );
}
