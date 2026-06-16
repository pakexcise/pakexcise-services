"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteGuestLeadAdminAction } from "@/features/guest-leads/actions/admin-guest-lead-actions";

type DeleteSupportRequestButtonProps = {
  leadId: string;
  labels: {
    trigger: string;
    confirm: string;
    deleting: string;
    error: string;
  };
};

export function DeleteSupportRequestButton({
  leadId,
  labels,
}: DeleteSupportRequestButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(labels.confirm)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteGuestLeadAdminAction({ id: leadId });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/guest-leads");
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
