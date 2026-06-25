"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteFaqCategoryAction } from "@/features/faq-categories/admin/actions/category-actions";

type FaqCategoryDeleteButtonProps = {
  categoryId: string;
  faqCount: number;
  labels: {
    delete: string;
    confirmDelete: string;
    deleteBlocked: string;
  };
};

export function FaqCategoryDeleteButton({
  categoryId,
  faqCount,
  labels,
}: FaqCategoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (faqCount > 0) {
      window.alert(labels.deleteBlocked);
      return;
    }

    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteFaqCategoryAction({ id: categoryId });

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      router.push("/admin/faq-categories");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="size-4" aria-hidden="true" />
      {labels.delete}
    </Button>
  );
}
