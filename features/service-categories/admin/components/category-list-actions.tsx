"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

import {
  deleteServiceCategoryAction,
  toggleServiceCategoryAction,
} from "@/features/service-categories/admin/actions/category-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ServiceCategoryRowActionsProps = {
  id: string;
  isActive: boolean;
  serviceCount: number;
  labels: {
    edit: string;
    activate: string;
    deactivate: string;
    delete: string;
    deleteConfirm: string;
    deleteBlockedActive: string;
    deleteBlockedServices: string;
  };
};

export function ServiceCategoryRowActions({
  id,
  isActive,
  serviceCount,
  labels,
}: ServiceCategoryRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleServiceCategoryAction({ id, isActive: !isActive });

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleDelete() {
    if (isActive) {
      window.alert(labels.deleteBlockedActive);
      return;
    }

    if (serviceCount > 0) {
      window.alert(labels.deleteBlockedServices);
      return;
    }

    if (!window.confirm(labels.deleteConfirm)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteServiceCategoryAction({ id });

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
        <Link
          href={`/admin/service-categories/${id}/edit`}
          aria-label={labels.edit}
        >
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
        disabled={isPending || isActive || serviceCount > 0}
        title={labels.delete}
        aria-label={labels.delete}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
