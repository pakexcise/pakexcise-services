"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

import {
  deleteBlogPostAction,
  toggleBlogPostAction,
} from "@/features/blog/admin/actions/blog-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogRowActionsProps = {
  id: string;
  slug: string;
  isPublished: boolean;
  labels: {
    edit: string;
    preview: string;
    previewDisabled: string;
    publish: string;
    unpublish: string;
    delete: string;
    deleteConfirm: string;
  };
};

export function BlogRowActions({
  id,
  slug,
  isPublished,
  labels,
}: BlogRowActionsProps) {
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
      {isPublished ? (
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          asChild
          title={labels.preview}
        >
          <a
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={labels.preview}
          >
            <ExternalLink className="size-4" />
          </a>
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          disabled
          title={labels.previewDisabled}
          aria-label={labels.previewDisabled}
        >
          <ExternalLink className="size-4 opacity-40" />
        </Button>
      )}

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
  slug,
  isPublished,
}: {
  id: string;
  slug: string;
  isPublished: boolean;
}) {
  return (
    <BlogRowActions
      id={id}
      slug={slug}
      isPublished={isPublished}
      labels={{
        edit: "Edit",
        preview: "Preview public post",
        previewDisabled: "Publish the post to preview on site",
        publish: "Publish",
        unpublish: "Move to draft",
        delete: "Delete",
        deleteConfirm: "Delete this blog post?",
      }}
    />
  );
}
