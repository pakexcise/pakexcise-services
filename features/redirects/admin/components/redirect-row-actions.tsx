"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

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
    deleteError: string;
  };
};

export function RedirectRowActions({
  id,
  editHref,
  labels,
}: RedirectRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(labels.deleteConfirm)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteRedirectAction({ id });

      if (!result.success) {
        setError(result.error || labels.deleteError);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
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
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
