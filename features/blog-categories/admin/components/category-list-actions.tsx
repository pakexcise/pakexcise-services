"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

import {
  deleteBlogCategoryAction,
  toggleBlogCategoryAction,
} from "@/features/blog-categories/admin/actions/category-actions";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BlogCategoryRowActionsProps = {
  id: string;
  isActive: boolean;
  postCount: number;
  childCount: number;
  labels: {
    edit: string;
    activate: string;
    deactivate: string;
    delete: string;
    deleteConfirm: string;
    deleteBlocked: string;
  };
};

export function BlogCategoryRowActions({
  id,
  isActive,
  postCount,
  childCount,
  labels,
}: BlogCategoryRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleBlogCategoryAction({ id, isActive: !isActive });
      router.refresh();
    });
  }

  function handleDelete() {
    if (postCount > 0 || childCount > 0) {
      window.alert(labels.deleteBlocked);
      return;
    }

    if (!window.confirm(labels.deleteConfirm)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBlogCategoryAction({ id });

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        asChild
        title={labels.edit}
      >
        <Link href={`/admin/blog-categories/${id}/edit`} aria-label={labels.edit}>
          <Pencil className="size-4" />
        </Link>
      </Button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          "size-8",
          isActive ? "text-amber-600 hover:text-amber-700" : "text-primary",
        )}
        disabled={isPending}
        title={isActive ? labels.deactivate : labels.activate}
        aria-label={isActive ? labels.deactivate : labels.activate}
        onClick={handleToggle}
      >
        {isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 text-destructive hover:text-destructive"
        disabled={isPending}
        title={labels.delete}
        aria-label={labels.delete}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
