"use client";

import { useEffect, useState } from "react";

import { AuthHeaderActions } from "@/components/shared/auth-header-actions";
import { AuthHeaderButton } from "@/components/shared/auth-header-button";
import type { UserAccountMenuLabels } from "@/components/shared/user-account-menu";

type AuthHeaderActionsLazyProps = {
  labels: UserAccountMenuLabels & {
    login: string;
    myDashboard: string;
  };
  className?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

/**
 * Guest-first chrome: show Login immediately, hydrate session after idle.
 * Avoids better-auth/get-session competing with LCP on marketing pages.
 */
export function AuthHeaderActionsLazy({
  labels,
  className,
  variant = "desktop",
  onNavigate,
}: AuthHeaderActionsLazyProps) {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const enable = () => {
      if (!cancelled) {
        setSessionReady(true);
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(enable, 1500);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!sessionReady) {
    return (
      <AuthHeaderButton
        loginLabel={labels.login}
        className={className}
        fullWidth={variant === "mobile"}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <AuthHeaderActions
      labels={labels}
      className={className}
      variant={variant}
      onNavigate={onNavigate}
    />
  );
}
