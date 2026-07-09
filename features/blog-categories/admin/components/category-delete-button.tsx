"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteBlogCategoryAction } from "@/features/blog-categories/admin/actions/category-actions";

type BlogCategoryDeleteButtonProps = {
  categoryId: string;
  postCount: number;
  childCount: number;
  labels: {
    delete: string;
    confirmDelete: string;
    deleteBlocked: string;
  };
};

export function BlogCategoryDeleteButton({
  categoryId,
  postCount,
  childCount,
  labels,
}: BlogCategoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (postCount > 0 || childCount > 0) {
      window.alert(labels.deleteBlocked);
      return;
    }

    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBlogCategoryAction({ id: categoryId });

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      router.push("/admin/blog-categories");
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
