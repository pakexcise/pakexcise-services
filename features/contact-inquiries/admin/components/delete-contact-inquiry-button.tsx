"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteContactInquiryAdminAction } from "@/features/contact-inquiries/actions/admin-contact-inquiry-actions";

import { useRouter } from "next/navigation";
type DeleteContactInquiryButtonProps = {
  inquiryId: string;
  labels: {
    trigger: string;
    confirm: string;
    deleting: string;
    error: string;
  };
};

export function DeleteContactInquiryButton({
  inquiryId,
  labels,
}: DeleteContactInquiryButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(labels.confirm)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteContactInquiryAdminAction({ id: inquiryId });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/contact-inquiries");
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
