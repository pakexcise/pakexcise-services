"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteServiceAction,
  reorderServicesAction,
  toggleServiceActiveAction,
} from "@/features/services/admin/actions/service-actions";
import type { AdminServiceListItem } from "@/server/repositories/admin-service-repository";

import Link from "next/link";
import { useRouter } from "next/navigation";
type ServiceListActionsProps = {
  service: AdminServiceListItem;
  labels: {
    edit: string;
    delete: string;
    confirmDelete: string;
    active: string;
    inactive: string;
    moveUp: string;
    moveDown: string;
  };
  siblings: AdminServiceListItem[];
};

export function ServiceActiveToggle({
  service,
  labels,
}: Pick<ServiceListActionsProps, "service" | "labels">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(
    service.isActive,
    (_current, optimisticValue: boolean) => optimisticValue,
  );

  function handleToggle() {
    const next = !optimisticActive;

    startTransition(async () => {
      setOptimisticActive(next);
      const result = await toggleServiceActiveAction({
        id: service.id,
        isActive: next,
      });

      if (!result.success) {
        setOptimisticActive(service.isActive);
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

export function ServiceRowActions({
  service,
  labels,
  siblings,
}: ServiceListActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteServiceAction({ id: service.id });

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
    const index = sorted.findIndex((item) => item.id === service.id);

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
      await reorderServicesAction({
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
        <Link href={`/admin/services/${service.id}/edit`}>
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
