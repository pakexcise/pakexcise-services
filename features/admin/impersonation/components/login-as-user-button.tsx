"use client";

import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "@/lib/i18n/t";

import { startImpersonationAction } from "@/features/admin/impersonation/actions";
import { Button } from "@/components/ui/button";

type LoginAsUserButtonProps = {
  userId: string;
  userLabel: string;
  disabled?: boolean;
  className?: string;
};

export function LoginAsUserButton({
  userId,
  userLabel,
  disabled = false,
  className,
}: LoginAsUserButtonProps) {
  const t = useTranslations("admin.impersonation");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      t("confirm", { user: userLabel }),
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await startImpersonationAction({ userId });

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.assign(result.data.redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        disabled={disabled || isPending}
        onClick={handleClick}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="size-4" aria-hidden="true" />
        )}
        {t("loginAs")}
      </Button>
      {error ? (
        <p className="max-w-[14rem] text-end text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
