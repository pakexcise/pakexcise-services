"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useTranslations } from "@/lib/i18n/t";
import { useTransition } from "react";

import { SiteLogo } from "@/components/shared/SiteLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

type SupportTopbarProps = {
  userName: string;
  userEmail: string;
  onMenuClick: () => void;
};

export function SupportTopbar({
  userName,
  userEmail,
  onMenuClick,
}: SupportTopbarProps) {
  const t = useTranslations("support.shell");
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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4 lg:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label={t("openMenu")}
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      <Link href="/support/dashboard" className="hidden min-w-0 lg:block">
        <SiteLogo size="portal" />
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {t("portalLabel")}
        </span>
      </Link>

      <div className="ms-auto flex min-w-0 items-center gap-1 sm:gap-2">
        <div className="hidden min-w-0 text-end sm:block">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>
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
          {t("signOut")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="sm:hidden"
          disabled={isPending}
          onClick={handleSignOut}
          aria-label={t("signOut")}
        >
          <LogOut className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
