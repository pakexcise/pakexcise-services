"use client";

import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { Link } from "@/i18n/navigation";
import { getUserRole } from "@/lib/auth-types";
import { signOut, useSession } from "@/lib/auth-client";

type AuthNavProps = {
  loginLabel: string;
  dashboardLabel: string;
  logoutLabel: string;
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
};

function AuthNavPlaceholder({
  loginLabel,
  className,
  compact = false,
}: Pick<AuthNavProps, "loginLabel" | "className" | "compact">) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled
      aria-hidden="true"
      tabIndex={-1}
    >
      <LogIn className="size-4 opacity-50" />
      {!compact ? <span className="opacity-50">{loginLabel}</span> : null}
    </Button>
  );
}

export function AuthNav({
  loginLabel,
  dashboardLabel,
  logoutLabel,
  className,
  compact = false,
  onNavigate,
}: AuthNavProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending: sessionPending } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLogout() {
    startTransition(async () => {
      await signOut();
      onNavigate?.();
      router.push("/");
      router.refresh();
    });
  }

  if (!mounted || sessionPending) {
    return (
      <AuthNavPlaceholder
        loginLabel={loginLabel}
        className={className}
        compact={compact}
      />
    );
  }

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        asChild
        className={className}
        onClick={onNavigate}
      >
        <Link href="/login">
          <LogIn className="size-4" />
          {compact ? (
            <span className="sr-only">{loginLabel}</span>
          ) : (
            loginLabel
          )}
        </Link>
      </Button>
    );
  }

  const role = getUserRole(session.user);
  const dashboardHref = resolvePostLoginPath(role);

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className ?? ""}`}>
      <Button variant="outline" size="sm" asChild onClick={onNavigate}>
        <Link href={dashboardHref}>
          <LayoutDashboard className="size-4" />
          {compact ? (
            <span className="sr-only">{dashboardLabel}</span>
          ) : (
            dashboardLabel
          )}
        </Link>
      </Button>
      <Button
        variant={compact ? "ghost" : "outline"}
        size={compact ? "icon" : "sm"}
        type="button"
        disabled={isPending}
        aria-label={logoutLabel}
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        {!compact ? logoutLabel : null}
      </Button>
    </div>
  );
}
