"use client";

import { LogOut, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { CustomerAccountAvatar } from "@/components/customer/customer-account-avatar";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth-client";

type AgentTopbarProps = {
  userName: string;
  userContactLine: string;
  onMenuClick: () => void;
};

export function AgentTopbar({
  userName,
  userContactLine,
  onMenuClick,
}: AgentTopbarProps) {
  const t = useTranslations("agent.shell");
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
        aria-label={t("openMenu")}
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      <Link href="/agent/dashboard" className="min-w-0 lg:hidden">
        <SiteLogo imageClassName="max-h-7" />
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
        <LanguageSwitcher />
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
