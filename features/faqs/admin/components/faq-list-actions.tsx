"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteFaqAction,
  reorderFaqsAction,
  toggleFaqActiveAction,
} from "@/features/faqs/admin/actions/faq-actions";
import type { FaqListLabels } from "@/features/faqs/admin/lib/labels";
import type { AdminFaqListItem } from "@/server/repositories/admin-faq-repository";

import Link from "next/link";
import { useRouter } from "next/navigation";
type FaqListActionsProps = {
  faq: AdminFaqListItem;
  labels: FaqListLabels;
  siblings: AdminFaqListItem[];
};

export function FaqActiveToggle({
  faq,
  labels,
}: Pick<FaqListActionsProps, "faq" | "labels">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(
    faq.isActive,
    (_current, optimisticValue: boolean) => optimisticValue,
  );

  function handleToggle() {
    const next = !optimisticActive;

    startTransition(async () => {
      setOptimisticActive(next);
      const result = await toggleFaqActiveAction({
        id: faq.id,
        isActive: next,
      });

      if (!result.success) {
        setOptimisticActive(faq.isActive);
        return;
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex"
    >
      <Badge variant={optimisticActive ? "success" : "secondary"}>
        {optimisticActive ? labels.active : labels.inactive}
      </Badge>
    </button>
  );
}

export function FaqRowActions({ faq, labels, siblings }: FaqListActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteFaqAction({ id: faq.id });

      if (!result.success) {
        return;
      }

      router.refresh();
    });
  }

  function move(direction: "up" | "down") {
    const sorted = [...siblings].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    const index = sorted.findIndex((item) => item.id === faq.id);

    if (index < 0) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= sorted.length) {
      return;
    }

    const current = sorted[index];
    const target = sorted[swapIndex];

    if (!current || !target) {
      return;
    }

    startTransition(async () => {
      await reorderFaqsAction({
        items: [
          { id: current.id, displayOrder: target.displayOrder },
          { id: target.id, displayOrder: current.displayOrder },
        ],
      });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label={labels.moveUp}
        disabled={isPending}
        onClick={() => move("up")}
      >
        <ArrowUp className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label={labels.moveDown}
        disabled={isPending}
        onClick={() => move("down")}
      >
        <ArrowDown className="size-4" aria-hidden="true" />
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/faqs/${faq.id}/edit`}>
          <Pencil className="size-4" aria-hidden="true" />
          {labels.edit}
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {labels.delete}
      </Button>
    </div>
  );
}
