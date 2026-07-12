"use client";

import { useTransition } from "react";

import {
  deleteLegalPageAction,
  toggleLegalPageActiveAction,
  toggleLegalPagePublishAction,
} from "@/features/legal-pages/admin/actions/legal-page-actions";
import { isCanonicalLegalPageSlug } from "@/features/legal-pages/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
type LegalPageListActionsProps = {
  id: string;
  slug: string;
  isPublished: boolean;
  isActive: boolean;
  publishLabel: string;
  unpublishLabel: string;
  activateLabel: string;
  deactivateLabel: string;
  editLabel: string;
  deleteLabel: string;
  deleteConfirm: string;
};

export function LegalPagePublishToggle({
  id,
  isPublished,
  publishLabel,
  unpublishLabel,
}: Pick<
  LegalPageListActionsProps,
  "id" | "isPublished" | "publishLabel" | "unpublishLabel"
>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleLegalPagePublishAction({ id, isPublished: !isPublished });
          router.refresh();
        })
      }
    >
      {isPublished ? unpublishLabel : publishLabel}
    </Button>
  );
}

export function LegalPageActiveToggle({
  id,
  isActive,
  activateLabel,
  deactivateLabel,
}: Pick<
  LegalPageListActionsProps,
  "id" | "isActive" | "activateLabel" | "deactivateLabel"
>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleLegalPageActiveAction({ id, isActive: !isActive });
          router.refresh();
        })
      }
    >
      {isActive ? deactivateLabel : activateLabel}
    </Button>
  );
}

export function LegalPageRowActions({
  id,
  slug,
  deleteLabel,
  deleteConfirm,
  editLabel,
}: Pick<
  LegalPageListActionsProps,
  "id" | "slug" | "deleteLabel" | "deleteConfirm" | "editLabel"
>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canDelete = !isCanonicalLegalPageSlug(slug);

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/legal-pages/${id}/edit`}>{editLabel}</Link>
      </Button>
      {canDelete ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm(deleteConfirm)) return;
            startTransition(async () => {
              await deleteLegalPageAction({ id });
              router.refresh();
            });
          }}
        >
          {deleteLabel}
        </Button>
      ) : null}
    </div>
  );
}
