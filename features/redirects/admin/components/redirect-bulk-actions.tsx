"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  deleteAllRedirectsAction,
  resetRecommendedRedirectsAction,
} from "@/features/redirects/admin/actions/redirect-actions";
import { useRouter } from "@/i18n/navigation";

type RedirectBulkActionsProps = {
  labels: {
    clearAll: string;
    clearAllConfirm: string;
    resetRecommended: string;
    resetRecommendedConfirm: string;
  };
};

export function RedirectBulkActions({ labels }: RedirectBulkActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClearAll() {
    if (!window.confirm(labels.clearAllConfirm)) {
      return;
    }

    startTransition(async () => {
      await deleteAllRedirectsAction();
      router.refresh();
    });
  }

  function handleResetRecommended() {
    if (!window.confirm(labels.resetRecommendedConfirm)) {
      return;
    }

    startTransition(async () => {
      await resetRecommendedRedirectsAction();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleResetRecommended}
      >
        <RefreshCw className="size-4" />
        {labels.resetRecommended}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="text-destructive hover:text-destructive"
        disabled={isPending}
        onClick={handleClearAll}
      >
        <Trash2 className="size-4" />
        {labels.clearAll}
      </Button>
    </div>
  );
}
