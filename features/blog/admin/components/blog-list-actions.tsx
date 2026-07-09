"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

import {
  deleteBlogPostAction,
  toggleBlogPostAction,
} from "@/features/blog/admin/actions/blog-actions";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BlogRowActionsProps = {
  id: string;
  isPublished: boolean;
  labels: {
    edit: string;
    publish: string;
    unpublish: string;
    delete: string;
    deleteConfirm: string;
  };
};

export function BlogRowActions({ id, isPublished, labels }: BlogRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish() {
    startTransition(async () => {
      await toggleBlogPostAction({ id, isPublished: !isPublished });
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(labels.deleteConfirm)) {
      return;
    }

    startTransition(async () => {
      await deleteBlogPostAction({ id });
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
        <Link href={`/admin/blog/${id}/edit`} aria-label={labels.edit}>
          <Pencil className="size-4" />
        </Link>
      </Button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn("size-8", isPublished ? "text-amber-600 hover:text-amber-700" : "text-primary")}
        disabled={isPending}
        title={isPublished ? labels.unpublish : labels.publish}
        aria-label={isPublished ? labels.unpublish : labels.publish}
        onClick={handleTogglePublish}
      >
        {isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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

/** @deprecated Use BlogRowActions instead. */
export function BlogPublishToggle({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  return (
    <BlogRowActions
      id={id}
      isPublished={isPublished}
      labels={{
        edit: "Edit",
        publish: "Publish",
        unpublish: "Move to draft",
        delete: "Delete",
        deleteConfirm: "Delete this blog post?",
      }}
    />
  );
}
