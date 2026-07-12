"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteAllRedirectsAction } from "@/features/redirects/admin/actions/redirect-actions";
type RedirectBulkActionsProps = {
  labels: {
    clearAll: string;
    clearAllConfirm: string;
    clearAllSuccess: string;
    clearAllError: string;
  };
  hasItems: boolean;
};

export function RedirectBulkActions({
  labels,
  hasItems,
}: RedirectBulkActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function handleClearAll() {
    if (!hasItems) {
      return;
    }

    if (!window.confirm(labels.clearAllConfirm)) {
      return;
    }

    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const result = await deleteAllRedirectsAction();

      if (!result.success) {
        setIsError(true);
        setMessage(result.error || labels.clearAllError);
        return;
      }

      setIsError(false);
      setMessage(
        labels.clearAllSuccess.replace(
          "{count}",
          String(result.data.deletedCount),
        ),
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        className="text-destructive hover:text-destructive"
        disabled={isPending || !hasItems}
        onClick={handleClearAll}
      >
        <Trash2 className="size-4" />
        {labels.clearAll}
      </Button>
      {message ? (
        <p
          className={
            isError
              ? "text-sm text-destructive"
              : "text-sm text-green-700 dark:text-green-400"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
