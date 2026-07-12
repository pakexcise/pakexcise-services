"use client";

import { useTransition } from "react";

import {
  deleteGuideAction,
  toggleGuideAction,
} from "@/features/guides/admin/actions/guide-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
type GuideListActionsProps = {
  id: string;
  isPublished: boolean;
};

export function GuidePublishToggle({ id, isPublished }: GuideListActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleGuideAction({ id, isPublished: !isPublished });
          router.refresh();
        })
      }
    >
      {isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
}

export function GuideRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/guides/${id}/edit`}>Edit</Link>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Delete this guide?")) return;
          startTransition(async () => {
            await deleteGuideAction({ id });
            router.refresh();
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
