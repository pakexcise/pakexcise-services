"use client";

import { useTransition } from "react";

import {
  deleteBlogPostAction,
  toggleBlogPostAction,
} from "@/features/blog/admin/actions/blog-actions";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";

type BlogListActionsProps = {
  id: string;
  isPublished: boolean;
};

export function BlogPublishToggle({ id, isPublished }: BlogListActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleBlogPostAction({ id, isPublished: !isPublished });
          router.refresh();
        })
      }
    >
      {isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
}

export function BlogRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/blog/${id}/edit`}>Edit</Link>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Delete this blog post?")) return;
          startTransition(async () => {
            await deleteBlogPostAction({ id });
            router.refresh();
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
