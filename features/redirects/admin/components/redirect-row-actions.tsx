"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteRedirectAction } from "@/features/redirects/admin/actions/redirect-actions";
import { Link, useRouter } from "@/i18n/navigation";

type RedirectRowActionsProps = {
  id: string;
  editHref: string;
  labels: {
    edit: string;
    delete: string;
    deleteConfirm: string;
  };
};

export function RedirectRowActions({
  id,
  editHref,
  labels,
}: RedirectRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(labels.deleteConfirm)) {
      return;
    }

    startTransition(async () => {
      await deleteRedirectAction({ id });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="sm" variant="outline" asChild>
        <Link href={editHref}>{labels.edit}</Link>
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 text-destructive hover:text-destructive"
        disabled={isPending}
        onClick={handleDelete}
        title={labels.delete}
        aria-label={labels.delete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
