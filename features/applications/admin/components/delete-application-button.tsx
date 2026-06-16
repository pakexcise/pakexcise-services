"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteApplicationAdminAction } from "@/features/applications/admin/actions/application-admin-actions";

type DeleteApplicationButtonProps = {
  applicationId: string;
  labels: {
    trigger: string;
    confirm: string;
    deleting: string;
    error: string;
  };
};

export function DeleteApplicationButton({
  applicationId,
  labels,
}: DeleteApplicationButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(labels.confirm)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteApplicationAdminAction({ id: applicationId });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/applications");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        className="w-full"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {isPending ? labels.deleting : labels.trigger}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
