"use client";

import { useState, useTransition } from "react";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bulkAssignApplicationsAction } from "@/features/applications/actions";

type BulkAssignPlaceholderProps = {
  selectedIds: string[];
  labels: {
    button: string;
    pending: string;
    placeholderMessage: string;
    clear: string;
  };
  onClear: () => void;
};

export function BulkAssignPlaceholder({
  selectedIds,
  labels,
  onClear,
}: BulkAssignPlaceholderProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) {
    return null;
  }

  function handleAssign() {
    setMessage(null);

    startTransition(async () => {
      const result = await bulkAssignApplicationsAction({
        applicationIds: selectedIds,
      });

      if (!result.success) {
        setMessage(result.error);
        return;
      }

      setMessage(labels.placeholderMessage);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
      <p className="text-sm">
        {selectedIds.length} selected
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleAssign}
        disabled={isPending}
      >
        <Users className="size-4" />
        {isPending ? labels.pending : labels.button}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onClear}>
        {labels.clear}
      </Button>
      {message ? (
        <p className="w-full text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
