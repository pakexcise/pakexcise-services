"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useTransition } from "react";

import { CustomerAccountAvatar } from "@/components/customer/customer-account-avatar";
import type { CustomerShellLabels } from "@/components/customer/customer-shell-labels";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

type CustomerTopbarProps = {
  userName: string;
  userContactLine: string;
  labels: CustomerShellLabels["shell"];
  onMenuClick: () => void;
};

export function CustomerTopbar({
  userName,
  userContactLine,
  labels,
  onMenuClick,
}: CustomerTopbarProps) {
  const t = labels;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-3 sm:px-4 lg:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label={t.openMenu}
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      <Link href="/customer/dashboard" className="min-w-0 lg:hidden">
        <SiteLogo size="portal" />
      </Link>

      <div className="ms-auto flex min-w-0 items-center gap-1 sm:gap-2">
        <div className="hidden items-center gap-3 sm:flex">
          <CustomerAccountAvatar name={userName} />
          <div className="min-w-0 text-end">
            <p className="truncate text-sm font-medium">{userName}</p>
            {userContactLine ? (
              <p className="truncate text-xs text-muted-foreground">
                {userContactLine}
              </p>
            ) : null}
          </div>
        </div>
        <NotificationBell applicationBasePath="/customer/applications" />
        <ThemeToggle />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          disabled={isPending}
          onClick={handleSignOut}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t.signOut}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="sm:hidden"
          disabled={isPending}
          onClick={handleSignOut}
          aria-label={t.signOut}
        >
          <LogOut className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
