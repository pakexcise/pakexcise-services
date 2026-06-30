"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState, useTransition } from "react";

import { AuthHeaderButton } from "@/components/shared/auth-header-button";
import {
  MobileAccountMenu,
  UserAccountMenu,
  type UserAccountMenuLabels,
} from "@/components/shared/user-account-menu";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type HeaderAuthActionsProps = {
  labels: UserAccountMenuLabels & { login: string };
  variant?: "desktop" | "mobile";
  className?: string;
  onNavigate?: () => void;
};

function AuthActionsPlaceholder({
  label,
  className,
  fullWidth = false,
}: {
  label: string;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(fullWidth && "w-full justify-start", className)}
      disabled
      aria-hidden="true"
      tabIndex={-1}
    >
      <LogIn className="size-4 opacity-50" aria-hidden="true" />
      <span className="opacity-50">{label}</span>
    </Button>
  );
}

export function HeaderAuthActions({
  labels,
  variant = "desktop",
  className,
  onNavigate,
}: HeaderAuthActionsProps) {
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
      <AuthActionsPlaceholder
        label={labels.login}
        className={className}
        fullWidth={variant === "mobile"}
      />
    );
  }

  if (!session?.user) {
    return (
      <AuthHeaderButton
        label={labels.login}
        className={className}
        fullWidth={variant === "mobile"}
        onNavigate={onNavigate}
      />
    );
  }

  if (variant === "mobile") {
    return (
      <MobileAccountMenu
        user={session.user}
        labels={labels}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        isLoggingOut={isPending}
      />
    );
  }

  return (
    <UserAccountMenu
      user={session.user}
      labels={labels}
      compactTrigger={false}
      className={className}
      onNavigate={onNavigate}
      onLogout={handleLogout}
      isLoggingOut={isPending}
    />
  );
}

// Backward-compatible export used by older imports.
export { HeaderAuthActions as AuthNav };
