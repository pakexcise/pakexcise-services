"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "@/lib/i18n/t";

import { stopImpersonationAction } from "@/features/admin/impersonation/actions";
import { Button } from "@/components/ui/button";

type ImpersonationBannerProps = {
  targetLabel: string;
};

export function ImpersonationBanner({ targetLabel }: ImpersonationBannerProps) {
  const t = useTranslations("admin.impersonation");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExit() {
    setError(null);
    startTransition(async () => {
      const result = await stopImpersonationAction();

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.assign(result.data.redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="z-40 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-amber-950 dark:text-amber-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium">{t("bannerTitle")}</p>
            <p className="text-xs opacity-90">
              {t("bannerDescription", { user: targetLabel })}
            </p>
            {error ? (
              <p className="mt-1 text-xs text-destructive">{error}</p>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={handleExit}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {t("exit")}
        </Button>
      </div>
    </div>
  );
}
